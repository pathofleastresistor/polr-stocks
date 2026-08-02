/**
 * Price history for sparklines.
 *
 * Finnhub's free tier returns 403 on historical candles, so the trend is drawn
 * from Home Assistant's own recorder instead — the same source, and the same
 * websocket command, that mini-graph-card uses. It costs no API calls, and the
 * only real limitation is that history starts when the integration was set up
 * rather than at the IPO.
 *
 * The rendering helpers are pure so they can be unit tested; only fetchHistory
 * touches hass.
 */
import type { HomeAssistant } from "./kit/types";

/** One recorder row in `minimal_response` form: state plus last-updated. */
interface MinimalHistoryPoint {
  s?: string;
  lu?: number;
  state?: string;
  last_updated?: string;
}

export type HistoryResponse = Record<string, MinimalHistoryPoint[]>;

/** Numeric prices for one entity, oldest first, non-numeric rows dropped. */
export const readSeries = (
  response: HistoryResponse | undefined,
  entityId: string,
): number[] => {
  const rows = response?.[entityId];
  if (!Array.isArray(rows)) return [];

  const out: number[] = [];
  for (const row of rows) {
    // `s` under minimal_response, `state` otherwise — accept both so this
    // doesn't break if the request options change.
    const raw = row?.s ?? row?.state;
    if (raw === undefined) continue;
    const value = Number(raw);
    // Recorder stores "unavailable"/"unknown" as states too.
    if (Number.isFinite(value)) out.push(value);
  }
  return out;
};

/**
 * Reduce a series to at most `max` points, keeping the first and last.
 *
 * A day of 60-second polling is ~390 points inside a 64px-wide sparkline, which
 * is several points per pixel — pure cost for no visible detail.
 */
export const downsample = (values: number[], max = 96): number[] => {
  if (max < 2 || values.length <= max) return values;

  const out: number[] = [];
  const step = (values.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) {
    out.push(values[Math.round(i * step)]);
  }
  return out;
};

/**
 * An SVG polyline path across `width` x `height`, y-inverted for screen space.
 *
 * Returns "" for fewer than two points — one price is not a trend, and a
 * degenerate path renders as a stray dot.
 */
export const sparklinePath = (
  values: number[],
  width: number,
  height: number,
  padding = 2,
): string => {
  if (values.length < 2 || width <= 0 || height <= 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  const usableHeight = Math.max(0, height - padding * 2);
  const stepX = width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * stepX;
      // A flat series has no span to scale by; centre it rather than divide by
      // zero, which would put every point at NaN and blank the sparkline.
      const ratio = span === 0 ? 0.5 : (value - min) / span;
      const y = padding + (1 - ratio) * usableHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

/** Whether the series ends higher than it started, for colouring. */
export const seriesDirection = (values: number[]): "up" | "down" | "flat" => {
  if (values.length < 2) return "flat";
  const first = values[0];
  const last = values[values.length - 1];
  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
};

/**
 * Fetch recorder history for several entities in one round trip.
 *
 * `minimal_response` and `no_attributes` matter: these sensors carry ten
 * attributes each, and a day of them per ticker is a lot of payload to ship to
 * the browser for a line drawing.
 */
export const fetchHistory = async (
  hass: HomeAssistant,
  entityIds: string[],
  hours: number,
): Promise<HistoryResponse> => {
  if (!entityIds.length) return {};

  const end = new Date();
  const start = new Date(end.getTime() - hours * 3600_000);

  return hass.callWS<HistoryResponse>({
    type: "history/history_during_period",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    entity_ids: entityIds,
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
};
