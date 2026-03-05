import test from "node:test";
import assert from "node:assert/strict";
import { getBillingProviderFromNativeFlag } from "../../client/src/lib/billing";

test("billing provider uses web stripe on web runtime", () => {
  assert.equal(getBillingProviderFromNativeFlag(false), "web_stripe");
});

test("billing provider uses native store on native runtime", () => {
  assert.equal(getBillingProviderFromNativeFlag(true), "native_store");
});
