import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { tileStyles } from "./kit/styles";
import { fireEvent, type HomeAssistant } from "./kit/types";
import { discoverTickers, readTicker } from "./stocks";
import type { PolrStocksConfig, TickerConfig } from "./types";

// Rendered by HA's own ha-form, so selectors, translations and theming come for
// free. The ticker list below is hand-rolled: picking and ordering is more than
// an entity selector can express.
const SCHEMA = [
  { name: "title", selector: { text: {} } },
  {
    name: "secondary",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "both", label: "Day change + range" },
          { value: "change", label: "Day change" },
          { value: "range", label: "Session range" },
          { value: "none", label: "Nothing" },
        ],
      },
    },
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_change_amount", selector: { boolean: {} } },
      { name: "show_change_percent", selector: { boolean: {} } },
      { name: "color_change", selector: { boolean: {} } },
      { name: "compact", selector: { boolean: {} } },
    ],
  },
] as const;

const LABELS: Record<string, string> = {
  title: "Section title",
  secondary: "Secondary line",
  show_change_amount: "Show change amount",
  show_change_percent: "Show change percent",
  color_change: "Colour gains and losses",
  compact: "Compact rows",
};

@customElement("polr-stocks-editor")
export class PolrStocksEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: PolrStocksConfig;
  @state() private _filter = "";

  public setConfig(config: PolrStocksConfig): void {
    this._config = config;
  }

  /** Configured tickers, normalised to objects for editing. */
  private get _tickers(): TickerConfig[] {
    return (this._config?.tickers ?? []).map((entry) =>
      typeof entry === "string" ? { entity: entry } : { ...entry },
    );
  }

  private _computeLabel = (schema: { name: string }): string =>
    LABELS[schema.name] ?? schema.name;

  private _emit(config: PolrStocksConfig): void {
    fireEvent(this, "config-changed", { config });
  }

  /** Tickers with no per-ticker options collapse back to bare entity ids. */
  private _setTickers(tickers: TickerConfig[]): void {
    this._emit({
      ...this._config!,
      tickers: tickers.map((ticker) =>
        Object.keys(ticker).length === 1 ? ticker.entity : ticker,
      ),
    });
  }

  private _formChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    // ha-form only knows about the scalar options; tickers stay as they are.
    this._emit({
      ...this._config!,
      ...ev.detail.value,
      tickers: this._config!.tickers ?? [],
    });
  }

  private _add(entity: string): void {
    this._setTickers([...this._tickers, { entity }]);
  }

  private _remove(index: number): void {
    const tickers = this._tickers;
    tickers.splice(index, 1);
    this._setTickers(tickers);
  }

  private _move(index: number, delta: number): void {
    const tickers = this._tickers;
    const target = index + delta;
    if (target < 0 || target >= tickers.length) return;
    [tickers[index], tickers[target]] = [tickers[target], tickers[index]];
    this._setTickers(tickers);
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    const selected = this._tickers;
    const chosen = new Set(selected.map((ticker) => ticker.entity));
    const filter = this._filter.trim().toLowerCase();
    const available = discoverTickers(this.hass)
      .filter((entity) => !chosen.has(entity))
      .filter((entity) => {
        if (!filter) return true;
        const ticker = readTicker(this.hass!, entity);
        return `${ticker?.symbol} ${entity}`.toLowerCase().includes(filter);
      });

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._formChanged}
      ></ha-form>

      <div class="section-head">
        <span class="grow">Tickers shown</span>
        <span class="count">${selected.length}</span>
      </div>
      ${selected.length
        ? html`
            <ul class="list">
              ${repeat(
                selected,
                (ticker) => ticker.entity,
                (ticker, index) => this._renderSelected(ticker, index, selected.length),
              )}
            </ul>
          `
        : html`<div class="empty-state">
            Nothing selected yet — add tickers from the list below.
          </div>`}

      <div class="section-head">
        <span class="grow">Available tickers</span>
        <span class="count">${available.length}</span>
      </div>
      <div class="filter">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          type="search"
          placeholder="Filter tickers"
          .value=${this._filter}
          @input=${(e: Event) => (this._filter = (e.target as HTMLInputElement).value)}
        />
      </div>
      ${available.length
        ? html`
            <ul class="list">
              ${repeat(
                available,
                (entity) => entity,
                (entity) => this._renderAvailable(entity),
              )}
            </ul>
          `
        : html`<div class="empty-state">
            ${filter
              ? "No tickers match that filter."
              : "No further price sensors found. Tickers appear here once the PoLR Stocks integration is set up."}
          </div>`}
    `;
  }

  private _renderSelected(
    config: TickerConfig,
    index: number,
    total: number,
  ): TemplateResult {
    const ticker = readTicker(this.hass!, config.entity);

    return html`
      <li class="row">
        <div class="tile-icon">
          <ha-icon .icon=${config.icon ?? "mdi:chart-line"}></ha-icon>
        </div>
        <div class="tile-info">
          <div class="primary">
            <span>${config.name ?? ticker?.symbol ?? config.entity}</span>
          </div>
          <div class="secondary">
            <span>${ticker ? config.entity : "Entity not found"}</span>
          </div>
        </div>
        <button
          class="icon-button"
          title="Move up"
          .disabled=${index === 0}
          @click=${() => this._move(index, -1)}
        >
          <ha-icon icon="mdi:arrow-up"></ha-icon>
        </button>
        <button
          class="icon-button"
          title="Move down"
          .disabled=${index === total - 1}
          @click=${() => this._move(index, 1)}
        >
          <ha-icon icon="mdi:arrow-down"></ha-icon>
        </button>
        <button class="icon-button danger" title="Remove" @click=${() => this._remove(index)}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </li>
    `;
  }

  private _renderAvailable(entity: string): TemplateResult {
    const ticker = readTicker(this.hass!, entity);
    return html`
      <li class="row">
        <div class="tile-icon"><ha-icon icon="mdi:chart-line"></ha-icon></div>
        <div class="tile-info">
          <div class="primary"><span>${ticker?.symbol ?? entity}</span></div>
          <div class="secondary"><span>${entity}</span></div>
        </div>
        <button class="icon-button" title="Add" @click=${() => this._add(entity)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </li>
    `;
  }

  static override styles = [
    tileStyles,
    css`
      :host {
        display: block;
      }
      ha-form {
        display: block;
        margin-bottom: var(--ha-space-2, 8px);
      }
      ul.list {
        padding: 0;
      }
      .filter {
        display: flex;
        align-items: center;
        gap: var(--ha-space-2, 8px);
        height: 40px;
        margin-bottom: var(--ha-space-2, 8px);
        padding: 0 var(--ha-space-3, 12px);
        border-radius: var(--radius-md);
        color: var(--secondary-text-color);
        background-color: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
        --mdc-icon-size: 18px;
      }
      .filter input {
        flex: 1 1 auto;
        min-width: 0;
        border: none;
        outline: none;
        background: none;
        font-family: inherit;
        font-size: var(--ha-font-size-m, 14px);
        color: var(--primary-text-color);
      }
      /* The kit sizes icon buttons for a card; an editor row is tighter. */
      .icon-button {
        width: 36px;
        height: 36px;
        --mdc-icon-size: 20px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "polr-stocks-editor": PolrStocksEditor;
  }
}
