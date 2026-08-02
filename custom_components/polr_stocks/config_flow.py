"""Config and options flow for PoLR Stocks."""
from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

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


def parse_symbols(raw: str | list[str] | None) -> list[str]:
    """Normalise entered tickers, de-duplicated and order-preserving.

    Accepts the chip selector's list as well as a plain string, because a
    string still arrives from two directions: config entries written by
    earlier versions, and a user pasting "GOOGL, MSFT" into a single chip
    rather than typing them one at a time.
    """
    if raw is None:
        return []
    chunks = raw if isinstance(raw, list) else [raw]

    seen: list[str] = []
    for chunk in chunks:
        for part in str(chunk).replace("\n", ",").split(","):
            symbol = part.strip().upper()
            if symbol and symbol not in seen:
                seen.append(symbol)
    return seen


def _symbols_selector(current: list[str]) -> SelectSelector:
    """A chip field: type a ticker, press enter, click x to drop one.

    `options` seeds the already-chosen tickers so they render as labelled
    chips; `custom_value` is what allows anything else to be typed, since
    there is no fixed universe of symbols to offer. Unsorted on purpose — the
    list order is the card's default row order.
    """
    return SelectSelector(
        SelectSelectorConfig(
            options=current,
            multiple=True,
            custom_value=True,
            sort=False,
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _interval_selector() -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=MIN_SCAN_INTERVAL_SECONDS,
            max=MAX_SCAN_INTERVAL_SECONDS,
            # step=1, not a friendlier 15: in a box the step also drives HTML5
            # validation, so a coarse step rejects typed values that aren't a
            # multiple of it (100 would be refused with step=15).
            step=1,
            mode=NumberSelectorMode.BOX,
            unit_of_measurement="seconds",
        )
    )


def _schema(
    *, symbols: list[str], interval: int, include_key: bool
) -> vol.Schema:
    """Build the form. The key only appears during initial setup."""
    fields: dict = {}
    if include_key:
        fields[vol.Required(CONF_API_KEY)] = TextSelector(
            TextSelectorConfig(type=TextSelectorType.PASSWORD)
        )
    fields[vol.Required(CONF_SYMBOLS, default=symbols)] = _symbols_selector(symbols)
    fields[vol.Required(CONF_SCAN_INTERVAL, default=interval)] = _interval_selector()
    return vol.Schema(fields)


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
        symbols: list[str] = []
        interval = DEFAULT_SCAN_INTERVAL_SECONDS

        if user_input is not None:
            api_key = user_input[CONF_API_KEY].strip()
            symbols = parse_symbols(user_input[CONF_SYMBOLS])
            # NumberSelector hands back a float.
            interval = int(user_input[CONF_SCAN_INTERVAL])

            errors, placeholders = await _validate(self.hass, api_key, symbols)

            if not errors:
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title="Stocks",
                    data={CONF_API_KEY: api_key},
                    options={CONF_SYMBOLS: symbols, CONF_SCAN_INTERVAL: interval},
                )

        return self.async_show_form(
            step_id="user",
            # Re-shown with what was typed, so a rejected ticker can be fixed
            # rather than re-entered from scratch.
            data_schema=_schema(symbols=symbols, interval=interval, include_key=True),
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
        # parse_symbols, not a bare get: an entry written before the chip field
        # existed still holds a comma-separated string here.
        current = parse_symbols(entry.options.get(CONF_SYMBOLS))
        interval = int(entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_SECONDS))

        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}

        if user_input is not None:
            symbols = parse_symbols(user_input[CONF_SYMBOLS])
            interval = int(user_input[CONF_SCAN_INTERVAL])
            errors, placeholders = await _validate(
                self.hass, entry.data[CONF_API_KEY], symbols
            )
            if not errors:
                return self.async_create_entry(
                    data={CONF_SYMBOLS: symbols, CONF_SCAN_INTERVAL: interval}
                )
            current = symbols or current

        return self.async_show_form(
            step_id="init",
            data_schema=_schema(symbols=current, interval=interval, include_key=False),
            errors=errors,
            description_placeholders=placeholders,
        )
