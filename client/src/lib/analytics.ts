const SESSION_KEY = "mindprism_session_id";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

const recentEvents = new Map<string, number>();
const DEBOUNCE_MS = 2000;

function isDuplicate(eventType: string, eventData?: Record<string, unknown>): boolean {
  const key = `${eventType}:${JSON.stringify(eventData || {})}`;
  const lastSent = recentEvents.get(key);
  const now = Date.now();

  if (lastSent && now - lastSent < DEBOUNCE_MS) {
    return true;
  }

  recentEvents.set(key, now);

  if (recentEvents.size > 100) {
    recentEvents.forEach((value, mapKey) => {
      if (now - value > DEBOUNCE_MS * 5) {
        recentEvents.delete(mapKey);
      }
    });
  }

  return false;
}

export function trackEvent(eventType: string, eventData?: Record<string, unknown>): void {
  if (isDuplicate(eventType, eventData)) return;

  const payload = JSON.stringify({
    eventType,
    eventData: eventData || {},
    pageUrl: window.location.pathname,
    sessionId: getSessionId(),
  });

  if (import.meta.env.PROD && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/events", blob);
  } else {
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      credentials: "include",
    }).catch(() => {});
  }
}

export function trackPageView(pageName: string): void {
  trackEvent("page_view", { page: pageName });
}

export function trackBookOpen(bookId: string, bookTitle: string): void {
  trackEvent("book_open", { bookId, bookTitle });
}

export function trackAudioPlay(bookId: string, bookTitle: string): void {
  trackEvent("audio_play", { bookId, bookTitle });
}

export function trackExerciseComplete(exerciseId: string, bookId: string): void {
  trackEvent("exercise_complete", { exerciseId, bookId });
}

export function trackJournalWrite(): void {
  trackEvent("journal_write");
}

export function trackHighlightSave(bookId: string): void {
  trackEvent("highlight_save", { bookId });
}
