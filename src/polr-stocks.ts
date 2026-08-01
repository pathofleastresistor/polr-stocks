import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./polr-stocks-editor";
import { tileStyles } from "./kit/styles";
import { showMoreInfo, type HomeAssistant } from "./kit/types";
import {
  DIRECTION_ICONS,
  changeDirection,
  discoverTickers,
  formatChange,
  formatPercent,
  formatPrice,
  formatVolume,
  isDerivedPrice,
  readTicker,
  type Direction,
  type Ticker,
} from "./stocks";
import type { PolrStocksConfig, ResolvedConfig, TickerConfig } from "./types";

const CARD_VERSION = "0.1.0";

/* eslint-disable no-console */
console.info(
  `%c POLR-STOCKS %c v${CARD_VERSION} `,
  "color:#fff;background:#3f51b5;font-weight:700",
  "color:#3f51b5;background:#fff;font-weight:700",
);

/** Interleave secondary-line fragments with the usual HA middot separator. */
const join = (parts: Array<TemplateResult | string>): Array<TemplateResult | string> => {
  const kept = parts.filter((part) => part !== "");
  return kept.flatMap((part, index) => (index ? [" · ", part] : [part]));
};

/** A configured ticker joined with its live state. */
interface Row {
  config: TickerConfig;
  ticker?: Ticker;
}

@customElement("polr-stocks")
export class PolrStocks extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ResolvedConfig;

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("polr-stocks-editor");
  }

  public static getStubConfig(hass: HomeAssistant): Partial<PolrStocksConfig> {
    return { tickers: discoverTickers(hass).slice(0, 5) };
  }

  public setConfig(config: PolrStocksConfig): void {
    if (!config) throw new Error("polr-stocks: config is required");
    if (config.tickers !== undefined && !Array.isArray(config.tickers)) {
      throw new Error("polr-stocks: 'tickers' must be a list");
    }

    const tickers: TickerConfig[] = (config.tickers ?? []).map((entry) => {
      const ticker = typeof entry === "string" ? { entity: entry } : entry;
      if (!ticker?.entity || typeof ticker.entity !== "string") {
        throw new Error("polr-stocks: every ticker needs an 'entity'");
      }
      if (!ticker.entity.startsWith("sensor.")) {
        throw new Error(
          `polr-stocks: '${ticker.entity}' is not a sensor — pick a ticker's price sensor`,
        );
      }
      return { ...ticker };
    });

    this._config = {
      show_change_amount: true,
      show_change_percent: true,
      secondary: "both",
      color_change: true,
      compact: false,
      ...config,
      tickers,
    };
  }

  public getCardSize(): number {
    return 1 + (this._config?.tickers.length ?? 3);
  }

  private get _language(): string {
    return this.hass?.locale?.language ?? "en";
  }

  private get _rows(): Row[] {
    const hass = this.hass!;
    return this._config!.tickers.map((config) => ({
      config,
      ticker: readTicker(hass, config.entity),
    }));
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;

    const rows = this._rows;
    if (!rows.length) {
      return html`
        <ha-card>
          <div class="empty-state">
            No tickers selected — edit the card and pick the stocks to show.
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        ${this._config.title
          ? html`
              <div class="section-head">
                <span class="grow">${this._config.title}</span>
                <span class="count">${rows.length}</span>
              </div>
            `
          : nothing}
        <ul class="list">
          ${repeat(
            rows,
            (row) => row.config.entity,
            (row) => this._renderRow(row),
          )}
        </ul>
      </ha-card>
    `;
  }

  private _renderRow(row: Row): TemplateResult {
    const { config, ticker } = row;

    if (!ticker) {
      return html`
        <li class="row empty">
          <div class="tile-icon"><ha-icon icon="mdi:help-circle-outline"></ha-icon></div>
          <div class="tile-info">
            <div class="primary muted"><span>${config.name ?? config.entity}</span></div>
            <div class="secondary"><span>Entity not found</span></div>
          </div>
        </li>
      `;
    }

    const direction = changeDirection(ticker);
    const open = () => showMoreInfo(this, config.entity);
    const secondary = this._secondary(ticker, direction);
    const colour = this._config!.color_change ? direction : "";

    return html`
      <li
        class="row dir-${direction}"
        role="button"
        tabindex="0"
        @click=${open}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
      >
        <div class="tile-icon">
          <ha-icon .icon=${config.icon ?? DIRECTION_ICONS[direction]}></ha-icon>
        </div>
        <div class="tile-info">
          <div class="primary"><span>${config.name ?? ticker.symbol}</span></div>
          ${!this._config!.compact && secondary.length
            ? html`<div class="secondary"><span>${join(secondary)}</span></div>`
            : nothing}
        </div>
        <div class="quote">
          <div class="price ${ticker.available ? "" : "unavailable"}">
            ${ticker.available
              ? formatPrice(ticker.price, ticker.currency, this._language)
              : "—"}
          </div>
          ${ticker.available && this._config!.compact
            ? html`<div class="change ${colour}">${this._changeText(ticker)}</div>`
            : nothing}
        </div>
      </li>
    `;
  }

  /**
   * The day change, as configured. In compact mode this is the only place the
   * change appears; otherwise it leads the secondary line.
   */
  private _changeText(ticker: Ticker): string {
    const { show_change_amount, show_change_percent } = this._config!;
    const parts: string[] = [];
    if (show_change_amount) {
      parts.push(formatChange(ticker.change, ticker.currency, this._language));
    }
    if (show_change_percent) {
      const percent = formatPercent(ticker.changePercent, this._language);
      parts.push(show_change_amount ? `(${percent})` : percent);
    }
    return parts.join(" ");
  }

  /** Secondary-line fragments for a row, before separators are added. */
  private _secondary(ticker: Ticker, direction: Direction): Array<TemplateResult | string> {
    if (!ticker.available) return ["Unavailable"];

    const mode = this._config!.secondary;
    if (mode === "none") return [];

    const colour = this._config!.color_change ? direction : "";
    const change = this._changeText(ticker);
    const changeFragment = change
      ? html`<span class="change ${colour}">${change}</span>`
      : "";

    // A price carried over from a stale bar is worth flagging — on the free IEX
    // feed a quiet ticker can sit on yesterday's close looking perfectly live.
    const derived = isDerivedPrice(ticker)
      ? html`<span class="derived"
          ><ha-icon icon="mdi:clock-alert-outline"></ha-icon>delayed</span
        >`
      : "";

    const session =
      ticker.volume !== null ? `Vol ${formatVolume(ticker.volume, this._language)}` : "";

    if (mode === "change") return [changeFragment, derived].filter((p) => p !== "");
    if (mode === "session") return [session, derived].filter((p) => p !== "");
    return [changeFragment, session, derived].filter((p) => p !== "");
  }

  static override styles = [
    tileStyles,
    css`
      /* Trailing price block, weighted like hui-tile-card's primary text. */
      .quote {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        padding: 0 var(--ha-space-2, 8px);
        white-space: nowrap;
      }
      .price {
        font-size: var(--ha-font-size-m, 14px);
        font-weight: var(--ha-font-weight-medium, 500);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.1px;
        color: var(--primary-text-color);
      }
      .price.unavailable {
        color: var(--secondary-text-color);
      }
      .change {
        font-variant-numeric: tabular-nums;
      }
      .quote .change {
        font-size: var(--ha-font-size-s, 12px);
        line-height: 1.2;
      }
      .change.up {
        color: var(--success-color, #43a047);
      }
      .change.down {
        color: var(--error-color, #db4437);
      }
      /* Trend icon picks up the row's direction. */
      li.row.dir-up .tile-icon {
        color: var(--success-color, #43a047);
      }
      li.row.dir-up .tile-icon::before {
        background-color: var(--success-color, #43a047);
      }
      li.row.dir-down .tile-icon {
        color: var(--error-color, #db4437);
      }
      li.row.dir-down .tile-icon::before {
        background-color: var(--error-color, #db4437);
      }
      .derived {
        color: var(--warning-color, #ffa600);
        --mdc-icon-size: 12px;
      }
      .derived ha-icon {
        vertical-align: -2px;
        margin-inline-end: 2px;
      }
      li.row {
        cursor: pointer;
        transition: background-color var(--duration) ease-in-out;
      }
      li.row:hover {
        background-color: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);
      }
      li.row:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "polr-stocks": PolrStocks;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "polr-stocks",
  name: "PoLR Stocks",
  description: "Prices and day change for the tickers you choose.",
  preview: true,
});
