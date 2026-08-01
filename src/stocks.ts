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
 * `previous_close`, `open`, `high`, `low` and `quoted_at`.
 *
 * Change is read from the attributes rather than recomputed here, so the card
 * and the sensor can never disagree about the same number.
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
  /** ISO timestamp the quote was taken, when known. */
  quotedAt?: string;
  available: boolean;
}

const UNAVAILABLE = new Set(["unavailable", "unknown", "none", ""]);

/** Coerce an attribute to a number, treating absent and junk alike. */
export const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * A ticker sensor — deliberately narrower than "any monetary sensor".
 *
 * Bank balances, budgets and utility costs are all `device_class: monetary`
 * too, so matching on that alone offers up a Chase card next to GOOGL. A stock
 * sensor is identified either by coming from this integration, or by carrying
 * a `symbol` attribute, which is what makes template-backed dev fixtures
 * discoverable without also dragging in every account in the house.
 */
export const isPriceSensor = (
  stateObj: HassEntity | undefined,
  hass?: HomeAssistant,
): boolean => {
  if (!stateObj?.entity_id.startsWith("sensor.")) return false;
  if (hass?.entities?.[stateObj.entity_id]?.platform === "polr_stocks") return true;

  const symbol = stateObj.attributes.symbol;
  return (
    stateObj.attributes.device_class === "monetary" &&
    typeof symbol === "string" &&
    symbol.trim() !== ""
  );
};

/** Every ticker sensor in the system, this integration's first, then alphabetical. */
export const discoverTickers = (hass: HomeAssistant): string[] =>
  Object.keys(hass.states)
    .filter((id) => isPriceSensor(hass.states[id], hass))
    .sort((a, b) => {
      const ours = (id: string) =>
        hass.entities?.[id]?.platform === "polr_stocks" ? 0 : 1;
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
    quotedAt: attrs.quoted_at as string | undefined,
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

/**
 * The session's low-to-high range, e.g. "$169.50 – $173.71".
 *
 * Finnhub reports no volume, so the range takes its place as the at-a-glance
 * sense of how the day has moved. Empty when either end is unknown.
 */
export const formatRange = (
  ticker: Ticker | undefined,
  language = "en",
): string => {
  if (!ticker || ticker.low === null || ticker.high === null) return "";
  const currency = ticker.currency;
  return `${formatPrice(ticker.low, currency, language)} – ${formatPrice(
    ticker.high,
    currency,
    language,
  )}`;
};
