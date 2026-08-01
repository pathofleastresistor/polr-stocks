"""Turning an Alpaca snapshot into a quote.

Pure functions, no Home Assistant imports — this is the part worth unit testing,
because both of its edge cases produce *plausible but wrong* numbers rather than
errors.

An Alpaca snapshot (GET /v2/stocks/snapshots) looks like:

    {"GOOGL": {"latestTrade":  {"p": 172.61, "t": "..."},
               "latestQuote":  {"bp": 172.60, "ap": 172.70},
               "minuteBar":    {"o":.., "h":.., "l":.., "c":.., "v":..},
               "dailyBar":     {"o":.., "h":.., "l":.., "c":.., "v":..},
               "prevDailyBar": {"c": 173.19, ...}}}

Bar timestamps are the bar's *start*, in UTC. A US daily bar starts at 00:00
Eastern, so a bar belongs to the Eastern date of its timestamp.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

MARKET_TZ = ZoneInfo("America/New_York")

# Where the last price came from, best first. Exposed as the `price_source`
# attribute so a stale-looking price can be explained rather than guessed at.
SOURCE_TRADE = "latest_trade"
SOURCE_MINUTE = "minute_bar"
SOURCE_DAILY = "daily_bar"


@dataclass
class Quote:
    """A normalised quote for one symbol."""

    symbol: str
    price: float
    price_source: str
    previous_close: float | None = None
    open: float | None = None
    high: float | None = None
    low: float | None = None
    volume: int | None = None
    last_trade_at: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)

    @property
    def change(self) -> float | None:
        """Absolute move from the previous session's close."""
        if self.previous_close is None:
            return None
        return round(self.price - self.previous_close, 4)

    @property
    def change_percent(self) -> float | None:
        """Percentage move from the previous session's close."""
        if not self.previous_close:  # None or 0 — 0 would divide by zero
            return None
        return round((self.price - self.previous_close) / self.previous_close * 100, 4)


def _num(value: Any) -> float | None:
    """Coerce an API field to a float, treating junk as absent."""
    if isinstance(value, bool) or value is None:
        return None
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    # Alpaca uses 0 for "no data" in bar fields; a real equity never trades at 0.
    return out if out != 0 else None


def _bar_date(bar: dict[str, Any] | None) -> date | None:
    """The Eastern-market date a bar belongs to."""
    if not bar:
        return None
    stamp = bar.get("t")
    if not isinstance(stamp, str):
        return None
    try:
        parsed = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(MARKET_TZ).date()


def resolve_price(snapshot: dict[str, Any]) -> tuple[float | None, str | None]:
    """Last price, falling back through progressively staler sources.

    The free feed is IEX only (~2.5% of US volume), so `latestTrade` can be
    missing or hours old on quiet names. Falling back keeps the card populated
    instead of showing "unavailable" for a stock that is trading fine elsewhere.
    """
    price = _num((snapshot.get("latestTrade") or {}).get("p"))
    if price is not None:
        return price, SOURCE_TRADE

    price = _num((snapshot.get("minuteBar") or {}).get("c"))
    if price is not None:
        return price, SOURCE_MINUTE

    price = _num((snapshot.get("dailyBar") or {}).get("c"))
    if price is not None:
        return price, SOURCE_DAILY

    return None, None


def resolve_previous_close(
    snapshot: dict[str, Any], today: date | None = None
) -> float | None:
    """The close to measure today's change against.

    `prevDailyBar` is only the right comparison once `dailyBar` is *today's*
    session. Outside market hours — including every morning before the open —
    `dailyBar` is still the last completed session, and using `prevDailyBar`
    then would measure against the session before that, showing a day-old
    change as if it were live.
    """
    daily = snapshot.get("dailyBar") or {}
    prev = snapshot.get("prevDailyBar") or {}

    if today is None:
        today = datetime.now(MARKET_TZ).date()

    daily_date = _bar_date(daily)
    if daily_date is not None and daily_date >= today:
        # dailyBar is the session in progress; prevDailyBar is the last close.
        return _num(prev.get("c"))

    # dailyBar is itself the last completed session.
    return _num(daily.get("c")) or _num(prev.get("c"))


def parse_snapshot(
    symbol: str, snapshot: dict[str, Any], today: date | None = None
) -> Quote | None:
    """Normalise one symbol's snapshot. None when there is no usable price."""
    if not snapshot:
        return None

    price, source = resolve_price(snapshot)
    if price is None or source is None:
        return None

    previous_close = resolve_previous_close(snapshot, today)

    # Session stats come from whichever daily bar the price belongs to, so an
    # after-hours quote reports that session's range rather than an empty one.
    daily = snapshot.get("dailyBar") or {}
    if source == SOURCE_DAILY and not daily:
        daily = snapshot.get("prevDailyBar") or {}

    volume = _num(daily.get("v"))

    return Quote(
        symbol=symbol,
        price=price,
        price_source=source,
        previous_close=previous_close,
        open=_num(daily.get("o")),
        high=_num(daily.get("h")),
        low=_num(daily.get("l")),
        volume=int(volume) if volume is not None else None,
        last_trade_at=(snapshot.get("latestTrade") or {}).get("t"),
    )


def parse_snapshots(
    payload: dict[str, Any], today: date | None = None
) -> dict[str, Quote]:
    """Normalise a whole multi-symbol snapshots response."""
    out: dict[str, Quote] = {}
    for symbol, snapshot in (payload or {}).items():
        if not isinstance(snapshot, dict):
            continue
        quote = parse_snapshot(symbol, snapshot, today)
        if quote is not None:
            out[symbol] = quote
    return out
