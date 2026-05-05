import { formatUtcDateTime } from "./dateTime.js";
import { normalizeCalendarEvent } from "./normalizeEvent.js";

const ICS_LINE_BREAK = "\r\n";

const foldICalLine = (line) => {
  const maxLength = 74;
  if (line.length <= maxLength) {
    return line;
  }

  const chunks = [];
  for (let start = 0; start < line.length; start += maxLength) {
    const chunk = line.slice(start, start + maxLength);
    chunks.push(start === 0 ? chunk : ` ${chunk}`);
  }

  return chunks.join(ICS_LINE_BREAK);
};

const escapeICSText = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const createUid = (normalizedEvent) => {
  const seed = `${normalizedEvent.title}-${normalizedEvent.startUtc}-${normalizedEvent.endUtc}`;
  const normalizedSeed = seed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const entropy = Math.random().toString(36).slice(2, 10);
  return `${normalizedSeed}-${entropy}@theperformanceclub.app`;
};

const buildICSContent = (normalizedEvent) => {
  const nowUtc = formatUtcDateTime(new Date());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//The Performance Club//Fitness Coaching//EN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${normalizedEvent.timezone}`,
    "BEGIN:VEVENT",
    `UID:${createUid(normalizedEvent)}`,
    `DTSTAMP:${nowUtc}`,
    `SUMMARY:${escapeICSText(normalizedEvent.title)}`,
    `DESCRIPTION:${escapeICSText(normalizedEvent.description)}`,
    `DTSTART:${normalizedEvent.startUtc}`,
    `DTEND:${normalizedEvent.endUtc}`,
  ];

  if (normalizedEvent.location) {
    lines.push(`LOCATION:${escapeICSText(normalizedEvent.location)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return `${lines.map(foldICalLine).join(ICS_LINE_BREAK)}${ICS_LINE_BREAK}`;
};

export const generateICS = (event) => {
  const normalized = normalizeCalendarEvent(event);
  return buildICSContent(normalized);
};

export const downloadICSFile = (event, filename = "performance-club-session.ics") => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("ICS downloads are only available in the browser.");
  }

  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};
