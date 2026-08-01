import assert from "node:assert/strict";
import { test } from "node:test";

import {
  changeDirection,
  discoverTickers,
  formatChange,
  formatPercent,
  formatPrice,
  formatVolume,
  isDerivedPrice,
  isPriceSensor,
  num,
  readTicker,
} from "./.build/stocks.mjs";
import { AMZN, CHECKING, GOOGL, MSFT, NVDA, TSLA, makeHass } from "./fixtures.mjs";

test("num coerces attributes and rejects junk", () => {
  assert.equal(num(1.5), 1.5);
  assert.equal(num("1.5"), 1.5);
  assert.equal(num(0), 0);
  assert.equal(num(null), null);
  assert.equal(num(undefined), null);
  assert.equal(num(""), null);
  assert.equal(num("abc"), null);
  // A change of exactly 0 is meaningful (flat), not missing.
  assert.equal(num("0"), 0);
});

test("isPriceSensor accepts monetary sensors only", () => {
  const hass = makeHass();
  assert.equal(isPriceSensor(hass.states[GOOGL]), true);
  assert.equal(isPriceSensor(hass.states["sensor.living_room_temperature"]), false);
  assert.equal(isPriceSensor(undefined), false);
});

test("discoverTickers lists polr_stocks sensors first, then other monetary ones", () => {
  const found = discoverTickers(makeHass());
  assert.deepEqual(found, [AMZN, GOOGL, MSFT, NVDA, TSLA, CHECKING]);
  assert.ok(!found.includes("sensor.living_room_temperature"));
});

test("readTicker pulls price and the day's numbers off attributes", () => {
  const ticker = readTicker(makeHass(), GOOGL);
  assert.equal(ticker.symbol, "GOOGL");
  assert.equal(ticker.price, 172.61);
  assert.equal(ticker.change, 2.61);
  assert.equal(ticker.changePercent, 1.5353);
  assert.equal(ticker.previousClose, 170.0);
  assert.equal(ticker.volume, 56457696);
  assert.equal(ticker.currency, "USD");
  assert.equal(ticker.available, true);
});

test("readTicker derives the symbol from the entity id when unset", () => {
  assert.equal(readTicker(makeHass(), TSLA).symbol, "TSLA");
});

test("readTicker marks unavailable entities and yields no price", () => {
  const ticker = readTicker(makeHass(), AMZN);
  assert.equal(ticker.available, false);
  assert.equal(ticker.price, null);
});

test("readTicker returns undefined for a missing entity", () => {
  assert.equal(readTicker(makeHass(), "sensor.nope"), undefined);
});

test("changeDirection reads the sign of the day", () => {
  const hass = makeHass();
  assert.equal(changeDirection(readTicker(hass, GOOGL)), "up");
  assert.equal(changeDirection(readTicker(hass, MSFT)), "down");
  assert.equal(changeDirection(readTicker(hass, NVDA)), "flat");
  // Unavailable has no direction to report.
  assert.equal(changeDirection(readTicker(hass, AMZN)), "unknown");
  assert.equal(changeDirection(undefined), "unknown");
});

test("changeDirection prefers percent over a sub-cent absolute move", () => {
  const hass = makeHass();
  // A tiny gain rounds to 0.00 in the amount but still carries a sign in percent.
  hass.states[GOOGL].attributes.change = 0;
  hass.states[GOOGL].attributes.change_percent = 0.004;
  assert.equal(changeDirection(readTicker(hass, GOOGL)), "up");
});

test("changeDirection is unknown when the change is missing entirely", () => {
  const hass = makeHass();
  delete hass.states[GOOGL].attributes.change;
  delete hass.states[GOOGL].attributes.change_percent;
  assert.equal(changeDirection(readTicker(hass, GOOGL)), "unknown");
});

test("isDerivedPrice flags prices carried over from a stale bar", () => {
  const hass = makeHass();
  assert.equal(isDerivedPrice(readTicker(hass, GOOGL)), false);
  assert.equal(isDerivedPrice(readTicker(hass, NVDA)), true);
  // Unavailable is its own state; don't also call it delayed.
  assert.equal(isDerivedPrice(readTicker(hass, AMZN)), false);
});

test("formatPrice renders currency and handles missing values", () => {
  assert.equal(formatPrice(172.61, "USD", "en"), "$172.61");
  assert.equal(formatPrice(null), "—");
  // An unknown currency code must not throw mid-render.
  assert.equal(formatPrice(10, "NOTACURRENCY", "en"), "10.00 NOTACURRENCY");
});

test("formatChange always carries a sign", () => {
  assert.equal(formatChange(2.61, "USD", "en"), "+$2.61");
  assert.equal(formatChange(-7.77, "USD", "en"), "−$7.77");
  assert.equal(formatChange(0, "USD", "en"), "$0.00");
  assert.equal(formatChange(null), "—");
});

test("formatPercent always carries a sign", () => {
  assert.equal(formatPercent(1.5353, "en"), "+1.54%");
  assert.equal(formatPercent(-1.8495, "en"), "−1.85%");
  assert.equal(formatPercent(0, "en"), "0.00%");
  assert.equal(formatPercent(null), "—");
});

test("formatVolume is compact", () => {
  assert.equal(formatVolume(56457696, "en"), "56.5M");
  assert.equal(formatVolume(null), "—");
});
