// Unit tests for the ICRI engine. Run with a TS-aware test runner, e.g.:
//   npx vitest run lib/pilot/icri.test.ts
//   (or)  node --import tsx --test lib/pilot/icri.test.ts
import { test } from "node:test"
import assert from "node:assert/strict"
import { bandFor, computeIcri, DEFAULT_WEIGHTS, type IcriInput } from "./icri"

function base(overrides: Partial<IcriInput> = {}): IcriInput {
  return {
    facilityId: "TEST",
    hotDays: 0, floodProbability: 0, rainfallAnomalyPct: 0,
    powerSource: "grid_reliable", coldChainEquip: "sdd", coldChainStatus: "functional", accessTier: "ok",
    dropoutPct: 0, under1Catchment: 0, maxCatchment: 2600, outreachReliance: "fixed",
    hazardQuality: "estimated", immunizationQuality: "estimated",
    ...overrides,
  }
}

test("bandFor thresholds", () => {
  assert.equal(bandFor(0), "low")
  assert.equal(bandFor(24), "low")
  assert.equal(bandFor(25), "moderate")
  assert.equal(bandFor(49), "moderate")
  assert.equal(bandFor(50), "high")
  assert.equal(bandFor(74), "high")
  assert.equal(bandFor(75), "severe")
  assert.equal(bandFor(100), "severe")
})

test("best-case facility scores low", () => {
  const r = computeIcri(base())
  assert.ok(r.score < 25, `expected low, got ${r.score}`)
  assert.equal(r.band, "low")
})

test("worst-case facility scores severe", () => {
  const r = computeIcri(base({
    hotDays: 10, floodProbability: 0.6, rainfallAnomalyPct: 55,
    powerSource: "none", coldChainEquip: "none", coldChainStatus: "non_functional", accessTier: "severe",
    dropoutPct: 45, under1Catchment: 2600, outreachReliance: "outreach_heavy",
  }))
  assert.ok(r.score >= 75, `expected severe, got ${r.score}`)
  assert.equal(r.band, "severe")
})

test("worked example from the spec lands High", () => {
  // 6 hot days, ice lined fridge on intermittent grid, no solar; ~22% dropout, outreach heavy
  const r = computeIcri(base({
    hotDays: 6, floodProbability: 0.1, rainfallAnomalyPct: 10,
    powerSource: "grid_intermittent", coldChainEquip: "ilr", coldChainStatus: "intermittent",
    accessTier: "road_only", dropoutPct: 22, under1Catchment: 1500, outreachReliance: "outreach_heavy",
  }))
  assert.equal(r.band, "high", `expected high, got ${r.band} (${r.score})`)
  assert.equal(r.contributions[0].component !== undefined, true)
})

test("missing data downgrades confidence", () => {
  const r = computeIcri(base({ hazardQuality: "unavailable" }))
  assert.equal(r.confidence, "unavailable")
})

test("contributions are sorted descending", () => {
  const r = computeIcri(base({ hotDays: 5, dropoutPct: 30, powerSource: "none" }))
  for (let i = 1; i < r.contributions.length; i++) {
    assert.ok(r.contributions[i - 1].points >= r.contributions[i].points)
  }
})

test("weights sum drives score range", () => {
  const w = DEFAULT_WEIGHTS
  assert.ok(Math.abs(w.wH + w.wV + w.wL - 1) < 1e-9)
})
