"""Async Alpaca market-data client.

Uses Home Assistant's shared aiohttp session rather than opening its own, and
distinguishes auth failures from transport failures so the config flow can tell
the user which one happened.
"""
from __future__ import annotations

import logging
import time
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    ALPACA_DATA_BASE,
    ALPACA_TRADING_BASE,
    CLOCK_CACHE_SECONDS,
    FEED,
    REQUEST_TIMEOUT_SECONDS,
)

_LOGGER = logging.getLogger(__name__)


class AlpacaApiError(Exception):
    """A request to Alpaca failed."""


class AlpacaAuthError(AlpacaApiError):
    """The API key/secret pair was rejected."""


class AlpacaApi:
    """Minimal Alpaca client: snapshots + market clock."""

    def __init__(self, hass: HomeAssistant, api_key: str, api_secret: str) -> None:
        self._hass = hass
        self._headers = {
            "APCA-API-KEY-ID": api_key,
            "APCA-API-SECRET-KEY": api_secret,
            "accept": "application/json",
        }
        self._clock: dict[str, Any] | None = None
        self._clock_fetched_at: float = 0.0

    async def _get(self, url: str, params: dict[str, Any] | None = None) -> Any:
        session = async_get_clientsession(self._hass)
        try:
            async with session.get(
                url,
                headers=self._headers,
                params=params,
                timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT_SECONDS),
            ) as resp:
                if resp.status in (401, 403):
                    raise AlpacaAuthError(f"Alpaca rejected the credentials ({resp.status})")
                if resp.status != 200:
                    body = await resp.text()
                    raise AlpacaApiError(f"Alpaca returned {resp.status}: {body[:200]}")
                return await resp.json()
        except AlpacaApiError:
            raise
        except aiohttp.ClientError as err:
            raise AlpacaApiError(f"Could not reach Alpaca: {err}") from err
        except TimeoutError as err:
            raise AlpacaApiError("Alpaca request timed out") from err

    async def async_get_snapshots(self, symbols: list[str]) -> dict[str, Any]:
        """Snapshots for every symbol in a single request."""
        if not symbols:
            return {}

        data = await self._get(
            f"{ALPACA_DATA_BASE}/v2/stocks/snapshots",
            params={"symbols": ",".join(symbols), "feed": FEED},
        )

        # Newer responses nest under "snapshots"; older ones are keyed by symbol
        # at the top level. Accept both so a shape change doesn't blank the card.
        if isinstance(data, dict) and isinstance(data.get("snapshots"), dict):
            return data["snapshots"]
        if isinstance(data, dict):
            return {k: v for k, v in data.items() if isinstance(v, dict)}
        raise AlpacaApiError(f"Unexpected snapshots payload: {type(data).__name__}")

    async def async_get_clock(self) -> dict[str, Any] | None:
        """Market clock, cached — it only matters to the nearest few minutes.

        Returns None if the clock can't be read; callers should treat that as
        "assume open" so a clock outage can't silently stop price updates.
        """
        now = time.monotonic()
        if self._clock is not None and (now - self._clock_fetched_at) < CLOCK_CACHE_SECONDS:
            return self._clock

        try:
            clock = await self._get(f"{ALPACA_TRADING_BASE}/v2/clock")
        except AlpacaApiError as err:
            _LOGGER.debug("Market clock unavailable, assuming open: %s", err)
            return None

        if not isinstance(clock, dict):
            return None
        self._clock = clock
        self._clock_fetched_at = now
        return clock

    async def async_validate(self, symbols: list[str]) -> list[str]:
        """Check credentials and return the subset of symbols Alpaca knows.

        Raises AlpacaAuthError / AlpacaApiError so the config flow can map them
        onto distinct error messages.
        """
        snapshots = await self.async_get_snapshots(symbols)
        # An unknown ticker comes back either absent or as an empty object.
        return [s for s in symbols if snapshots.get(s)]
