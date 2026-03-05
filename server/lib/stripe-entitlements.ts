type StripeSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "unknown";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<StripeSubscriptionStatus>([
  "active",
  "trialing",
  "past_due",
]);

export interface StripeEntitlementPatch {
  isPremium?: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
}

export interface StripeEntitlementDecision {
  matchBy: "userId" | "customerId" | null;
  matchValue: string | null;
  patch: StripeEntitlementPatch | null;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

function toDateFromUnixSeconds(value: unknown): Date | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return new Date(value * 1000);
  }
  return null;
}

function normalizeSubscriptionStatus(value: unknown): StripeSubscriptionStatus {
  if (typeof value !== "string") return "unknown";
  const normalized = value.toLowerCase() as StripeSubscriptionStatus;
  return normalized;
}

function parseInvoicePeriodEnd(invoice: any): Date | null {
  const linePeriodEnd = invoice?.lines?.data?.[0]?.period?.end;
  if (typeof linePeriodEnd === "number") {
    return toDateFromUnixSeconds(linePeriodEnd);
  }
  return toDateFromUnixSeconds(invoice?.period_end);
}

export function isSubscriptionEntitled(status: unknown): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(normalizeSubscriptionStatus(status));
}

export function deriveEntitlementDecision(eventType: string, eventObject: any): StripeEntitlementDecision {
  switch (eventType) {
    case "checkout.session.completed": {
      const userId = toNullableString(eventObject?.metadata?.userId);
      const customerId = toNullableString(eventObject?.customer);
      const subscriptionId = toNullableString(eventObject?.subscription);
      const patch: StripeEntitlementPatch = {
        isPremium: true,
      };
      if (customerId) patch.stripeCustomerId = customerId;
      if (subscriptionId) patch.stripeSubscriptionId = subscriptionId;

      if (userId) {
        return { matchBy: "userId", matchValue: userId, patch };
      }
      if (customerId) {
        return { matchBy: "customerId", matchValue: customerId, patch };
      }
      return { matchBy: null, matchValue: null, patch: null };
    }

    case "customer.subscription.updated": {
      const customerId = toNullableString(eventObject?.customer);
      if (!customerId) return { matchBy: null, matchValue: null, patch: null };

      const entitled = isSubscriptionEntitled(eventObject?.status);
      const subscriptionId = toNullableString(eventObject?.id);
      const patch: StripeEntitlementPatch = {
        isPremium: entitled,
        currentPeriodEnd: toDateFromUnixSeconds(eventObject?.current_period_end),
        stripeSubscriptionId: entitled ? (subscriptionId ?? null) : null,
      };
      return { matchBy: "customerId", matchValue: customerId, patch };
    }

    case "customer.subscription.deleted": {
      const customerId = toNullableString(eventObject?.customer);
      if (!customerId) return { matchBy: null, matchValue: null, patch: null };
      return {
        matchBy: "customerId",
        matchValue: customerId,
        patch: {
          isPremium: false,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      };
    }

    case "invoice.payment_failed": {
      const customerId = toNullableString(eventObject?.customer);
      if (!customerId) return { matchBy: null, matchValue: null, patch: null };
      return {
        matchBy: "customerId",
        matchValue: customerId,
        patch: {
          isPremium: false,
          currentPeriodEnd: null,
          stripeSubscriptionId: null,
        },
      };
    }

    case "invoice.payment_succeeded": {
      const customerId = toNullableString(eventObject?.customer);
      if (!customerId) return { matchBy: null, matchValue: null, patch: null };

      const subscriptionId = toNullableString(eventObject?.subscription);
      const patch: StripeEntitlementPatch = {
        isPremium: true,
        currentPeriodEnd: parseInvoicePeriodEnd(eventObject),
      };
      if (subscriptionId) patch.stripeSubscriptionId = subscriptionId;

      return {
        matchBy: "customerId",
        matchValue: customerId,
        patch,
      };
    }

    default:
      return { matchBy: null, matchValue: null, patch: null };
  }
}
