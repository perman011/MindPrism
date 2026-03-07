import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";

const ALLOWED_ORIGINS = [
  "https://mindprism.io",
  "https://www.mindprism.io",
];

function isAllowedOrigin(origin: string): boolean {
  const isDev = process.env.NODE_ENV !== "production";
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.replit\.app$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.repl\.co$/.test(origin)) return true;
  if (isDev && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

export function applySecurityMiddleware(app: Express) {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        hsts: false,
        frameguard: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        crossOriginEmbedderPolicy: false,
        originAgentCluster: false,
        noSniff: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      })
    );
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "cdnjs.cloudflare.com", "js.stripe.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com", "https://*.ingest.sentry.io"],
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
  }

  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      if (isAllowedOrigin(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, sentry-trace, baggage");
        res.setHeader("Vary", "Origin");
      } else {
        if (req.method === "OPTIONS") {
          return res.status(403).json({ error: "Origin not allowed" });
        }
      }
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}
