import test from "node:test";
import assert from "node:assert/strict";
import { computeSM2 } from "../../server/recall/sm2";

test("perfect recall increases interval and ease factor", () => {
  const result = computeSM2({
    easeFactor: 250,
    intervalDays: 1,
    repetitions: 0,
    quality: 5,
  });
  assert.equal(result.repetitions, 1);
  assert.equal(result.intervalDays, 1); // first correct → 1 day
  assert.ok(result.easeFactor >= 250); // perfect recall doesn't decrease EF
});

test("second correct review yields 6-day interval", () => {
  const result = computeSM2({
    easeFactor: 260,
    intervalDays: 1,
    repetitions: 1,
    quality: 4,
  });
  assert.equal(result.repetitions, 2);
  assert.equal(result.intervalDays, 6); // second correct → 6 days
});

test("third+ correct review multiplies interval by ease factor", () => {
  const result = computeSM2({
    easeFactor: 250,
    intervalDays: 6,
    repetitions: 2,
    quality: 4,
  });
  assert.equal(result.repetitions, 3);
  assert.equal(result.intervalDays, 15); // 6 × 2.5 = 15
});

test("failed recall resets repetitions and interval", () => {
  const result = computeSM2({
    easeFactor: 250,
    intervalDays: 30,
    repetitions: 5,
    quality: 1,
  });
  assert.equal(result.repetitions, 0);
  assert.equal(result.intervalDays, 1);
});

test("ease factor never drops below 130", () => {
  const result = computeSM2({
    easeFactor: 130,
    intervalDays: 1,
    repetitions: 0,
    quality: 0,
  });
  assert.equal(result.easeFactor, 130);
});

test("interval never exceeds 365 days", () => {
  const result = computeSM2({
    easeFactor: 300,
    intervalDays: 300,
    repetitions: 10,
    quality: 5,
  });
  assert.ok(result.intervalDays <= 365);
});
