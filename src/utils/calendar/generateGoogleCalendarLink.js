import { normalizeCalendarEvent } from "./normalizeEvent.js";

const GOOGLE_CALENDAR_BASE_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE";

export const generateGoogleCalendarLink = (event) => {
  const normalized = normalizeCalendarEvent(event);
  const url = new URL(GOOGLE_CALENDAR_BASE_URL);

  url.searchParams.set("text", normalized.title);
  url.searchParams.set("details", normalized.description);
  url.searchParams.set("dates", `${normalized.startUtc}/${normalized.endUtc}`);
  url.searchParams.set("ctz", normalized.timezone);

  if (normalized.location) {
    url.searchParams.set("location", normalized.location);
  }

  return url.toString();
};
