"""Tests for snapshot normalisation.

quote.py deliberately has no Home Assistant imports, so it is importable and
testable on its own.
"""
from datetime import date

import pytest

from polr_stocks_quote import (  # loaded by conftest.py, see the note there
    SOURCE_DAILY,
    SOURCE_MINUTE,
    SOURCE_TRADE,
    parse_snapshot,
    parse_snapshots,
    resolve_previous_close,
    resolve_price,
)

# A mid-session snapshot: dailyBar is today (2024-03-14 ET), prevDailyBar is
# the 13th. Bars start at 04:00Z == 00:00 EDT, so the UTC date matches the ET
# date here; the pre-open case below is where they diverge.
OPEN_SESSION = {
    "latestTrade": {"p": 172.61, "t": "2024-03-14T15:18:24.114Z"},
    "latestQuote": {"bp": 172.60, "ap": 172.70},
    "minuteBar": {"o": 172.5, "h": 172.7, "l": 172.4, "c": 172.69, "v": 106},
    "dailyBar": {
        "t": "2024-03-14T04:00:00Z",
        "o": 170.0,
        "h": 173.71,
        "l": 169.5,
        "c": 172.61,
        "v": 56457696,
    },
    "prevDailyBar": {"t": "2024-03-13T04:00:00Z", "c": 170.0, "v": 54091719},
}


class TestResolvePrice:
    def test_prefers_the_latest_trade(self):
        assert resolve_price(OPEN_SESSION) == (172.61, SOURCE_TRADE)

    def test_falls_back_to_minute_bar_when_no_trade(self):
        snap = {**OPEN_SESSION, "latestTrade": {}}
        assert resolve_price(snap) == (172.69, SOURCE_MINUTE)

    def test_falls_back_to_daily_bar_when_iex_is_silent(self):
        # A quiet name can have no IEX prints at all for long stretches.
        snap = {**OPEN_SESSION, "latestTrade": {}, "minuteBar": {}}
        assert resolve_price(snap) == (172.61, SOURCE_DAILY)

    def test_zero_is_treated_as_absent(self):
        # Alpaca pads empty bar fields with 0; a real equity never trades at 0.
        snap = {**OPEN_SESSION, "latestTrade": {"p": 0}, "minuteBar": {"c": 0}}
        assert resolve_price(snap) == (172.61, SOURCE_DAILY)

    def test_no_data_at_all(self):
        assert resolve_price({}) == (None, None)


class TestResolvePreviousClose:
    def test_mid_session_uses_prev_daily_bar(self):
        assert resolve_previous_close(OPEN_SESSION, date(2024, 3, 14)) == 170.0

    def test_before_the_open_uses_the_daily_bar(self):
        """The regression that shows a day-old change every morning.

        Overnight, dailyBar is still yesterday's completed session. Reaching
        for prevDailyBar then measures against the session before that.
        """
        assert resolve_previous_close(OPEN_SESSION, date(2024, 3, 15)) == 172.61

    def test_weekend_uses_the_last_completed_session(self):
        assert resolve_previous_close(OPEN_SESSION, date(2024, 3, 17)) == 172.61

    def test_bar_timestamp_is_read_in_market_time(self):
        """A bar stamped 04:00Z is midnight ET the same day, not the day before."""
        snap = {
            "dailyBar": {"t": "2024-03-14T04:00:00Z", "c": 100.0},
            "prevDailyBar": {"t": "2024-03-13T04:00:00Z", "c": 90.0},
        }
        assert resolve_previous_close(snap, date(2024, 3, 14)) == 90.0

    def test_mid_session_without_a_prev_bar_is_unknown(self):
        # dailyBar is the session in progress, so it is not itself a close.
        snap = {"dailyBar": {"t": "2024-03-14T04:00:00Z", "c": 100.0}}
        assert resolve_previous_close(snap, date(2024, 3, 14)) is None

    def test_unparseable_timestamp_falls_back_to_daily_close(self):
        snap = {
            "dailyBar": {"t": "not-a-date", "c": 100.0},
            "prevDailyBar": {"c": 90.0},
        }
        assert resolve_previous_close(snap, date(2024, 3, 14)) == 100.0


class TestParseSnapshot:
    def test_computes_change_and_percent(self):
        quote = parse_snapshot("GOOGL", OPEN_SESSION, date(2024, 3, 14))
        assert quote is not None
        assert quote.symbol == "GOOGL"
        assert quote.price == 172.61
        assert quote.previous_close == 170.0
        assert quote.change == pytest.approx(2.61)
        assert quote.change_percent == pytest.approx(1.5353, abs=1e-4)

    def test_carries_session_stats(self):
        quote = parse_snapshot("GOOGL", OPEN_SESSION, date(2024, 3, 14))
        assert (quote.open, quote.high, quote.low) == (170.0, 173.71, 169.5)
        assert quote.volume == 56457696
        assert quote.last_trade_at == "2024-03-14T15:18:24.114Z"
        assert quote.price_source == SOURCE_TRADE

    def test_pre_open_change_is_flat_not_yesterdays(self):
        quote = parse_snapshot("GOOGL", OPEN_SESSION, date(2024, 3, 15))
        # Price equals the last close, so the change is flat — not the +2.61
        # that a naive prevDailyBar comparison would report every morning.
        assert quote.change == pytest.approx(0.0)

    def test_no_price_yields_no_quote(self):
        assert parse_snapshot("GOOGL", {"latestQuote": {"bp": 1.0}}) is None

    def test_empty_snapshot_yields_no_quote(self):
        assert parse_snapshot("GOOGL", {}) is None

    def test_missing_previous_close_leaves_change_none(self):
        snap = {"latestTrade": {"p": 10.0}}
        quote = parse_snapshot("X", snap, date(2024, 3, 14))
        assert quote.change is None and quote.change_percent is None

    def test_zero_previous_close_does_not_divide_by_zero(self):
        snap = {
            "latestTrade": {"p": 10.0},
            "dailyBar": {"t": "2024-03-14T04:00:00Z", "c": 0},
            "prevDailyBar": {"c": 0},
        }
        quote = parse_snapshot("X", snap, date(2024, 3, 14))
        assert quote.change_percent is None


class TestParseSnapshots:
    def test_skips_symbols_without_a_price(self):
        payload = {
            "GOOGL": OPEN_SESSION,
            "BADTICKER": {},
            "ALSOBAD": None,
            "NOTADICT": "nope",
        }
        quotes = parse_snapshots(payload, date(2024, 3, 14))
        assert list(quotes) == ["GOOGL"]

    def test_empty_payload(self):
        assert parse_snapshots({}) == {}
        assert parse_snapshots(None) == {}
