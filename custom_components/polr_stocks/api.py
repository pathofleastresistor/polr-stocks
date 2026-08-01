"""Async Finnhub client.

Uses Home Assistant's shared aiohttp session rather than opening its own, and
distinguishes auth failures from transport failures so the config flow can tell
the user which one happened.

Finnhub's free tier documents 60 calls/minute. Reports of an additional daily
cap circulate but are unconfirmed, and the docs are JS-rendered so the real
figure can't be read programmatically. Rather than hard-code a guess, this
client reads the `X-Ratelimit-*` headers Finnhub returns and refuses to spend
the last of a window — so whatever the true limit is, it is respected, and
`limit_state()` reports what was actually observed.
"""
from __future__ import annotations

import logging
import time
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import FINNHUB_API_BASE, RATE_LIMIT_RESERVE, REQUEST_TIMEOUT_SECONDS

_LOGGER = logging.getLogger(__name__)


class FinnhubApiError(Exception):
    """A request to Finnhub failed."""


class FinnhubAuthError(FinnhubApiError):
    """The API key was rejected."""


class FinnhubRateLimitError(FinnhubApiError):
    """The rate limit was hit. Callers should keep their previous data."""

    def __init__(self, message: str, retry_after: float) -> None:
        super().__init__(message)
        self.retry_after = retry_after


class FinnhubApi:
    """Minimal Finnhub client: quotes and symbol validation."""

    def __init__(self, hass: HomeAssistant, api_key: str) -> None:
        self._hass = hass
        self._api_key = api_key
        # Latest values seen on X-Ratelimit-* headers.
        self._limit: int | None = None
        self._remaining: int | None = None
        self._reset_at: float | None = None
        # Monotonic deadline before which no request should be made.
        self._blocked_until: float = 0.0

    # ------------------------------------------------------------------
    # Rate limit bookkeeping
    # ------------------------------------------------------------------

    def limit_state(self) -> dict[str, Any]:
        """What the headers last reported — surfaced for logging/diagnostics."""
        return {"limit": self._limit, "remaining": self._remaining, "reset_at": self._reset_at}

    def _note_headers(self, headers) -> None:
        def as_int(name: str) -> int | None:
            raw = headers.get(name)
            if raw is None:
                return None
            try:
                return int(float(raw))
            except (TypeError, ValueError):
                return None

        limit = as_int("X-Ratelimit-Limit")
        remaining = as_int("X-Ratelimit-Remaining")
        reset = as_int("X-Ratelimit-Reset")

        if limit is not None and limit != self._limit:
            # Logged once per change so the real free-tier limit is discoverable
            # from a user's own key rather than from folklore.
            _LOGGER.info("Finnhub rate limit reported as %s per window", limit)
        if limit is not None:
            self._limit = limit
        if remaining is not None:
            self._remaining = remaining
        if reset is not None:
            # Finnhub sends an absolute epoch second.
            self._reset_at = float(reset)

    def _window_seconds_left(self) -> float:
        if self._reset_at is None:
            return 0.0
        return max(0.0, self._reset_at - time.time())

    def should_pause(self) -> bool:
        """True when spending another call risks a 429."""
        if time.monotonic() < self._blocked_until:
            return True
        if self._remaining is None:
            return False
        return self._remaining <= RATE_LIMIT_RESERVE and self._window_seconds_left() > 0

    def _block_for(self, seconds: float) -> None:
        self._blocked_until = time.monotonic() + max(1.0, seconds)

    # ------------------------------------------------------------------
    # Requests
    # ------------------------------------------------------------------

    async def _get(self, path: str, params: dict[str, Any]) -> Any:
        if self.should_pause():
            raise FinnhubRateLimitError(
                "Pausing to stay inside Finnhub's rate limit",
                self._window_seconds_left(),
            )

        session = async_get_clientsession(self._hass)
        try:
            async with session.get(
                f"{FINNHUB_API_BASE}{path}",
                params={**params, "token": self._api_key},
                timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT_SECONDS),
            ) as resp:
                self._note_headers(resp.headers)

                if resp.status == 429:
                    retry_after = self._window_seconds_left() or 60.0
                    self._block_for(retry_after)
                    raise FinnhubRateLimitError(
                        "Finnhub rate limit reached", retry_after
                    )
                if resp.status in (401, 403):
                    raise FinnhubAuthError(f"Finnhub rejected the API key ({resp.status})")
                if resp.status != 200:
                    body = await resp.text()
                    raise FinnhubApiError(f"Finnhub returned {resp.status}: {body[:200]}")
                return await resp.json()
        except FinnhubApiError:
            raise
        except aiohttp.ClientError as err:
            raise FinnhubApiError(f"Could not reach Finnhub: {err}") from err
        except TimeoutError as err:
            raise FinnhubApiError("Finnhub request timed out") from err

    async def async_get_quote(self, symbol: str) -> dict[str, Any]:
        """Raw /quote payload for one symbol."""
        data = await self._get("/quote", {"symbol": symbol})
        if not isinstance(data, dict):
            raise FinnhubApiError(f"Unexpected quote payload: {type(data).__name__}")
        return data

    async def async_validate(self, symbols: list[str]) -> list[str]:
        """Check the key and return the subset of symbols Finnhub knows.

        An unknown ticker is not an error to Finnhub — it returns zeros — so
        a zero price is what identifies one.
        """
        known: list[str] = []
        for symbol in symbols:
            payload = await self.async_get_quote(symbol)
            price = payload.get("c")
            try:
                if price is not None and float(price) != 0:
                    known.append(symbol)
            except (TypeError, ValueError):
                continue
        return known
