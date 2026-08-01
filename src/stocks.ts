/**
 * Reading stock quotes out of the hass object.
 *
 * The integration (custom_components/polr_stocks) creates one sensor per
 * ticker:
 *
 *   sensor.polr_stocks_<ticker>   device_class: monetary, unit: USD
 *                                 state = last price
 *
 * with the day's numbers on attributes: `symbol`, `change`, `change_percent`,
 * `previous_close`, `open`, `high`, `low`, `volume`, `price_source` and
 * `last_trade_at`.
 *
 * Change is read from the attributes rather than recomputed here — the
 * integration already picks the right previous close, which is subtler than it
 * looks outside market hours (see quote.py). Recomputing would risk two
 * different answers for the same number.
 */
import type { HassEntity, HomeAssistant } from "./kit/types";

export interface Ticker {
  entity: string;
  /** Ticker symbol, e.g. "GOOGL". */
  symbol: string;
  /** null when the sensor is unavailable or non-numeric. */
  price: number | null;
  currency: string;
  change: number | null;
  changePercent: number | null;
  previousClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  /** Which snapshot field the price came from: latest_trade | minute_bar | daily_bar. */
  priceSource: string;
  /** ISO timestamp of the last trade, when known. */
  lastTradeAt?: string;
  available: boolean;
}

const UNAVAILABLE = new Set(["unavailable", "unknown", "none", ""]);

/** Coerce an attribute to a number, treating absent and junk alike. */
export const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** A price sensor is a monetary sensor; the integration's are the common case. */
export const isPriceSensor = (stateObj: HassEntity | undefined): boolean =>
  Boolean(
    stateObj?.entity_id.startsWith("sensor.") &&
      stateObj.attributes.device_class === "monetary",
  );

/** Every price sensor in the system, polr_stocks' first, then alphabetical. */
export const discoverTickers = (hass: HomeAssistant): string[] =>
  Object.keys(hass.states)
    .filter((id) => isPriceSensor(hass.states[id]))
    .sort((a, b) => {
      const ours = (id: string) => (id.startsWith("sensor.polr_stocks_") ? 0 : 1);
      return ours(a) - ours(b) || a.localeCompare(b);
    });

/** Derive a display symbol when the attribute is missing. */
const symbolFrom = (entity: string, stateObj: HassEntity): string => {
  const attr = stateObj.attributes.symbol;
  if (typeof attr === "string" && attr.trim()) return attr.trim().toUpperCase();
  // sensor.polr_stocks_googl -> GOOGL; anything else -> the object id.
  const objectId = entity.slice(entity.indexOf(".") + 1);
  return objectId.replace(/^polr_stocks_/, "").toUpperCase();
};

/** Read one ticker, or undefined when the entity does not exist. */
export const readTicker = (hass: HomeAssistant, entity: string): Ticker | undefined => {
  const stateObj = hass.states[entity];
  if (!stateObj) return undefined;

  const available = !UNAVAILABLE.has(String(stateObj.state).toLowerCase());
  const price = available ? num(stateObj.state) : null;
  const attrs = stateObj.attributes;

  return {
    entity,
    symbol: symbolFrom(entity, stateObj),
    price,
    currency: (attrs.unit_of_measurement as string) ?? "USD",
    change: num(attrs.change),
    changePercent: num(attrs.change_percent),
    previousClose: num(attrs.previous_close),
    open: num(attrs.open),
    high: num(attrs.high),
    low: num(attrs.low),
    volume: num(attrs.volume),
    priceSource: (attrs.price_source as string) ?? "",
    lastTradeAt: attrs.last_trade_at as string | undefined,
    available: available && price !== null,
  };
};

export type Direction = "up" | "down" | "flat" | "unknown";

/** Which way the day is going, for colouring and the trend icon. */
export const changeDirection = (ticker: Ticker | undefined): Direction => {
  if (!ticker?.available) return "unknown";
  // Prefer percent: a sub-cent absolute move can round to 0 while the percent
  // still carries a sign.
  const value = ticker.changePercent ?? ticker.change;
  if (value === null) return "unknown";
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
};

export const DIRECTION_ICONS: Record<Direction, string> = {
  up: "mdi:trending-up",
  down: "mdi:trending-down",
  flat: "mdi:trending-neutral",
  unknown: "mdi:help-circle-outline",
};

/** Price formatted as currency. */
export const formatPrice = (
  value: number | null,
  currency = "USD",
  language = "en",
): string => {
  if (value === null) return "—";
  try {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Unknown currency code — fall back rather than throwing mid-render.
    return `${value.toFixed(2)} ${currency}`;
  }
};

/** Day change, always signed so a gain reads as a gain at a glance. */
export const formatChange = (
  value: number | null,
  currency = "USD",
  language = "en",
): string => {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatPrice(Math.abs(value), currency, language)}`;
};

/** Day change as a signed percentage. */
export const formatPercent = (value: number | null, language = "en"): string => {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const body = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return `${sign}${body}%`;
};

/** Compact volume, e.g. 56.5M. */
export const formatVolume = (value: number | null, language = "en"): string => {
  if (value === null) return "—";
  return new Intl.NumberFormat(language, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

/** True when the price came from a stale bar rather than a live trade. */
export const isDerivedPrice = (ticker: Ticker | undefined): boolean =>
  Boolean(ticker?.available && ticker.priceSource && ticker.priceSource !== "latest_trade");
