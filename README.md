# PoLR Stocks

Stock quotes in Home Assistant, from [Finnhub](https://finnhub.io) — a custom
integration plus a companion Lovelace card.

## Why Finnhub

- **Email-only signup.** A free key needs an email address and nothing else — no
  identity documents, no brokerage onboarding. Broker-backed APIs like Alpaca
  give excellent data but require full KYC even for a paper account.
- **Real-time consolidated quotes.** Prices come off the full tape rather than a
  single venue, so they match what you see everywhere else.
- **`pc` is stated, not inferred.** `/quote` returns the previous close
  directly. Snapshot-style APIs make you work it out from which session the
  daily bar belongs to, and getting that wrong shows a day-old change every
  morning. That entire class of bug does not exist here.

Finnhub's free tier documents **60 calls/minute**, and this makes one call per
ticker per update. Reports of an additional daily cap circulate but are
unconfirmed, and the docs are JS-rendered so the real figure can't be read
programmatically — so rather than hard-coding a guess, the client reads
Finnhub's `X-Ratelimit-*` headers, refuses to spend the last of a window, and
logs the limit it actually observes. See [Rate limits](#rate-limits).

## Install

1. Create a free API key at [finnhub.io/register](https://finnhub.io/register) —
   email and verification, nothing more.
2. Copy `custom_components/polr_stocks/` into your HA `custom_components/` and
   restart.
3. **Settings → Devices & Services → Add Integration → PoLR Stocks**, then enter
   the key and add tickers — type a symbol, press enter, and it becomes a chip.
   Pasting a comma-separated list works too and splits into separate chips.
4. Add the **PoLR Stocks** card to a dashboard and pick the tickers to show.

Edit the watchlist and interval later via the integration's **Configure**
button; click a chip's × to drop a ticker without retyping the rest.

## Entities

One sensor per ticker, `sensor.polr_stocks_<ticker>`, whose state is the last
price:

| Attribute | Meaning |
| --- | --- |
| `symbol` | Ticker, e.g. `GOOGL` |
| `change` / `change_percent` | Move from the previous session's close |
| `previous_close` | The close the change is measured against |
| `open` / `high` / `low` | Session stats |
| `quoted_at` | When the quote was taken |

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
| `secondary` | `both` | `both` \| `change` \| `range` \| `none` |
| `color_change` | `true` | Colour gains and losses |
| `compact` | `false` | One line per row, change beside the price |

## Rate limits

The free tier's true limits are not published anywhere machine-readable, so
nothing here assumes them:

- `api.py` tracks `X-Ratelimit-Limit`, `-Remaining` and `-Reset`, and stops
  making calls while a window has less than `RATE_LIMIT_RESERVE` left. The
  observed limit is logged at INFO the first time it is seen, so you can learn
  the real number from your own key.
- A 429 is **not** treated as a failure. The coordinator keeps the prices
  already on screen and retries later, rather than blanking the card over a
  rate limit.
- Market hours are computed locally (`is_market_open`), so no call is spent on
  a clock endpoint, and polling drops to every 30 minutes outside the session —
  the daily budget goes to the hours that matter.

Holidays are deliberately not modelled: on a holiday the integration polls a
flat price a few extra times, which is harmless, whereas a wrong "closed" would
freeze real prices.

If you do hit a cap, raise the update interval in **Configure**.

## An edge case worth knowing about

An unknown ticker is not an error to Finnhub — it returns a body of zeros. A
real equity never trades at 0, so a zero price is treated as "no data"
throughout, which is what lets the config flow name a bad ticker instead of
failing opaquely. Pinned by tests in `tests/test_quote.py`.

## Development

Built in the [`ha-dev`](../../README.md) workspace.
`config/packages/dev_stocks.yaml` provides fake tickers shaped exactly like the
real sensors, so the card can be developed without API keys or market hours.

Those fixtures are named `sensor.dev_stocks_*`, **not** `sensor.polr_stocks_*`.
Mirroring the real entity ids is tempting — a dashboard built on fixtures would
carry over to live data — but the moment the integration is set up in the same
instance the ids collide, the fixture wins, and the real quotes get silently
pushed to `_2` ids. The card then shows fake prices next to real ones with no
indication which is which.

```bash
npm install
npm run watch        # rebuild the card on save
npm test             # card logic (node --test)

# Component tests. PYTEST_DISABLE_PLUGIN_AUTOLOAD stops pytest pulling in a
# full Home Assistant; quote.py has no HA imports precisely so it can be
# tested on its own. The frontend tests skip here — they need HA.
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python3.12 -m pytest -q

# Everything, including the API and frontend tests, against real HA:
docker exec ha-dev bash -c \
  "cd /config/www/_projects/polr-stocks && python -m pytest -q --asyncio-mode=auto"
```

`npm run build` writes into `custom_components/polr_stocks/frontend/`, so the
component symlink alone is enough — `ha-dev link` registers no separate card
resource, since the integration registers its own.

## Brand icon

Home Assistant 2026.3+ serves brand images straight from a custom integration —
no PR to `home-assistant/brands` needed. The contract is just a `brand/`
directory at the top level of the component: `loader.py` sets `has_branding`
from its presence, and `components/brands` reads PNGs out of it, serving them at
`/api/brands/integration/polr_stocks/<image>.png`.

Only `icon.png` (256×256) and `icon@2x.png` (512×512) are shipped. HA's fallback
chain resolves `logo`, `dark_icon` and `dark_logo` back to them, so a
single square mark covers all eight allowed images. The one wrinkle is that
`logo@2x.png` falls back to `logo.png` → `icon.png` rather than to
`icon@2x.png`, so hDPI *logo* slots get the 256px file; shipping duplicate
`logo*` copies purely to game that chain wasn't worth the bytes.

`icon.svg` is the source. Regenerate the PNGs with:

```bash
./scripts/render-icon.sh
```

The mark is a rising trend line over candlesticks on a saturated green circle.
Saturated rather than dark deliberately — HA renders integration icons on both
light and dark cards, and a "finance terminal" navy sinks into a dark theme.

## Packaging

HACS keys repositories by full name, not by (name, category) — see
`_repositories_by_full_name` in `hacs/base.py` — so **one GitHub repo gets
exactly one HACS category**. A single repo cannot be installed as both an
integration and a dashboard plugin; registering the same repo under a second
category raises `HacsRepositoryExistException`.

So this ships as a HACS **integration** that serves its own card, the way
`ha-bambulab` does:

- The card builds to `custom_components/polr_stocks/frontend/polr-stocks.js`
  (not `dist/`), so HACS ships it with the integration.
- `frontend.py` serves that directory at `/polr_stocks/` and adds the Lovelace
  resource itself, updating the `?v=` when `CARD_VERSION` moves and removing it
  when the integration is deleted.
- In YAML resource mode it logs the URL to add by hand instead.

Users install one thing, and the card can never drift out of sync with the
component. Bump `CARD_VERSION` in `const.py` alongside `manifest.json` so
browsers get past a cached bundle.
