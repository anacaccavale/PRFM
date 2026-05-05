import {
  assertValidTimeZone,
  formatUtcDateTime,
  zonedDateTimeToUtc,
} from "./dateTime.js";

const assertNonEmptyString = (value, fieldName, { required = true } = {}) => {
  if (value == null && !required) {
    return "";
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
};

export const normalizeCalendarEvent = (event) => {
  if (!event || typeof event !== "object") {
    throw new TypeError("event must be an object.");
  }

  const title = assertNonEmptyString(event.title, "title");
  const description = assertNonEmptyString(event.description, "description");
  const timezone = assertNonEmptyString(event.timezone, "timezone");
  const location = assertNonEmptyString(event.location, "location", { required: false });
  const startInput = assertNonEmptyString(event.start, "start");
  const endInput = assertNonEmptyString(event.end, "end");

  assertValidTimeZone(timezone);

  const startUtc = zonedDateTimeToUtc(startInput, timezone, "start");
  const endUtc = zonedDateTimeToUtc(endInput, timezone, "end");

  if (Number.isNaN(startUtc.valueOf()) || Number.isNaN(endUtc.valueOf())) {
    throw new Error("Unable to parse start/end dates.");
  }

  if (endUtc <= startUtc) {
    throw new Error("end time must be after start time.");
  }

  return {
    title,
    description,
    start: startInput,
    end: endInput,
    timezone,
    location,
    startUtcDate: startUtc,
    endUtcDate: endUtc,
    startUtc: formatUtcDateTime(startUtc),
    endUtc: formatUtcDateTime(endUtc),
  };
};
