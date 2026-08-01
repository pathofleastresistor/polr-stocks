"""Constants for PoLR Stocks."""

DOMAIN = "polr_stocks"

FINNHUB_API_BASE = "https://finnhub.io/api/v1"

CONF_API_KEY = "api_key"
CONF_SYMBOLS = "symbols"
CONF_SCAN_INTERVAL = "scan_interval"

# Finnhub's free tier documents 60 calls/minute. Reports of an additional daily
# cap exist but are unconfirmed, and the docs are JS-rendered so the real number
# can't be read programmatically. Rather than guess, the client reads Finnhub's
# X-Ratelimit-* headers and adapts — see api.py. This default is deliberately
# unhurried: one call per symbol per poll, so 5 symbols at 60s is 5 calls/min.
DEFAULT_SCAN_INTERVAL_SECONDS = 60
MIN_SCAN_INTERVAL_SECONDS = 15
MAX_SCAN_INTERVAL_SECONDS = 3600

# Outside market hours prices don't move; poll rarely so the daily budget (if
# there is one) is spent on the session rather than overnight.
CLOSED_INTERVAL_SECONDS = 1800

# Stop making calls when the window has this little headroom left, so a burst
# never trips a 429.
RATE_LIMIT_RESERVE = 2

REQUEST_TIMEOUT_SECONDS = 15

# The bundled card. HACS gives one repository exactly one category, so this
# ships as an integration that serves and registers its own Lovelace resource
# rather than as a separate plugin.
URL_BASE = f"/{DOMAIN}"
CARD_FILENAME = "polr-stocks.js"
# Bump alongside manifest.json to force browsers past a cached bundle.
CARD_VERSION = "0.1.0"
