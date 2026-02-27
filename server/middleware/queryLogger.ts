import type { Request, Response, NextFunction } from "express";
import { log } from "../index";

const SLOW_QUERY_THRESHOLD_MS = 500;

interface RequestQueryStats {
  count: number;
  totalMs: number;
}

const requestStats = new WeakMap<Request, RequestQueryStats>();

export function queryLoggerMiddleware(req: Request, _res: Response, next: NextFunction) {
  requestStats.set(req, { count: 0, totalMs: 0 });

  _res.on("finish", () => {
    const stats = requestStats.get(req);
    if (stats && stats.count > 0 && req.path.startsWith("/api")) {
      log(
        `${req.method} ${req.path} — ${stats.count} queries, avg ${(stats.totalMs / stats.count).toFixed(1)}ms`,
        "query-logger",
      );
    }
  });

  next();
}

export function trackQueryTime(label: string, durationMs: number, req?: Request) {
  if (req) {
    const stats = requestStats.get(req);
    if (stats) {
      stats.count++;
      stats.totalMs += durationMs;
    }
  }

  if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
    log(`SLOW QUERY (${durationMs.toFixed(0)}ms): ${label}`, "query-logger");
  }
}
