# PoLR Stocks

Stock quotes in Home Assistant, from [Alpaca](https://alpaca.markets)'s market
data API — a custom integration plus a companion Lovelace card.

## Why Alpaca

- **One request per refresh.** `GET /v2/stocks/snapshots?symbols=…` returns the
  whole watchlist — latest trade, latest quote, today's bar and the previous
  close — so day change needs no second call.
- **A supported production API, not a scraped endpoint.** Free tier, documented,
  key-authenticated, 200 requests/minute, and no account funding required.
  Yahoo-backed alternatives need no key but ride an unofficial endpoint that has
  broken before.

The free plan's real-time equity feed is **IEX only** (~2.5% of US volume). For
liquid names that is indistinguishable from the consolidated tape; for quiet
ones the last trade can lag, so the card flags a price that came from a stale
bar rather than a live trade.

## Install

1. Create free API keys at [alpaca.markets](https://alpaca.markets) — a paper
   account works, no funding needed.
2. Copy `custom_components/polr_stocks/` into your HA `custom_components/` and
   restart.
3. **Settings → Devices & Services → Add Integration → PoLR Stocks**, then enter
   the key ID, secret and a comma-separated ticker list.
4. Add the **PoLR Stocks** card to a dashboard and pick the tickers to show.

Edit the watchlist later via the integration's **Configure** button.

## Entities

One sensor per ticker, `sensor.polr_stocks_<ticker>`, whose state is the last
price:

| Attribute | Meaning |
| --- | --- |
| `symbol` | Ticker, e.g. `GOOGL` |
| `change` / `change_percent` | Move from the previous session's close |
| `previous_close` | The close the change is measured against |
| `open` / `high` / `low` / `volume` | Session stats |
| `price_source` | `latest_trade`, `minute_bar` or `daily_bar` |
| `last_trade_at` | Timestamp of the last trade, when known |

There is deliberately no `state_class`: HA rejects `measurement` alongside
`device_class: monetary`, and `total` would have the recorder generate sum
statistics for a price that is not cumulative. State history is still recorded.

## Card options

```yaml
type: custom:polr-stocks
title: Portfolio
tickers:
  - sensor.polr_stocks_googl
  - entity: sensor.polr_stocks_msft
    name: Microsoft
```

| Option | Default | |
| --- | --- | --- |
| `title` | — | Section label; omit for none |
| `tickers` | — | Entity ids or `{entity, name, icon}` objects |
| `show_change_amount` | `true` | Show the change as an amount |
| `show_change_percent` | `true` | Show the change as a percentage |
| `secondary` | `both` | `both` \| `change` \| `session` \| `none` |
| `color_change` | `true` | Colour gains and losses |
| `compact` | `false` | One line per row, change beside the price |

## Two edge cases worth knowing about

Both produce plausible-but-wrong numbers rather than errors, so both are pinned
by tests in `tests/test_quote.py`:

1. **Previous close.** `prevDailyBar` is only the right comparison once
   `dailyBar` is *today's* session. Before the open, `dailyBar` is still
   yesterday, and reaching for `prevDailyBar` then measures against the session
   before that — showing a day-old change as if it were live.
2. **Sparse IEX prints.** `latestTrade` can be missing on quiet names, so the
   price falls back through `minuteBar` then `dailyBar`, and reports which one
   it used.

## Development

Built in the [`ha-dev`](../../README.md) workspace.
`config/packages/dev_stocks.yaml` provides fake tickers shaped exactly like the
real sensors, so the card can be developed without API keys or market hours.

```bash
npm install
npm run watch        # rebuild the card on save
npm test             # card logic (node --test)

# Component tests. PYTEST_DISABLE_PLUGIN_AUTOLOAD stops pytest pulling in a
# full Home Assistant; quote.py has no HA imports precisely so it can be
# tested on its own.
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python3.12 -m pytest -q
```

## Packaging note

HACS keys repositories by full name, not by (name, category) — see
`_repositories_by_full_name` in `hacs/base.py` — so **one GitHub repo gets
exactly one HACS category**. A single repo cannot be installed as both an
integration and a dashboard plugin.

To ship both halves from one repo it must register as an **integration**, with
the integration serving and registering its own card, the way `ha-bambulab`
does (`custom_components/bambu_lab/frontend/*.js`, served at
`/bambu_lab/…`). The alternative is two repos, as with `activity-manager` and
`activity-manager-card`. This repo is not yet wired for either — see the note
in the workspace before publishing.
