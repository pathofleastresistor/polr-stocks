"""Constants for PoLR Stocks."""

DOMAIN = "polr_stocks"

# Market data lives on a different host than the trading/clock API.
ALPACA_DATA_BASE = "https://data.alpaca.markets"
ALPACA_TRADING_BASE = "https://api.alpaca.markets"

CONF_API_KEY = "api_key"
CONF_API_SECRET = "api_secret"
CONF_SYMBOLS = "symbols"

# Free "Basic" plan: real-time is IEX-only. sip/delayed_sip need a subscription.
FEED = "iex"

# One snapshots request per refresh, so 60s sits far under the 200 req/min cap.
UPDATE_INTERVAL_OPEN_SECONDS = 60
UPDATE_INTERVAL_CLOSED_SECONDS = 1800

# The clock rarely matters to the second; don't spend a request on it every poll.
CLOCK_CACHE_SECONDS = 300

# Symbol used to prove the credentials work during the config flow.
VALIDATION_SYMBOL = "AAPL"

REQUEST_TIMEOUT_SECONDS = 15
