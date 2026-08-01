import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./polr-stocks-editor";
import { tileStyles } from "./kit/styles";
import {
  showMoreInfo,
  stateColor,
  type HassEntity,
  type HomeAssistant,
} from "./kit/types";

const CARD_VERSION = "0.1.0";

/* eslint-disable no-console */
console.info(
  `%c POLR-STOCKS %c v${CARD_VERSION} `,
  "color:#fff;background:#3f51b5;font-weight:700",
  "color:#3f51b5;background:#fff;font-weight:700",
);

export interface PolrStocksConfig {
  type: string;
  entity: string;
  name?: string;
  icon?: string;
}

@customElement("polr-stocks")
export class PolrStocks extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: PolrStocksConfig;

  static override styles = tileStyles;

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("polr-stocks-editor");
  }

  public static getStubConfig(hass: HomeAssistant): Partial<PolrStocksConfig> {
    return { entity: Object.keys(hass?.states ?? {})[0] ?? "" };
  }

  public setConfig(config: PolrStocksConfig): void {
    if (!config?.entity) throw new Error("polr-stocks: 'entity' is required");
    this._config = { ...config };
  }

  public getCardSize(): number {
    return 1;
  }

  private get _stateObj(): HassEntity | undefined {
    return this._config ? this.hass?.states[this._config.entity] : undefined;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;

    const stateObj = this._stateObj;
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="notice error">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div class="grow">Entity not found: <code>${this._config.entity}</code></div>
          </div>
        </ha-card>
      `;
    }

    const domain = this._config.entity.split(".")[0];
    const name =
      this._config.name ?? stateObj.attributes.friendly_name ?? this._config.entity;

    return html`
      <ha-card style=${`--tile-color: ${stateColor(domain, stateObj.state)}`}>
        <div class="tile">
          <div
            class="tile-icon interactive"
            role="button"
            tabindex="0"
            @click=${() => showMoreInfo(this, this._config!.entity)}
            @keydown=${(e: KeyboardEvent) =>
              (e.key === "Enter" || e.key === " ") &&
              showMoreInfo(this, this._config!.entity)}
          >
            <ha-icon
              .icon=${this._config.icon ?? stateObj.attributes.icon ?? "mdi:card-outline"}
            ></ha-icon>
          </div>
          <div class="tile-info">
            <div class="primary"><span>${name}</span></div>
            <div class="secondary"><span>${stateObj.state}</span></div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "polr-stocks": PolrStocks;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "polr-stocks",
  name: "Polr Stocks",
  description: "Polr Stocks for Home Assistant.",
  preview: true,
});
