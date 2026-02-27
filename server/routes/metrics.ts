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
  const { name, value, rating, delta, url, timestamp } = req.body;

  if (!name || typeof value !== "number") {
    return res.status(400).json({ error: "Invalid metric data" });
  }

  log(
    `[Web Vital] ${name}=${value.toFixed(1)} rating=${rating || "unknown"} delta=${delta?.toFixed(1) || "?"} url=${url || "?"}`,
    "metrics",
  );

  return res.status(204).end();
});

export default router;
