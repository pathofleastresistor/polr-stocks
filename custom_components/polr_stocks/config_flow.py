"""Config and options flow for PoLR Stocks."""
from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .api import FinnhubApi, FinnhubApiError, FinnhubAuthError, FinnhubRateLimitError
from .const import (
    CONF_API_KEY,
    CONF_SCAN_INTERVAL,
    CONF_SYMBOLS,
    DEFAULT_SCAN_INTERVAL_SECONDS,
    DOMAIN,
    MAX_SCAN_INTERVAL_SECONDS,
    MIN_SCAN_INTERVAL_SECONDS,
)

_LOGGER = logging.getLogger(__name__)

_INTERVAL = vol.All(
    vol.Coerce(int),
    vol.Range(min=MIN_SCAN_INTERVAL_SECONDS, max=MAX_SCAN_INTERVAL_SECONDS),
)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_API_KEY): str,
        vol.Required(CONF_SYMBOLS, default="GOOGL, MSFT, NVDA"): str,
        vol.Required(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL_SECONDS): _INTERVAL,
    }
)


def parse_symbols(raw: str) -> list[str]:
    """Split a user-entered ticker list, de-duplicated and order-preserving."""
    seen: list[str] = []
    for chunk in raw.replace("\n", ",").split(","):
        symbol = chunk.strip().upper()
        if symbol and symbol not in seen:
            seen.append(symbol)
    return seen


async def _validate(
    hass, api_key: str, symbols: list[str]
) -> tuple[dict[str, str], dict[str, str]]:
    """Return (errors, placeholders) for a candidate configuration."""
    if not symbols:
        return {CONF_SYMBOLS: "no_symbols"}, {}

    api = FinnhubApi(hass, api_key)
    try:
        known = await api.async_validate(symbols)
    except FinnhubAuthError:
        return {"base": "invalid_auth"}, {}
    except FinnhubRateLimitError:
        return {"base": "rate_limited"}, {}
    except FinnhubApiError as err:
        _LOGGER.debug("Finnhub validation failed: %s", err)
        return {"base": "cannot_connect"}, {}

    unknown = [s for s in symbols if s not in known]
    if unknown:
        # Name the bad tickers — "cannot_connect" for a typo is maddening.
        return {CONF_SYMBOLS: "unknown_symbols"}, {"symbols": ", ".join(unknown)}

    return {}, {}


class PolrStocksConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the initial setup."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}

        if user_input is not None:
            api_key = user_input[CONF_API_KEY].strip()
            symbols = parse_symbols(user_input[CONF_SYMBOLS])

            errors, placeholders = await _validate(self.hass, api_key, symbols)

            if not errors:
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title="Stocks",
                    data={CONF_API_KEY: api_key},
                    options={
                        CONF_SYMBOLS: symbols,
                        CONF_SCAN_INTERVAL: user_input[CONF_SCAN_INTERVAL],
                    },
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
            description_placeholders=placeholders,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> PolrStocksOptionsFlow:
        return PolrStocksOptionsFlow()


class PolrStocksOptionsFlow(config_entries.OptionsFlow):
    """Edit the watchlist and poll rate without re-entering the key."""

    async def async_step_init(self, user_input=None):
        entry = self.config_entry
        current: list[str] = entry.options.get(CONF_SYMBOLS, [])
        interval: int = entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_SECONDS)

        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}

        if user_input is not None:
            symbols = parse_symbols(user_input[CONF_SYMBOLS])
            errors, placeholders = await _validate(
                self.hass, entry.data[CONF_API_KEY], symbols
            )
            if not errors:
                return self.async_create_entry(
                    data={
                        CONF_SYMBOLS: symbols,
                        CONF_SCAN_INTERVAL: user_input[CONF_SCAN_INTERVAL],
                    }
                )
            current = symbols or current
            interval = user_input[CONF_SCAN_INTERVAL]

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SYMBOLS, default=", ".join(current)): str,
                    vol.Required(CONF_SCAN_INTERVAL, default=interval): _INTERVAL,
                }
            ),
            errors=errors,
            description_placeholders=placeholders,
        )
