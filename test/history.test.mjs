import assert from "node:assert/strict";
import { test } from "node:test";

import {
  downsample,
  readSeries,
  seriesDirection,
  sparklinePath,
} from "./.build/history.mjs";

const GOOGL = "sensor.polr_stocks_googl";

// What history/history_during_period returns with minimal_response: `s` for
// state, `lu` for last-updated.
const response = {
  [GOOGL]: [
    { s: "170.00", lu: 1710400000 },
    { s: "171.50", lu: 1710400060 },
    { s: "172.61", lu: 1710400120 },
  ],
};

test("readSeries pulls numeric prices in order", () => {
  assert.deepEqual(readSeries(response, GOOGL), [170.0, 171.5, 172.61]);
});

test("readSeries drops non-numeric recorder states", () => {
  // The recorder stores these as states like any other.
  const withGaps = {
    [GOOGL]: [{ s: "170.00" }, { s: "unavailable" }, { s: "unknown" }, { s: "172.61" }],
  };
  assert.deepEqual(readSeries(withGaps, GOOGL), [170.0, 172.61]);
});

test("readSeries also accepts the verbose shape", () => {
  const verbose = { [GOOGL]: [{ state: "1.5" }, { state: "2.5" }] };
  assert.deepEqual(readSeries(verbose, GOOGL), [1.5, 2.5]);
});

test("readSeries is empty for missing entities or no response", () => {
  assert.deepEqual(readSeries(response, "sensor.nope"), []);
  assert.deepEqual(readSeries(undefined, GOOGL), []);
  assert.deepEqual(readSeries({ [GOOGL]: "not an array" }, GOOGL), []);
});

test("downsample leaves short series alone", () => {
  const values = [1, 2, 3];
  assert.deepEqual(downsample(values, 96), values);
});

test("downsample caps length and keeps the endpoints", () => {
  const values = Array.from({ length: 500 }, (_, i) => i);
  const out = downsample(values, 96);
  assert.equal(out.length, 96);
  assert.equal(out[0], 0);
  assert.equal(out[out.length - 1], 499);
});

test("sparklinePath needs at least two points", () => {
  // One price is not a trend, and a degenerate path renders as a stray dot.
  assert.equal(sparklinePath([5], 64, 26), "");
  assert.equal(sparklinePath([], 64, 26), "");
});

test("sparklinePath spans the full width and inverts y for screen space", () => {
  const path = sparklinePath([0, 10], 64, 26, 2);
  const points = path.split(" ");
  assert.equal(points.length, 2);
  assert.ok(points[0].startsWith("M0.00,"));
  assert.ok(points[1].startsWith("L64.00,"));
  // Low value sits at the bottom, high at the top.
  const y0 = Number(points[0].split(",")[1]);
  const y1 = Number(points[1].split(",")[1]);
  assert.ok(y0 > y1, `expected ${y0} below ${y1}`);
});

test("sparklinePath centres a flat series instead of dividing by zero", () => {
  // Guards a real failure: span 0 would make every y NaN and blank the line.
  const path = sparklinePath([7, 7, 7], 64, 26, 2);
  assert.ok(!path.includes("NaN"), path);
  const ys = path.split(" ").map((p) => Number(p.split(",")[1]));
  assert.ok(ys.every((y) => y === ys[0]));
});

test("sparklinePath respects padding", () => {
  const path = sparklinePath([0, 10], 20, 10, 2);
  const ys = path.split(" ").map((p) => Number(p.split(",")[1]));
  assert.ok(Math.min(...ys) >= 2, path);
  assert.ok(Math.max(...ys) <= 8, path);
});

test("seriesDirection compares first to last", () => {
  assert.equal(seriesDirection([1, 5, 3]), "up");
  assert.equal(seriesDirection([5, 1, 2]), "down");
  assert.equal(seriesDirection([4, 9, 4]), "flat");
  assert.equal(seriesDirection([4]), "flat");
  assert.equal(seriesDirection([]), "flat");
});
