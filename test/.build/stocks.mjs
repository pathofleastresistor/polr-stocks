// src/stocks.ts
var UNAVAILABLE = /* @__PURE__ */ new Set(["unavailable", "unknown", "none", ""]);
var num = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
var isPriceSensor = (stateObj) => Boolean(
  stateObj?.entity_id.startsWith("sensor.") && stateObj.attributes.device_class === "monetary"
);
var discoverTickers = (hass) => Object.keys(hass.states).filter((id) => isPriceSensor(hass.states[id])).sort((a, b) => {
  const ours = (id) => id.startsWith("sensor.polr_stocks_") ? 0 : 1;
  return ours(a) - ours(b) || a.localeCompare(b);
});
var symbolFrom = (entity, stateObj) => {
  const attr = stateObj.attributes.symbol;
  if (typeof attr === "string" && attr.trim()) return attr.trim().toUpperCase();
  const objectId = entity.slice(entity.indexOf(".") + 1);
  return objectId.replace(/^polr_stocks_/, "").toUpperCase();
};
var readTicker = (hass, entity) => {
  const stateObj = hass.states[entity];
  if (!stateObj) return void 0;
  const available = !UNAVAILABLE.has(String(stateObj.state).toLowerCase());
  const price = available ? num(stateObj.state) : null;
  const attrs = stateObj.attributes;
  return {
    entity,
    symbol: symbolFrom(entity, stateObj),
    price,
    currency: attrs.unit_of_measurement ?? "USD",
    change: num(attrs.change),
    changePercent: num(attrs.change_percent),
    previousClose: num(attrs.previous_close),
    open: num(attrs.open),
    high: num(attrs.high),
    low: num(attrs.low),
    quotedAt: attrs.quoted_at,
    available: available && price !== null
  };
};
var changeDirection = (ticker) => {
  if (!ticker?.available) return "unknown";
  const value = ticker.changePercent ?? ticker.change;
  if (value === null) return "unknown";
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
};
var DIRECTION_ICONS = {
  up: "mdi:trending-up",
  down: "mdi:trending-down",
  flat: "mdi:trending-neutral",
  unknown: "mdi:help-circle-outline"
};
var formatPrice = (value, currency = "USD", language = "en") => {
  if (value === null) return "\u2014";
  try {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};
var formatChange = (value, currency = "USD", language = "en") => {
  if (value === null) return "\u2014";
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : "";
  return `${sign}${formatPrice(Math.abs(value), currency, language)}`;
};
var formatPercent = (value, language = "en") => {
  if (value === null) return "\u2014";
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : "";
  const body = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(value));
  return `${sign}${body}%`;
};
var formatRange = (ticker, language = "en") => {
  if (!ticker || ticker.low === null || ticker.high === null) return "";
  const currency = ticker.currency;
  return `${formatPrice(ticker.low, currency, language)} \u2013 ${formatPrice(
    ticker.high,
    currency,
    language
  )}`;
};
export {
  DIRECTION_ICONS,
  changeDirection,
  discoverTickers,
  formatChange,
  formatPercent,
  formatPrice,
  formatRange,
  isPriceSensor,
  num,
  readTicker
};
