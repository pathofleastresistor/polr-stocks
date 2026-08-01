/** Config types for polr-stocks. */

/** What the row's secondary line shows. */
export type SecondaryMode = "change" | "session" | "both" | "none";

export interface TickerConfig {
  /** Price sensor, e.g. sensor.polr_stocks_googl. */
  entity: string;
  /** Overrides the ticker symbol shown as the row's primary text. */
  name?: string;
  /** Overrides the default trend icon. */
  icon?: string;
}

export interface PolrStocksConfig {
  type: string;
  /** Section label above the ticker list. Omit for no label. */
  title?: string;
  /** Tickers to show, in order. Bare entity ids are accepted. */
  tickers: Array<string | TickerConfig>;
  /** Show the day change as an absolute amount. */
  show_change_amount?: boolean;
  /** Show the day change as a percentage. */
  show_change_percent?: boolean;
  secondary?: SecondaryMode;
  /** Colour the change green/red instead of leaving it neutral. */
  color_change?: boolean;
  /** Drop the secondary line and tighten rows to a single line each. */
  compact?: boolean;
}

/** Config after setConfig has filled in defaults. */
export interface ResolvedConfig extends PolrStocksConfig {
  tickers: TickerConfig[];
  show_change_amount: boolean;
  show_change_percent: boolean;
  secondary: SecondaryMode;
  color_change: boolean;
  compact: boolean;
}
