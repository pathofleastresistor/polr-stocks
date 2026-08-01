"""Poll Finnhub for each configured symbol."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import FinnhubApi, FinnhubApiError, FinnhubAuthError, FinnhubRateLimitError
from .const import CLOSED_INTERVAL_SECONDS, DOMAIN
from .quote import Quote, is_market_open, parse_quote

_LOGGER = logging.getLogger(__name__)


class StocksCoordinator(DataUpdateCoordinator[dict[str, Quote]]):
    """Fetch a quote per symbol, one request each."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        api: FinnhubApi,
        symbols: list[str],
        scan_interval: int,
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            config_entry=entry,
            update_interval=timedelta(seconds=scan_interval),
            # Quotes repeat constantly outside market hours; skipping identical
            # payloads keeps the state machine and recorder quiet.
            always_update=False,
        )
        self.api = api
        self.symbols = symbols
        self._open_interval = timedelta(seconds=scan_interval)

    async def _async_update_data(self) -> dict[str, Quote]:
        self._apply_market_interval()

        quotes: dict[str, Quote] = dict(self.data or {})
        fetched = 0
        errors: list[str] = []

        for symbol in self.symbols:
            try:
                payload = await self.api.async_get_quote(symbol)
            except FinnhubAuthError as err:
                # Credentials went bad — no amount of retrying fixes it.
                raise UpdateFailed(f"Finnhub authentication failed: {err}") from err
            except FinnhubRateLimitError as err:
                # Deliberately not fatal: keep the prices already on screen
                # rather than blanking the card over a rate limit.
                _LOGGER.warning(
                    "Finnhub rate limit reached after %d/%d symbols; keeping last "
                    "known prices and retrying in %.0fs. Observed limits: %s",
                    fetched,
                    len(self.symbols),
                    err.retry_after,
                    self.api.limit_state(),
                )
                break
            except FinnhubApiError as err:
                errors.append(f"{symbol}: {err}")
                continue

            quote = parse_quote(symbol, payload)
            if quote is None:
                _LOGGER.debug("No usable quote for %s", symbol)
                continue
            quotes[symbol] = quote
            fetched += 1

        if not quotes:
            raise UpdateFailed(
                "; ".join(errors) if errors else "Finnhub returned no usable quotes"
            )
        if errors:
            _LOGGER.debug("Some symbols failed: %s", "; ".join(errors))

        return quotes

    def _apply_market_interval(self) -> None:
        """Poll at the configured rate while open, rarely while closed.

        Market hours are computed locally, so this costs no API calls — which
        matters when the free tier's true daily budget is unknown.
        """
        wanted = (
            self._open_interval
            if is_market_open()
            else timedelta(seconds=CLOSED_INTERVAL_SECONDS)
        )
        if self.update_interval != wanted:
            _LOGGER.debug("Polling every %ss", int(wanted.total_seconds()))
            self.update_interval = wanted
