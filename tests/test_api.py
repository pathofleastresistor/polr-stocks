"""Tests for Finnhub rate-limit bookkeeping.

The free tier's true limits are not documented anywhere machine-readable, so the
client adapts to whatever the X-Ratelimit-* headers report rather than assuming.
That logic is what these cover.

Needs Home Assistant, so they skip unless it is importable. See test_frontend.py
for the container command.
"""
import time

import pytest

pytest.importorskip("homeassistant.helpers.aiohttp_client")

from custom_components.polr_stocks.api import FinnhubApi  # noqa: E402
from custom_components.polr_stocks.const import RATE_LIMIT_RESERVE  # noqa: E402


def make_api():
    return FinnhubApi(hass=None, api_key="test-key")


def headers(limit=None, remaining=None, reset=None):
    out = {}
    if limit is not None:
        out["X-Ratelimit-Limit"] = str(limit)
    if remaining is not None:
        out["X-Ratelimit-Remaining"] = str(remaining)
    if reset is not None:
        out["X-Ratelimit-Reset"] = str(reset)
    return out


def test_no_headers_means_no_pause():
    """Never throttle on a guess — only on what the API actually reported."""
    api = make_api()
    assert api.should_pause() is False
    assert api.limit_state() == {"limit": None, "remaining": None, "reset_at": None}


def test_records_reported_limits():
    api = make_api()
    reset = int(time.time()) + 30
    api._note_headers(headers(limit=60, remaining=42, reset=reset))
    state = api.limit_state()
    assert state["limit"] == 60
    assert state["remaining"] == 42
    assert state["reset_at"] == float(reset)


def test_plenty_of_headroom_does_not_pause():
    api = make_api()
    api._note_headers(headers(limit=60, remaining=30, reset=int(time.time()) + 30))
    assert api.should_pause() is False


def test_pauses_when_the_window_is_nearly_spent():
    api = make_api()
    api._note_headers(
        headers(limit=60, remaining=RATE_LIMIT_RESERVE, reset=int(time.time()) + 30)
    )
    assert api.should_pause() is True


def test_does_not_pause_once_the_window_has_expired():
    """A spent window in the past is not a reason to keep waiting."""
    api = make_api()
    api._note_headers(headers(limit=60, remaining=0, reset=int(time.time()) - 5))
    assert api.should_pause() is False


def test_explicit_block_pauses_regardless_of_headers():
    api = make_api()
    api._block_for(30)
    assert api.should_pause() is True


def test_malformed_headers_are_ignored():
    """Junk in a header must not throw during a response."""
    api = make_api()
    api._note_headers(
        {
            "X-Ratelimit-Limit": "not-a-number",
            "X-Ratelimit-Remaining": "",
            "X-Ratelimit-Reset": None,
        }
    )
    assert api.limit_state() == {"limit": None, "remaining": None, "reset_at": None}
    assert api.should_pause() is False


def test_float_headers_are_accepted():
    api = make_api()
    api._note_headers(headers(limit="60.0", remaining="5.0", reset=int(time.time()) + 10))
    assert api.limit_state()["limit"] == 60
    assert api.limit_state()["remaining"] == 5


def test_partial_headers_keep_earlier_values():
    """Finnhub does not always send all three; a missing one must not wipe state."""
    api = make_api()
    reset = int(time.time()) + 30
    api._note_headers(headers(limit=60, remaining=40, reset=reset))
    api._note_headers(headers(remaining=39))
    state = api.limit_state()
    assert state["limit"] == 60
    assert state["remaining"] == 39
    assert state["reset_at"] == float(reset)
