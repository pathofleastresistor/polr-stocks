"""Tests for diagnostics, mainly that the API key never leaks.

Diagnostics downloads get pasted into bug reports, so the redaction is the part
worth pinning.

Needs Home Assistant, so they skip unless it is importable.
"""
import asyncio
import types

import pytest

pytest.importorskip("homeassistant.components.diagnostics")

from custom_components.polr_stocks.const import DOMAIN  # noqa: E402
from custom_components.polr_stocks.diagnostics import (  # noqa: E402
    async_get_config_entry_diagnostics,
)
from custom_components.polr_stocks.quote import Quote  # noqa: E402

SECRET = "super-secret-finnhub-key"


def make_entry():
    return types.SimpleNamespace(
        entry_id="abc123",
        data={"api_key": SECRET},
        options={"symbols": ["GOOGL"], "scan_interval": 60},
    )


def make_coordinator():
    return types.SimpleNamespace(
        symbols=["GOOGL"],
        scan_interval=60,
        update_interval=None,
        last_update_success=True,
        rate_limited_streak=0,
        api=types.SimpleNamespace(
            limit_state=lambda: {"limit": 60, "remaining": 55, "reset_at": 1.0}
        ),
        data={"GOOGL": Quote(symbol="GOOGL", price=172.61, previous_close=170.0)},
    )


def test_api_key_is_redacted():
    asyncio.run(_test_api_key_is_redacted())


async def _test_api_key_is_redacted():
    entry = make_entry()
    hass = types.SimpleNamespace(data={DOMAIN: {entry.entry_id: make_coordinator()}})

    out = await async_get_config_entry_diagnostics(hass, entry)

    assert SECRET not in repr(out)
    assert out["entry"]["data"]["api_key"] != SECRET


def test_reports_the_observed_rate_limit():
    asyncio.run(_test_reports_the_observed_rate_limit())


async def _test_reports_the_observed_rate_limit():
    """The whole point of the file: what Finnhub actually said about the quota."""
    entry = make_entry()
    hass = types.SimpleNamespace(data={DOMAIN: {entry.entry_id: make_coordinator()}})

    out = await async_get_config_entry_diagnostics(hass, entry)

    assert out["coordinator"]["rate_limit"] == {
        "limit": 60,
        "remaining": 55,
        "reset_at": 1.0,
    }
    assert out["coordinator"]["consecutive_rate_limited"] == 0


def test_quotes_are_serialisable():
    asyncio.run(_test_quotes_are_serialisable())


async def _test_quotes_are_serialisable():
    entry = make_entry()
    hass = types.SimpleNamespace(data={DOMAIN: {entry.entry_id: make_coordinator()}})

    out = await async_get_config_entry_diagnostics(hass, entry)

    quote = out["coordinator"]["quotes"]["GOOGL"]
    assert quote["price"] == 172.61
    assert quote["previous_close"] == 170.0


def test_survives_a_missing_coordinator():
    asyncio.run(_test_survives_a_missing_coordinator())


async def _test_survives_a_missing_coordinator():
    """Diagnostics are often pulled precisely when setup failed."""
    entry = make_entry()
    hass = types.SimpleNamespace(data={})

    out = await async_get_config_entry_diagnostics(hass, entry)

    assert out["coordinator"] is None
    assert SECRET not in repr(out)
