"""Diagnostics for PoLR Stocks.

Finnhub's free-tier limits are not documented anywhere machine-readable, so the
most useful thing this can report is what the API actually said about the quota
— `limit_state()` reflects the `X-Ratelimit-*` headers from the last response.
"""
from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_API_KEY, DOMAIN
from .coordinator import StocksCoordinator

# Diagnostics get pasted into bug reports.
TO_REDACT = {CONF_API_KEY}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator: StocksCoordinator | None = hass.data.get(DOMAIN, {}).get(entry.entry_id)

    data: dict[str, Any] = {
        "entry": {
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": dict(entry.options),
        }
    }

    if coordinator is None:
        data["coordinator"] = None
        return data

    data["coordinator"] = {
        "symbols": coordinator.symbols,
        "scan_interval": coordinator.scan_interval,
        "update_interval_seconds": (
            coordinator.update_interval.total_seconds()
            if coordinator.update_interval
            else None
        ),
        "last_update_success": coordinator.last_update_success,
        "consecutive_rate_limited": coordinator.rate_limited_streak,
        # The point of this file: what Finnhub reported about the quota.
        "rate_limit": coordinator.api.limit_state(),
        "quotes": {
            symbol: asdict(quote) for symbol, quote in (coordinator.data or {}).items()
        },
    }
    return data
