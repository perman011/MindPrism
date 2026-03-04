import type { Metric } from "web-vitals";

const isProd = import.meta.env.PROD;

function handleMetric(metric: Metric) {
  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  if (!isProd) {
    const color =
      metric.rating === "good"
        ? "green"
        : metric.rating === "needs-improvement"
          ? "orange"
          : "red";
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(1)} (${metric.rating})`,
      `color: ${color}; font-weight: bold`,
    );
    return;
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/metrics", JSON.stringify(payload));
  } else {
    fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

export async function initPerformanceMonitoring() {
  const { onLCP, onINP, onCLS, onTTFB } = await import("web-vitals");
  onLCP(handleMetric);
  onINP(handleMetric);
  onCLS(handleMetric);
  onTTFB(handleMetric);
}
