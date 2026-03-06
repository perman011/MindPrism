import * as Sentry from "@sentry/node";
import type { Express, Request, Response, NextFunction } from "express";

const dsn = process.env.SENTRY_DSN;
const isProd = process.env.NODE_ENV === "production";

export function initErrorTracking() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: isProd ? "production" : "development",
    tracesSampleRate: isProd ? 0.1 : 1.0,
  });
}

export function applySentryRequestHandler(app: Express) {
  if (!dsn) return;
  Sentry.setupExpressErrorHandler(app);
}

export function sentryErrorMiddleware(
  err: any,
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!dsn) return next(err);

  const user = (req as any).user;
  if (user) {
    // S10 fix: Replit Auth uses claims.sub, not user.id
    Sentry.setUser({
      id: user.claims?.sub || user.id,
      username: user.claims?.name || user.username,
    });
  }

  Sentry.setContext("request", {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
  });

  Sentry.captureException(err);
  next(err);
}
