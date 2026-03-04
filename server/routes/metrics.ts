import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { log } from "../index";

const metricsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many metrics requests" },
});

const router = Router();

router.post("/", metricsLimiter, (req: Request, res: Response) => {
  if (!req.body || !req.body.name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  const { name, value, rating, delta, url, timestamp } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "Missing required field: value" });
  }

  log(
    `[Web Vital] ${name}=${value.toFixed(1)} rating=${rating || "unknown"} delta=${delta?.toFixed(1) || "?"} url=${url || "?"}`,
    "metrics",
  );

  return res.status(204).end();
});

export default router;
