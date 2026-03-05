import type { Express, Request, Response } from "express";
import { isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { users } from "@shared/models/auth";
import { stripeWebhookEvents } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { deriveEntitlementDecision } from "./lib/stripe-entitlements";

function getStripeKey(): string | null {
  return process.env.STRIPE_SECRET_KEY || null;
}

function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET || null;
}

function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

const fallbackProcessedStripeEvents = new Set<string>();

function logStripeWebhook(message: string, metadata?: Record<string, unknown>) {
  if (metadata) {
    console.log(`[Stripe][Webhook] ${message}`, metadata);
    return;
  }
  console.log(`[Stripe][Webhook] ${message}`);
}

async function hasProcessedStripeEvent(eventId: string): Promise<boolean> {
  try {
    const existing = await db.select({ id: stripeWebhookEvents.id })
      .from(stripeWebhookEvents)
      .where(eq(stripeWebhookEvents.id, eventId))
      .limit(1);
    return existing.length > 0;
  } catch {
    return fallbackProcessedStripeEvents.has(eventId);
  }
}

async function markStripeEventProcessed(eventId: string, eventType: string): Promise<void> {
  try {
    await db.insert(stripeWebhookEvents).values({
      id: eventId,
      eventType,
    }).onConflictDoNothing();
  } catch {
    fallbackProcessedStripeEvents.add(eventId);
  }
}

export function registerStripeRoutes(app: Express) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe] STRIPE_SECRET_KEY is not set. Payment features will be unavailable.");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("[Stripe] STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail.");
  }
  if (!process.env.STRIPE_MONTHLY_PRICE_ID) {
    console.warn("[Stripe] STRIPE_MONTHLY_PRICE_ID is not set. Monthly subscriptions will be unavailable.");
  }
  if (!process.env.STRIPE_YEARLY_PRICE_ID) {
    console.warn("[Stripe] STRIPE_YEARLY_PRICE_ID is not set. Yearly subscriptions will be unavailable.");
  }

  app.get("/api/stripe/status", (_req: Request, res: Response) => {
    const configured = isStripeConfigured();
    res.json({
      configured,
      message: configured
        ? "Stripe is configured and ready."
        : "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables to enable payments.",
    });
  });

  app.get("/api/mobile/billing/status", (_req: Request, res: Response) => {
    const appleEnabled = process.env.APPLE_IAP_ENABLED === "true";
    const googleEnabled = process.env.GOOGLE_IAP_ENABLED === "true";
    res.json({
      configured: appleEnabled || googleEnabled,
      ios: appleEnabled,
      android: googleEnabled,
      message: appleEnabled || googleEnabled
        ? "Native store billing is enabled."
        : "Native store billing is not enabled yet. Configure APPLE_IAP_ENABLED / GOOGLE_IAP_ENABLED.",
    });
  });

  app.get("/api/mobile/billing/entitlement", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const dbUser = await authStorage.getUser(userId);
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      isPremium: !!dbUser.isPremium,
      currentPeriodEnd: dbUser.currentPeriodEnd ?? null,
      stripeSubscriptionId: dbUser.stripeSubscriptionId ?? null,
    });
  });

  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: any, res: Response) => {
    const stripeKey = getStripeKey();
    if (!stripeKey) {
      return res.status(503).json({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured. Contact the administrator to set up payments.",
      });
    }

    try {
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(stripeKey);
      const userId = req.user.claims.sub;
      const dbUser = await authStorage.getUser(userId);
      if (!dbUser) return res.status(401).json({ message: "User not found" });

      const { plan } = req.body;
      const priceId = plan === "yearly"
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

      if (!priceId) {
        return res.status(503).json({
          code: "STRIPE_PRICE_NOT_CONFIGURED",
          message: `Stripe ${plan || "monthly"} price ID is not configured.`,
        });
      }

      let customerId = dbUser.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeClient.customers.create({
          email: dbUser.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session = await stripeClient.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/vault?session=success`,
        cancel_url: `${baseUrl}/vault?session=cancelled`,
        metadata: { userId },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/create-portal-session", isAuthenticated, async (req: any, res: Response) => {
    const stripeKey = getStripeKey();
    if (!stripeKey) {
      return res.status(503).json({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured. Contact the administrator to set up payments.",
      });
    }

    try {
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(stripeKey);
      const userId = req.user.claims.sub;
      const dbUser = await authStorage.getUser(userId);
      if (!dbUser?.stripeCustomerId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session = await stripeClient.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: `${baseUrl}/vault`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe portal error:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    const stripeKey = getStripeKey();
    const webhookSecret = getStripeWebhookSecret();
    if (!stripeKey || !webhookSecret) {
      console.warn("[Stripe] Webhook received but Stripe is not configured. Ignoring.");
      return res.status(503).json({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe webhooks not configured",
      });
    }

    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      console.warn("[Stripe] Webhook received without stripe-signature header.");
      return res.status(400).json({ message: "Missing stripe-signature header" });
    }

    if (!req.rawBody) {
      console.error("[Stripe] Raw body not available for webhook verification. Ensure express.json verify middleware is configured.");
      return res.status(500).json({ message: "Server configuration error: raw body not available" });
    }

    try {
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(stripeKey);
      const event = stripeClient.webhooks.constructEvent(
        req.rawBody as string,
        sig,
        webhookSecret,
      );

      if (await hasProcessedStripeEvent(event.id)) {
        logStripeWebhook("Duplicate event skipped", {
          eventId: event.id,
          eventType: event.type,
        });
        return res.json({ received: true, duplicate: true });
      }

      const decision = deriveEntitlementDecision(event.type, event.data.object as any);
      if (!decision.patch || !decision.matchBy || !decision.matchValue) {
        await markStripeEventProcessed(event.id, event.type);
        logStripeWebhook("Event ignored (no entitlement action)", {
          eventId: event.id,
          eventType: event.type,
        });
        return res.json({ received: true, ignored: true });
      }

      const normalizedPatch = Object.fromEntries(
        Object.entries(decision.patch).filter(([, value]) => value !== undefined),
      );
      const updatePayload = {
        ...normalizedPatch,
        updatedAt: new Date(),
      };

      if (decision.matchBy === "userId") {
        await db.update(users).set(updatePayload).where(eq(users.id, decision.matchValue));
      } else {
        await db.update(users).set(updatePayload).where(eq(users.stripeCustomerId, decision.matchValue));
      }

      await markStripeEventProcessed(event.id, event.type);
      logStripeWebhook("Event processed", {
        eventId: event.id,
        eventType: event.type,
        matchBy: decision.matchBy,
      });
      res.json({ received: true });
    } catch (error: any) {
      if (error.type === "StripeSignatureVerificationError") {
        console.error("[Stripe] Webhook signature verification failed:", error.message);
        return res.status(400).json({ message: "Webhook signature verification failed" });
      }
      console.error("[Stripe] Webhook processing error:", error.message);
      res.status(400).json({ message: `Webhook error: ${error.message}` });
    }
  });
}
