import { Capacitor } from "@capacitor/core";
import { apiRequest } from "@/lib/queryClient";

export type BillingProvider = "web_stripe" | "native_store";
export type BillingPlan = "monthly" | "yearly";

export interface BillingActionResult {
  ok: boolean;
  code?: string;
  message?: string;
  redirectUrl?: string;
}

export function getBillingProviderFromNativeFlag(isNativePlatform: boolean): BillingProvider {
  return isNativePlatform ? "native_store" : "web_stripe";
}

export function getBillingProvider(): BillingProvider {
  return getBillingProviderFromNativeFlag(Capacitor.isNativePlatform());
}

async function runWebCheckout(plan: BillingPlan): Promise<BillingActionResult> {
  try {
    const res = await apiRequest("POST", "/api/stripe/create-checkout-session", { plan });
    const data = await res.json();

    if (data?.url) {
      return { ok: true, redirectUrl: data.url };
    }

    return {
      ok: false,
      code: data?.code || "STRIPE_CHECKOUT_FAILED",
      message: data?.message || "Unable to start checkout.",
    };
  } catch (err: any) {
    // C2 fix: Catch network/API errors instead of letting them propagate as unhandled rejections
    return {
      ok: false,
      code: "STRIPE_CHECKOUT_ERROR",
      message: err?.message?.replace(/^\d+:\s*/, "") || "Unable to start checkout. Please try again.",
    };
  }
}

async function runWebPortal(): Promise<BillingActionResult> {
  try {
    const res = await apiRequest("POST", "/api/stripe/create-portal-session");
    const data = await res.json();

    if (data?.url) {
      return { ok: true, redirectUrl: data.url };
    }

    return {
      ok: false,
      code: data?.code || "STRIPE_PORTAL_FAILED",
      message: data?.message || "Unable to open subscription management.",
    };
  } catch (err: any) {
    return {
      ok: false,
      code: "STRIPE_PORTAL_ERROR",
      message: err?.message?.replace(/^\d+:\s*/, "") || "Unable to open subscription management. Please try again.",
    };
  }
}

export async function startUpgrade(plan: BillingPlan): Promise<BillingActionResult> {
  const provider = getBillingProvider();

  if (provider === "web_stripe") {
    return runWebCheckout(plan);
  }

  return {
    ok: false,
    code: "NATIVE_STORE_BILLING_REQUIRED",
    message: "Native in-app purchase flow is required in App Store and Google Play builds.",
  };
}

export async function openSubscriptionManagement(): Promise<BillingActionResult> {
  const provider = getBillingProvider();

  if (provider === "web_stripe") {
    return runWebPortal();
  }

  return {
    ok: false,
    code: "MANAGE_IN_DEVICE_SETTINGS",
    message: "Manage your subscription in your device App Store/Google Play subscription settings.",
  };
}
