"""Turning a Finnhub quote into a Quote, plus market-hours arithmetic.

Pure functions, no Home Assistant imports, so this is testable on its own.

Finnhub's GET /quote returns one symbol per call:

    {"c": 261.74,   # current price
     "d": -0.10,    # change from the previous close
     "dp": -0.0382, # change percent
     "h": 263.31,   # session high
     "l": 260.68,   # session low
     "o": 261.07,   # session open
     "pc": 261.84,  # previous close
     "t": 1582641000}

`pc` is authoritative, which is why there is no previous-close guesswork here:
with snapshot-style APIs the previous close has to be inferred from which
session the daily bar belongs to, and getting that wrong shows a day-old change
every morning. Finnhub just states it.

An unknown ticker is not an error — it comes back with every field 0 or null,
which is why a price of 0 is treated as "no data" throughout.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time, timezone
from typing import Any
from zoneinfo import ZoneInfo

MARKET_TZ = ZoneInfo("America/New_York")

# Regular US equity session.
MARKET_OPEN = time(9, 30)
MARKET_CLOSE = time(16, 0)


@dataclass
class Quote:
    """A normalised quote for one symbol."""

    symbol: str
    price: float
    change: float | None = None
    change_percent: float | None = None
    previous_close: float | None = None
    open: float | None = None
    high: float | None = None
    low: float | None = None
    quoted_at: str | None = None


def _num(value: Any) -> float | None:
    """Coerce an API field to a float, treating junk and 0 as absent.

    Finnhub pads an unknown symbol's response with zeros, and a real equity
    never trades at 0, so the two are safely conflated.
    """
    if isinstance(value, bool) or value is None:
        return None
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    return out if out != 0 else None


def _signed(value: Any) -> float | None:
    """Like _num, but 0 is a real value — a flat day is not a missing one."""
    if isinstance(value, bool) or value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _timestamp(value: Any) -> str | None:
    """Finnhub's `t` is epoch seconds; expose it as ISO 8601."""
    seconds = _num(value)
    if seconds is None:
        return None
    try:
        return datetime.fromtimestamp(seconds, tz=timezone.utc).isoformat()
    except (OverflowError, OSError, ValueError):
        return None


def parse_quote(symbol: str, payload: dict[str, Any]) -> Quote | None:
    """Normalise one /quote response. None when there is no usable price."""
    if not payload:
        return None

    price = _num(payload.get("c"))
    if price is None:
        return None

    previous_close = _num(payload.get("pc"))
    change = _signed(payload.get("d"))
    change_percent = _signed(payload.get("dp"))

    # Finnhub occasionally omits d/dp while still returning c and pc; deriving
    # them is exact here, since pc is stated rather than inferred.
    if change is None and previous_close is not None:
        change = round(price - previous_close, 4)
    if change_percent is None and previous_close:
        change_percent = round((price - previous_close) / previous_close * 100, 4)

    return Quote(
        symbol=symbol,
        price=price,
        change=change,
        change_percent=change_percent,
        previous_close=previous_close,
        open=_num(payload.get("o")),
        high=_num(payload.get("h")),
        low=_num(payload.get("l")),
        quoted_at=_timestamp(payload.get("t")),
    )


def is_market_open(now: datetime | None = None) -> bool:
    """Whether the US equity market is in its regular session.

    Computed locally rather than fetched, so it costs no API calls. Holidays
    are not modelled: on a holiday this reports open and the integration polls
    a flat price a few extra times, which is harmless. Treating a holiday as
    closed would be worse, since a wrong "closed" would freeze real prices.
    """
    if now is None:
        now = datetime.now(MARKET_TZ)
    else:
        now = now.astimezone(MARKET_TZ)

    if now.weekday() >= 5:  # Saturday, Sunday
        return False
    return MARKET_OPEN <= now.time() < MARKET_CLOSE
