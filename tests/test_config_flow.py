"""Tests for ticker normalisation in the config flow.

The chip selector hands back a list, but a string still arrives from two
directions — config entries written before the chip field existed, and a user
pasting a comma-separated list into a single chip — so parse_symbols has to
accept both.

Needs Home Assistant, so these skip unless it is importable. See
test_frontend.py for the container command.
"""
import pytest

pytest.importorskip("homeassistant.helpers.selector")

from custom_components.polr_stocks.config_flow import parse_symbols  # noqa: E402


class TestParseSymbols:
    def test_accepts_the_selector_list(self):
        assert parse_symbols(["GOOGL", "MSFT"]) == ["GOOGL", "MSFT"]

    def test_accepts_a_legacy_comma_string(self):
        # How entries written by earlier versions store it.
        assert parse_symbols("GOOGL, MSFT, NVDA") == ["GOOGL", "MSFT", "NVDA"]

    def test_splits_a_pasted_list_inside_one_chip(self):
        # Pasting rather than typing one at a time must not create a single
        # chip called "GOOGL, MSFT".
        assert parse_symbols(["GOOGL, MSFT", "NVDA"]) == ["GOOGL", "MSFT", "NVDA"]

    def test_uppercases_and_trims(self):
        assert parse_symbols([" googl ", "msft"]) == ["GOOGL", "MSFT"]

    def test_deduplicates_preserving_order(self):
        assert parse_symbols(["MSFT", "GOOGL", "msft"]) == ["MSFT", "GOOGL"]

    def test_drops_empties(self):
        assert parse_symbols(["GOOGL", "", "  ", ","]) == ["GOOGL"]

    def test_handles_newlines(self):
        assert parse_symbols("GOOGL\nMSFT") == ["GOOGL", "MSFT"]

    def test_none_and_empty(self):
        assert parse_symbols(None) == []
        assert parse_symbols([]) == []
        assert parse_symbols("") == []


class TestSchema:
    """The form must be buildable in both shapes it is shown in."""

    def test_setup_form_includes_the_key(self):
        from custom_components.polr_stocks.config_flow import _schema
        from custom_components.polr_stocks.const import (
            CONF_API_KEY,
            CONF_SCAN_INTERVAL,
            CONF_SYMBOLS,
        )

        schema = _schema(symbols=[], interval=60, include_key=True)
        keys = {str(k) for k in schema.schema}
        assert {CONF_API_KEY, CONF_SYMBOLS, CONF_SCAN_INTERVAL} == keys

    def test_options_form_omits_the_key(self):
        from custom_components.polr_stocks.config_flow import _schema
        from custom_components.polr_stocks.const import CONF_API_KEY

        schema = _schema(symbols=["GOOGL"], interval=90, include_key=False)
        assert CONF_API_KEY not in {str(k) for k in schema.schema}

    def test_current_symbols_seed_the_chip_options(self):
        """Without this the existing tickers render as bare values, not chips."""
        from custom_components.polr_stocks.config_flow import _symbols_selector

        selector = _symbols_selector(["GOOGL", "MSFT"])
        assert selector.config["options"] == ["GOOGL", "MSFT"]
        assert selector.config["multiple"] is True
        assert selector.config["custom_value"] is True
