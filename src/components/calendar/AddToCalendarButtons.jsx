import { useMemo, useState } from "react";
import { downloadICSFile } from "../../utils/calendar/generateICS.js";
import { generateGoogleCalendarLink } from "../../utils/calendar/generateGoogleCalendarLink.js";
import { normalizeCalendarEvent } from "../../utils/calendar/normalizeEvent.js";
import "./AddToCalendarButtons.css";

const sanitizeFileSegment = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const defaultFilename = (event) => {
  const normalized = normalizeCalendarEvent(event);
  const dateSegment = normalized.start.slice(0, 10);
  const titleSegment = sanitizeFileSegment(normalized.title) || "session";
  return `${titleSegment}-${dateSegment}.ics`;
};

const openUrlInNewTab = (url) => {
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (popup) {
    popup.opener = null;
    return true;
  }

  return false;
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 11.8v4.6h6.4c-.3 1.5-1.8 4.4-6.4 4.4-3.9 0-7-3.2-7-7.1s3.1-7.1 7-7.1c2.2 0 3.7.9 4.5 1.7l3-2.9C17.6 3.5 15 2.4 12 2.4A9.6 9.6 0 0 0 2.4 12 9.6 9.6 0 0 0 12 21.6c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12Z"
      fill="currentColor"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M7 2.8a1 1 0 0 1 1 1v1.4h8V3.8a1 1 0 1 1 2 0v1.4h.8A2.2 2.2 0 0 1 21 7.4v12.4a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 19.8V7.4a2.2 2.2 0 0 1 2.2-2.2H6V3.8a1 1 0 0 1 1-1Zm12 8H5v9a.2.2 0 0 0 .2.2h13.6a.2.2 0 0 0 .2-.2v-9Zm-.2-3.6H5.2a.2.2 0 0 0-.2.2v1.4h14V7.4a.2.2 0 0 0-.2-.2Zm-9.3 4.9h1.8a1 1 0 0 1 0 2H9.5a1 1 0 1 1 0-2Zm0 3.8h5.1a1 1 0 0 1 0 2H9.5a1 1 0 1 1 0-2Z"
      fill="currentColor"
    />
  </svg>
);

export function AddToCalendarButtons({
  event,
  className = "",
  googleButtonLabel = "Add to Google Calendar",
  appleButtonLabel = "Add to Apple / Default Calendar",
  icsFilename,
  disabled = false,
  onActionError,
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const googleCalendarUrl = useMemo(() => generateGoogleCalendarLink(event), [event]);
  const downloadName = useMemo(() => icsFilename || defaultFilename(event), [event, icsFilename]);

  const handleGoogleClick = () => {
    if (disabled) {
      return;
    }

    try {
      if (!openUrlInNewTab(googleCalendarUrl)) {
        window.location.assign(googleCalendarUrl);
      }
    } catch (error) {
      if (onActionError) {
        onActionError(error, "google");
      } else {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  };

  const handleAppleClick = () => {
    if (disabled || isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      downloadICSFile(event, downloadName);
    } catch (error) {
      if (onActionError) {
        onActionError(error, "apple");
      } else {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    } finally {
      window.requestAnimationFrame(() => setIsDownloading(false));
    }
  };

  return (
    <section className={`tpc-calendar-actions ${className}`.trim()} aria-label="Add session to calendar">
      <button
        type="button"
        className="tpc-calendar-btn tpc-calendar-btn--google"
        onClick={handleGoogleClick}
        disabled={disabled}
      >
        <span className="tpc-calendar-btn__icon" aria-hidden="true">
          <GoogleIcon />
        </span>
        <span className="tpc-calendar-btn__label">{googleButtonLabel}</span>
      </button>

      <button
        type="button"
        className="tpc-calendar-btn tpc-calendar-btn--apple"
        onClick={handleAppleClick}
        disabled={disabled || isDownloading}
      >
        <span className="tpc-calendar-btn__icon" aria-hidden="true">
          <CalendarIcon />
        </span>
        <span className="tpc-calendar-btn__label">
          {isDownloading ? "Preparing Calendar File..." : appleButtonLabel}
        </span>
      </button>
    </section>
  );
}
