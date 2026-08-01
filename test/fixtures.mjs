/**
 * A fake `hass` shaped like the real thing: polr_stocks price sensors carry the
 * day's numbers on attributes, and other monetary sensors (a SimpleFIN balance
 * here) exist alongside them so discovery ordering has something to sort.
 */

const quote = (entityId, state, attributes = {}) => ({
  entity_id: entityId,
  state,
  attributes: {
    device_class: "monetary",
    unit_of_measurement: "USD",
    ...attributes,
  },
});

export const makeHass = () => ({
  locale: { language: "en" },
  // The frontend's entity registry view, which carries the owning platform.
  entities: {
    "sensor.polr_stocks_googl": { platform: "polr_stocks" },
    "sensor.polr_stocks_msft": { platform: "polr_stocks" },
    "sensor.polr_stocks_nvda": { platform: "polr_stocks" },
    "sensor.polr_stocks_amzn": { platform: "polr_stocks" },
    // A template-backed fixture: not our platform, but it carries a symbol.
    "sensor.polr_stocks_tsla": { platform: "template" },
    "sensor.wells_fargo_checking_balance": { platform: "simplefin" },
  },
  states: {
    // Up on the day, priced from a live trade.
    "sensor.polr_stocks_googl": quote("sensor.polr_stocks_googl", "172.61", {
      friendly_name: "POLR Stocks GOOGL",
      symbol: "GOOGL",
      change: 2.61,
      change_percent: 1.5353,
      previous_close: 170.0,
      open: 170.0,
      high: 173.71,
      low: 169.5,
      quoted_at: "2024-03-14T15:18:24.114Z",
    }),

    // Down on the day.
    "sensor.polr_stocks_msft": quote("sensor.polr_stocks_msft", "412.34", {
      friendly_name: "POLR Stocks MSFT",
      symbol: "MSFT",
      change: -7.77,
      change_percent: -1.8495,
      previous_close: 420.11,
      high: 421.0,
      low: 411.2,
    }),

    // Flat on the day.
    "sensor.polr_stocks_nvda": quote("sensor.polr_stocks_nvda", "875.28", {
      friendly_name: "POLR Stocks NVDA",
      symbol: "NVDA",
      change: 0,
      change_percent: 0,
      previous_close: 875.28,
      high: 880.0,
      low: 868.5,
    }),

    // Offline.
    "sensor.polr_stocks_amzn": quote("sensor.polr_stocks_amzn", "unavailable", {
      friendly_name: "POLR Stocks AMZN",
      symbol: "AMZN",
    }),

    // Template-backed, so discovery has to find it by its `symbol` attribute.
    "sensor.polr_stocks_tsla": quote("sensor.polr_stocks_tsla", "175.00", {
      friendly_name: "POLR Stocks TSLA",
      symbol: "TSLA",
      change: 1.0,
      change_percent: 0.5747,
    }),

    // A monetary sensor that is NOT a stock — a bank balance. Must never be
    // offered as a ticker.
    "sensor.wells_fargo_checking_balance": quote(
      "sensor.wells_fargo_checking_balance",
      "4210.55",
      { friendly_name: "Wells Fargo Checking Balance" },
    ),

    // Not monetary — must never show up as a ticker.
    "sensor.living_room_temperature": {
      entity_id: "sensor.living_room_temperature",
      state: "21.5",
      attributes: { device_class: "temperature", unit_of_measurement: "°C" },
    },
  },
});

export const GOOGL = "sensor.polr_stocks_googl";
export const MSFT = "sensor.polr_stocks_msft";
export const NVDA = "sensor.polr_stocks_nvda";
export const AMZN = "sensor.polr_stocks_amzn";
export const TSLA = "sensor.polr_stocks_tsla";
export const CHECKING = "sensor.wells_fargo_checking_balance";
