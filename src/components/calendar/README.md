# Add to Calendar (The Performance Club)

Production-ready React module for premium "Add to Calendar" actions:

- **Google Calendar button** (opens prefilled event in new tab)
- **Apple / Default Calendar button** (downloads standards-compliant `.ics`)

## Suggested File Structure

```txt
src/
  components/
    calendar/
      AddToCalendarButtons.jsx
      AddToCalendarButtons.css
      index.js
  utils/
    calendar/
      dateTime.js
      normalizeEvent.js
      generateGoogleCalendarLink.js
      generateICS.js
      index.js
```

## Event Shape

```js
const event = {
  title: "Performance Coaching Session",
  description: "1:1 elite coaching session with The Performance Club",
  start: "2026-05-06T10:00:00",
  end: "2026-05-06T11:00:00",
  timezone: "America/New_York",
  location: "Private Training Facility", // optional
};
```

## Usage

```jsx
import { AddToCalendarButtons } from "@/components/calendar";

function SessionActions({ event }) {
  return <AddToCalendarButtons event={event} />;
}
```

## Utility API

```js
import { generateICS, downloadICSFile, generateGoogleCalendarLink } from "@/utils/calendar";

const icsText = generateICS(event);
const googleLink = generateGoogleCalendarLink(event);
downloadICSFile(event, "coaching-session.ics");
```

## Notes

- Timezone is validated as an IANA identifier (e.g. `America/New_York`).
- Input local date-times are converted to UTC for interchange safety.
- ICS output uses RFC-compatible line endings (`\r\n`) and escaping.
