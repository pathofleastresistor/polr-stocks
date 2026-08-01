"""Config and options flow for PoLR Stocks."""
from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .api import AlpacaApi, AlpacaApiError, AlpacaAuthError
from .const import CONF_API_KEY, CONF_API_SECRET, CONF_SYMBOLS, DOMAIN

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_API_KEY): str,
        vol.Required(CONF_API_SECRET): str,
        vol.Required(CONF_SYMBOLS, default="GOOGL, MSFT, NVDA"): str,
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
    hass, api_key: str, api_secret: str, symbols: list[str]
) -> tuple[dict[str, str], dict[str, str]]:
    """Return (errors, placeholders) for a candidate configuration."""
    if not symbols:
        return {CONF_SYMBOLS: "no_symbols"}, {}

    api = AlpacaApi(hass, api_key, api_secret)
    try:
        known = await api.async_validate(symbols)
    except AlpacaAuthError:
        return {"base": "invalid_auth"}, {}
    except AlpacaApiError as err:
        _LOGGER.debug("Alpaca validation failed: %s", err)
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
            api_secret = user_input[CONF_API_SECRET].strip()
            symbols = parse_symbols(user_input[CONF_SYMBOLS])

            errors, placeholders = await _validate(self.hass, api_key, api_secret, symbols)

            if not errors:
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title="Stocks",
                    data={CONF_API_KEY: api_key, CONF_API_SECRET: api_secret},
                    options={CONF_SYMBOLS: symbols},
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
    """Edit the watchlist without re-entering credentials."""

    async def async_step_init(self, user_input=None):
        entry = self.config_entry
        current: list[str] = entry.options.get(CONF_SYMBOLS, [])

        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}

        if user_input is not None:
            symbols = parse_symbols(user_input[CONF_SYMBOLS])
            errors, placeholders = await _validate(
                self.hass,
                entry.data[CONF_API_KEY],
                entry.data[CONF_API_SECRET],
                symbols,
            )
            if not errors:
                return self.async_create_entry(data={CONF_SYMBOLS: symbols})
            current = symbols or current

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Required(CONF_SYMBOLS, default=", ".join(current)): str}
            ),
            errors=errors,
            description_placeholders=placeholders,
        )
