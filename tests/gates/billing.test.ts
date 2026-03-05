import test from "node:test";
import assert from "node:assert/strict";
import { deriveEntitlementDecision, isSubscriptionEntitled } from "../../server/lib/stripe-entitlements";

test("subscription entitlement statuses are mapped correctly", () => {
  assert.equal(isSubscriptionEntitled("active"), true);
  assert.equal(isSubscriptionEntitled("trialing"), true);
  assert.equal(isSubscriptionEntitled("past_due"), true);
  assert.equal(isSubscriptionEntitled("unpaid"), false);
  assert.equal(isSubscriptionEntitled("canceled"), false);
});

test("checkout completion grants premium and stores stripe ids", () => {
  const decision = deriveEntitlementDecision("checkout.session.completed", {
    metadata: { userId: "user_1" },
    customer: "cus_123",
    subscription: "sub_123",
  });

  assert.equal(decision.matchBy, "userId");
  assert.equal(decision.matchValue, "user_1");
  assert.deepEqual(decision.patch, {
    isPremium: true,
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
  });
});

test("failed invoice revokes premium entitlements", () => {
  const decision = deriveEntitlementDecision("invoice.payment_failed", {
    customer: "cus_999",
  });

  assert.equal(decision.matchBy, "customerId");
  assert.equal(decision.matchValue, "cus_999");
  assert.equal(decision.patch?.isPremium, false);
  assert.equal(decision.patch?.stripeSubscriptionId, null);
  assert.equal(decision.patch?.currentPeriodEnd, null);
});

test("successful invoice grants premium and propagates period end", () => {
  const decision = deriveEntitlementDecision("invoice.payment_succeeded", {
    customer: "cus_777",
    subscription: "sub_777",
    lines: {
      data: [
        {
          period: {
            end: 1_800_000_000,
          },
        },
      ],
    },
  });

  assert.equal(decision.matchBy, "customerId");
  assert.equal(decision.matchValue, "cus_777");
  assert.equal(decision.patch?.isPremium, true);
  assert.equal(decision.patch?.stripeSubscriptionId, "sub_777");
  assert.ok(decision.patch?.currentPeriodEnd instanceof Date);
});
