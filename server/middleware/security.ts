import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";

const ALLOWED_ORIGINS = [
  "https://mindprism.io",
  "https://www.mindprism.io",
];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.replit\.app$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.repl\.co$/.test(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

export function applySecurityMiddleware(app: Express) {
  const isDev = process.env.NODE_ENV !== "production";

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: isDev
            ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdnjs.cloudflare.com", "js.stripe.com"]
            : ["'self'", "cdnjs.cloudflare.com", "js.stripe.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: isDev
            ? ["'self'", "ws:", "wss:", "https://api.stripe.com", "https://*.ingest.sentry.io"]
            : ["'self'", "https://api.stripe.com", "https://*.ingest.sentry.io"],
          fontSrc: ["'self'", "data:", "fonts.gstatic.com"],
          frameSrc: ["'self'", "js.stripe.com"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
      frameguard: { action: "deny" },
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}
