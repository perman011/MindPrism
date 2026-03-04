import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const isProd = import.meta.env.PROD;

let sentryInitialized = false;

export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: isProd ? "production" : "development",
    tracesSampleRate: isProd ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserTracingIntegration(),
    ],
  });
  sentryInitialized = true;
}

export function isSentryEnabled() {
  return sentryInitialized;
}

export { Sentry };
