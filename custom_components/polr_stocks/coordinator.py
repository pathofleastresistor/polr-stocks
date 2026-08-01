"""Poll Alpaca for the whole watchlist in one request."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import AlpacaApi, AlpacaApiError, AlpacaAuthError
from .const import (
    DOMAIN,
    UPDATE_INTERVAL_CLOSED_SECONDS,
    UPDATE_INTERVAL_OPEN_SECONDS,
)
from .quote import Quote, parse_snapshots

_LOGGER = logging.getLogger(__name__)


class StocksCoordinator(DataUpdateCoordinator[dict[str, Quote]]):
    """Fetch snapshots for every configured symbol on one schedule."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        api: AlpacaApi,
        symbols: list[str],
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            config_entry=entry,
            update_interval=timedelta(seconds=UPDATE_INTERVAL_OPEN_SECONDS),
            # Quotes repeat constantly outside market hours; skipping identical
            # payloads keeps the state machine and recorder quiet.
            always_update=False,
        )
        self.api = api
        self.symbols = symbols

    async def _async_update_data(self) -> dict[str, Quote]:
        await self._async_apply_market_interval()

        try:
            payload = await self.api.async_get_snapshots(self.symbols)
        except AlpacaAuthError as err:
            # Credentials went bad — prompt reauth rather than retry forever.
            raise UpdateFailed(f"Alpaca authentication failed: {err}") from err
        except AlpacaApiError as err:
            raise UpdateFailed(str(err)) from err

        quotes = parse_snapshots(payload)

        missing = [s for s in self.symbols if s not in quotes]
        if missing:
            _LOGGER.debug("No usable quote for %s", ", ".join(missing))
        if not quotes:
            raise UpdateFailed("Alpaca returned no usable quotes")

        return quotes

    async def _async_apply_market_interval(self) -> None:
        """Poll every minute while open, and rarely while closed."""
        clock = await self.api.async_get_clock()
        # No clock reading means assume open — better to over-poll (still far
        # under the rate limit) than to freeze prices during the session.
        is_open = True if clock is None else bool(clock.get("is_open", True))

        wanted = timedelta(
            seconds=UPDATE_INTERVAL_OPEN_SECONDS
            if is_open
            else UPDATE_INTERVAL_CLOSED_SECONDS
        )
        if self.update_interval != wanted:
            _LOGGER.debug(
                "Market %s — polling every %ss",
                "open" if is_open else "closed",
                int(wanted.total_seconds()),
            )
            self.update_interval = wanted
