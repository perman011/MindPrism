import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import { applySecurityMiddleware } from "./middleware/security";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";
import { initErrorTracking, sentryErrorMiddleware, applySentryRequestHandler } from "./middleware/errorTracking";
import { queryLoggerMiddleware } from "./middleware/queryLogger";
import metricsRouter from "./routes/metrics";
import sitemapRouter from "./routes/sitemap";
import backupRouter from "./routes/backup";
import { startBackupScheduler, stopBackupScheduler } from "./services/backupScheduler";

initErrorTracking();

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

applySecurityMiddleware(app);

app.use("/api/login", authLimiter);
app.use("/api/callback", authLimiter);
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(queryLoggerMiddleware);
app.use("/api/metrics", metricsRouter);
app.use("/sitemap.xml", sitemapRouter);

app.get("/robots.txt", (_req, res) => {
  const sitemapUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}/sitemap.xml`
    : "https://mindprism.io/sitemap.xml";
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /vault\nDisallow: /api/\n\nSitemap: ${sitemapUrl}\n`
  );
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use("/api/admin/backups", backupRouter);

  await seedDatabase().catch((err) => {
    console.error("Failed to seed database:", err);
  });

  applySentryRequestHandler(app);

  app.use(sentryErrorMiddleware);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  startBackupScheduler();

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  const shutdown = () => {
    stopBackupScheduler();
    httpServer.close();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
