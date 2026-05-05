const DATE_TIME_INPUT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

const pad = (value) => String(value).padStart(2, "0");

export const parseLocalDateTime = (dateTimeString, fieldName) => {
  if (typeof dateTimeString !== "string") {
    throw new TypeError(`${fieldName} must be a string in YYYY-MM-DDTHH:mm format.`);
  }

  const match = dateTimeString.match(DATE_TIME_INPUT_PATTERN);
  if (!match) {
    throw new Error(`${fieldName} must be in YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.`);
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const date = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };

  const utcProbe = new Date(
    Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute, date.second),
  );

  if (
    utcProbe.getUTCFullYear() !== date.year ||
    utcProbe.getUTCMonth() !== date.month - 1 ||
    utcProbe.getUTCDate() !== date.day ||
    utcProbe.getUTCHours() !== date.hour ||
    utcProbe.getUTCMinutes() !== date.minute ||
    utcProbe.getUTCSeconds() !== date.second
  ) {
    throw new Error(`${fieldName} contains an invalid calendar date/time.`);
  }

  return date;
};

export const assertValidTimeZone = (timeZone) => {
  if (typeof timeZone !== "string" || timeZone.trim().length === 0) {
    throw new TypeError("timezone must be a non-empty IANA timezone string.");
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
  } catch {
    throw new Error(`Invalid timezone: "${timeZone}". Use an IANA value like "America/New_York".`);
  }
};

const getTimeZoneOffsetMs = (utcTimestampMs, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcTimestampMs));

  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUtc - utcTimestampMs;
};

export const zonedDateTimeToUtc = (dateTimeString, timeZone, fieldName) => {
  const local = parseLocalDateTime(dateTimeString, fieldName);
  assertValidTimeZone(timeZone);

  const localAsUtcMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );

  let guessMs = localAsUtcMs;
  for (let index = 0; index < 6; index += 1) {
    const offsetMs = getTimeZoneOffsetMs(guessMs, timeZone);
    const nextGuessMs = localAsUtcMs - offsetMs;

    if (nextGuessMs === guessMs) {
      break;
    }

    guessMs = nextGuessMs;
  }

  return new Date(guessMs);
};

export const formatUtcDateTime = (date) => {
  const utcDate = date instanceof Date ? date : new Date(date);

  return [
    utcDate.getUTCFullYear(),
    pad(utcDate.getUTCMonth() + 1),
    pad(utcDate.getUTCDate()),
    "T",
    pad(utcDate.getUTCHours()),
    pad(utcDate.getUTCMinutes()),
    pad(utcDate.getUTCSeconds()),
    "Z",
  ].join("");
};

export const formatLocalDateTimeForICS = (dateTimeString, fieldName) => {
  const parsed = parseLocalDateTime(dateTimeString, fieldName);

  return [
    parsed.year,
    pad(parsed.month),
    pad(parsed.day),
    "T",
    pad(parsed.hour),
    pad(parsed.minute),
    pad(parsed.second),
  ].join("");
};
