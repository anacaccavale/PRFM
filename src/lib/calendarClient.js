import { generateGoogleCalendarLink as buildGoogleCalendarLink } from "../../utils/calendar.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  `${window.location.protocol}//${window.location.hostname}:8787`;

function ensureEvent(event) {
  if (!event || typeof event !== "object") {
    throw new Error("A valid event object is required");
  }
  return event;
}

export async function downloadICSFile(event, fileName = "performance-club-session.ics") {
  const safeEvent = ensureEvent(event);
  const response = await fetch(`${API_BASE}/api/calendar/ics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event: safeEvent }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Unable to generate ICS file");
  }

  const fileBlob = await response.blob();
  const objectUrl = window.URL.createObjectURL(fileBlob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = objectUrl;
  downloadAnchor.download = fileName;
  downloadAnchor.rel = "noopener";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function generateGoogleCalendarLink(event) {
  const safeEvent = ensureEvent(event);
  const response = await fetch(`${API_BASE}/api/calendar/google-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event: safeEvent }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    // Fallback: keep UX resilient if API is unavailable.
    return buildGoogleCalendarLink(safeEvent);
  }

  const payload = await response.json();
  if (!payload.googleCalendarUrl) {
    throw new Error("Google Calendar link was not returned");
  }

  return payload.googleCalendarUrl;
}

export function generateGoogleCalendarLinkFallback(event) {
  const safeEvent = ensureEvent(event);
  return buildGoogleCalendarLink(safeEvent);
}
