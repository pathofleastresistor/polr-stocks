"""PoLR Stocks — stock quotes from Alpaca's market data API."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .api import AlpacaApi
from .const import CONF_API_KEY, CONF_API_SECRET, CONF_SYMBOLS, DOMAIN
from .coordinator import StocksCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up PoLR Stocks from a config entry."""
    symbols: list[str] = list(entry.options.get(CONF_SYMBOLS, []))
    if not symbols:
        _LOGGER.warning("No symbols configured for %s", entry.title)

    api = AlpacaApi(hass, entry.data[CONF_API_KEY], entry.data[CONF_API_SECRET])
    coordinator = StocksCoordinator(hass, entry, api, symbols)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # Editing the watchlist changes which entities exist, so reload on options.
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unloaded


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload after the watchlist is edited."""
    await hass.config_entries.async_reload(entry.entry_id)
