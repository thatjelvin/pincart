/**
 * PinCart AI — Sentry frontend error tracking setup.
 *
 * Initialises Sentry in the browser only when NEXT_PUBLIC_SENTRY_DSN is set.
 */

let sentryInitialised = false;

export async function initSentry(): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || sentryInitialised) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.2,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    sentryInitialised = true;
  } catch {
    // Sentry SDK not installed — silently skip
  }
}

export function captureException(error: unknown): void {
  try {
    // Dynamic import so the bundle isn't affected when Sentry is absent
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
  } catch {
    // noop
  }
}
