import { DateTime } from "luxon";
import { z } from "zod";

const eventSchema = z
  .object({
    title: z.string().trim().min(1, "title is required"),
    description: z.string().trim().min(1, "description is required"),
    start: z.string().trim().min(1, "start is required"),
    end: z.string().trim().min(1, "end is required"),
    timezone: z.string().trim().min(1, "timezone is required"),
    location: z.string().trim().optional(),
  })
  .strict();

function parseEventDate(isoDateTime, timezone, fieldName) {
  const parsed = DateTime.fromISO(isoDateTime, { zone: timezone });
  if (!parsed.isValid) {
    throw new Error(`Invalid ${fieldName}: ${parsed.invalidExplanation ?? "Unknown error"}`);
  }
  return parsed;
}

function escapeICSValue(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldICSLine(line) {
  const chunkSize = 73;
  if (line.length <= chunkSize) return line;

  const segments = [];
  for (let i = 0; i < line.length; i += chunkSize) {
    const segment = line.slice(i, i + chunkSize);
    segments.push(i === 0 ? segment : ` ${segment}`);
  }
  return segments.join("\r\n");
}

function formatICSDateUTC(dateTime) {
  return dateTime.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
}

function formatGoogleDateUTC(dateTime) {
  return dateTime.toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'");
}

function createUid(title, startUtc) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const randomPart =
    globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Math.floor(Math.random() * 1e9)}-${Date.now()}`;

  return `${slug || "event"}-${startUtc.toMillis()}-${randomPart}@theperformanceclub.com`;
}

export function normalizeEvent(inputEvent) {
  const event = eventSchema.parse(inputEvent);
  const start = parseEventDate(event.start, event.timezone, "start");
  const end = parseEventDate(event.end, event.timezone, "end");

  if (end <= start) {
    throw new Error("Event end must be after event start");
  }

  return {
    ...event,
    startDateTime: start,
    endDateTime: end,
    startUtc: start.toUTC(),
    endUtc: end.toUTC(),
  };
}

export function generateICS(eventInput) {
  const event = normalizeEvent(eventInput);
  const dtStamp = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'");

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//The Performance Club//Booking Calendar//EN",
    `X-WR-CALNAME:${escapeICSValue("The Performance Club Sessions")}`,
    `X-WR-TIMEZONE:${escapeICSValue(event.timezone)}`,
    "BEGIN:VEVENT",
    `UID:${escapeICSValue(createUid(event.title, event.startUtc))}`,
    `DTSTAMP:${dtStamp}`,
    `SUMMARY:${escapeICSValue(event.title)}`,
    `DESCRIPTION:${escapeICSValue(event.description)}`,
    `DTSTART:${formatICSDateUTC(event.startDateTime)}`,
    `DTEND:${formatICSDateUTC(event.endDateTime)}`,
  ];

  if (event.location) {
    icsLines.push(`LOCATION:${escapeICSValue(event.location)}`);
  }

  icsLines.push("END:VEVENT", "END:VCALENDAR");

  return `${icsLines.map(foldICSLine).join("\r\n")}\r\n`;
}

export function generateGoogleCalendarLink(eventInput) {
  const event = normalizeEvent(eventInput);
  const url = new URL("https://calendar.google.com/calendar/render");

  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("details", event.description);
  url.searchParams.set(
    "dates",
    `${formatGoogleDateUTC(event.startDateTime)}/${formatGoogleDateUTC(event.endDateTime)}`
  );
  url.searchParams.set("ctz", event.timezone);

  if (event.location) {
    url.searchParams.set("location", event.location);
  }

  return url.toString();
}
