import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { downloadICSFile } from "../lib/calendarClient";
import { generateGoogleCalendarLink } from "../../utils/calendar.js";

const defaultEvent = {
  title: "Performance Coaching Session",
  description: "1:1 elite coaching session with The Performance Club",
  start: "2026-05-06T10:00:00",
  end: "2026-05-06T11:00:00",
  timezone: "America/New_York",
  location: "Private Training Facility",
};

function EventMeta({ label, value }) {
  return (
    <div className="event-meta-item">
      <span className="event-meta-label">{label}</span>
      <span className="event-meta-value">{value}</span>
    </div>
  );
}

export default function CalendarBookingCard({ event = defaultEvent }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const googleCalendarUrl = useMemo(() => generateGoogleCalendarLink(event), [event]);

  const localizedDate = useMemo(() => {
    const start = DateTime.fromISO(event.start, { zone: event.timezone });
    const end = DateTime.fromISO(event.end, { zone: event.timezone });
    return `${start.toFormat("ccc, LLL d · h:mm a")} - ${end.toFormat("h:mm a")} (${event.timezone})`;
  }, [event]);

  async function handleICSDownload() {
    try {
      setIsDownloading(true);
      await downloadICSFile(event);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="booking-shell" aria-labelledby="booking-card-title">
      <div className="booking-card">
        <p className="booking-kicker">Elite Session Confirmed</p>
        <h1 className="booking-title" id="booking-card-title">
          The Performance Club
        </h1>
        <p className="booking-subtitle">
          Lock your coaching slot into your calendar so your training cadence never breaks.
        </p>

        <div className="event-meta-grid">
          <EventMeta label="Session" value={event.title} />
          <EventMeta label="Time" value={localizedDate} />
          {event.location ? <EventMeta label="Location" value={event.location} /> : null}
        </div>

        <div className="booking-actions">
          <a
            className="button button-google"
            href={googleCalendarUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Add this booking to Google Calendar"
          >
            Add to Google Calendar
          </a>
          <button
            type="button"
            className="button button-apple"
            onClick={handleICSDownload}
            disabled={isDownloading}
            aria-label="Download ICS to add this booking to Apple or default calendar"
          >
            {isDownloading ? "Preparing Calendar File..." : "Add to Apple Calendar"}
          </button>
        </div>
      </div>
    </section>
  );
}
