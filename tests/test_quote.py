"""Tests for Finnhub quote normalisation and market hours.

quote.py deliberately has no Home Assistant imports, so it is importable and
testable on its own.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from polr_stocks_quote import (  # loaded by conftest.py, see the note there
    MARKET_TZ,
    is_market_open,
    parse_quote,
)

# A live mid-session quote.
QUOTE = {
    "c": 172.61,
    "d": 2.61,
    "dp": 1.5353,
    "h": 173.71,
    "l": 169.5,
    "o": 170.0,
    "pc": 170.0,
    "t": 1710428304,
}

# What Finnhub returns for a ticker it does not know: zeros, not an error.
UNKNOWN = {"c": 0, "d": None, "dp": None, "h": 0, "l": 0, "o": 0, "pc": 0, "t": 0}

ET = MARKET_TZ


class TestParseQuote:
    def test_reads_price_and_change(self):
        quote = parse_quote("GOOGL", QUOTE)
        assert quote is not None
        assert quote.symbol == "GOOGL"
        assert quote.price == 172.61
        assert quote.change == pytest.approx(2.61)
        assert quote.change_percent == pytest.approx(1.5353)
        assert quote.previous_close == 170.0

    def test_carries_session_stats(self):
        quote = parse_quote("GOOGL", QUOTE)
        assert (quote.open, quote.high, quote.low) == (170.0, 173.71, 169.5)

    def test_converts_epoch_timestamp_to_iso(self):
        quote = parse_quote("GOOGL", QUOTE)
        assert quote.quoted_at is not None
        assert quote.quoted_at.startswith("2024-03-14T")

    def test_unknown_ticker_yields_no_quote(self):
        # The zeros are why a 0 price is treated as absent everywhere.
        assert parse_quote("NOPE", UNKNOWN) is None

    def test_empty_payload_yields_no_quote(self):
        assert parse_quote("GOOGL", {}) is None

    def test_a_flat_day_is_not_a_missing_change(self):
        quote = parse_quote("NVDA", {**QUOTE, "d": 0, "dp": 0})
        assert quote.change == 0
        assert quote.change_percent == 0

    def test_derives_change_when_finnhub_omits_it(self):
        quote = parse_quote("GOOGL", {"c": 172.61, "pc": 170.0})
        assert quote.change == pytest.approx(2.61)
        assert quote.change_percent == pytest.approx(1.5353, abs=1e-4)

    def test_no_previous_close_leaves_change_unknown(self):
        quote = parse_quote("GOOGL", {"c": 172.61})
        assert quote.change is None and quote.change_percent is None

    def test_bad_timestamp_is_dropped_not_fatal(self):
        quote = parse_quote("GOOGL", {**QUOTE, "t": "nonsense"})
        assert quote is not None and quote.quoted_at is None


class TestIsMarketOpen:
    def test_open_mid_session(self):
        assert is_market_open(datetime(2024, 3, 14, 12, 0, tzinfo=ET)) is True

    def test_closed_before_the_bell(self):
        assert is_market_open(datetime(2024, 3, 14, 9, 29, tzinfo=ET)) is False

    def test_open_exactly_at_the_bell(self):
        assert is_market_open(datetime(2024, 3, 14, 9, 30, tzinfo=ET)) is True

    def test_closed_exactly_at_the_close(self):
        # 16:00 is the close, not still trading.
        assert is_market_open(datetime(2024, 3, 14, 16, 0, tzinfo=ET)) is False

    def test_closed_at_the_weekend(self):
        assert is_market_open(datetime(2024, 3, 16, 12, 0, tzinfo=ET)) is False
        assert is_market_open(datetime(2024, 3, 17, 12, 0, tzinfo=ET)) is False

    def test_converts_from_other_timezones(self):
        """17:00 UTC is 13:00 ET — open, despite being outside 9:30-16:00 UTC."""
        utc_noon_et = datetime(2024, 3, 14, 17, 0, tzinfo=ZoneInfo("UTC"))
        assert is_market_open(utc_noon_et) is True

    def test_uses_market_time_not_local_time(self):
        """A Seattle evening is still a closed market, not an open one."""
        pacific = datetime(2024, 3, 14, 18, 0, tzinfo=ZoneInfo("America/Los_Angeles"))
        assert is_market_open(pacific) is False
