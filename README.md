# The Performance Club — Calendar Booking & Add to Calendar

Production-ready React + Node.js implementation for booking sessions and adding them to:

- Apple Calendar / Outlook / default calendar apps via dynamic `.ics` download
- Google Calendar via generated pre-filled event URL

## Folder structure

```text
.
├── index.html
├── package.json
├── server
│   └── index.js                  # Node API routes
├── src
│   ├── App.jsx
│   ├── main.jsx
│   ├── components
│   │   └── CalendarBookingCard.jsx
│   ├── lib
│   │   └── calendarClient.js     # Frontend API + download helpers
│   └── styles
│       ├── calendarBooking.css   # Premium dark UI styles
│       └── global.css
├── utils
│   └── calendar.js               # Shared reusable generators
└── vite.config.js
```

## Core reusable utilities

- `generateICS(event)` in `utils/calendar.js`
- `generateGoogleCalendarLink(event)` in `utils/calendar.js`

Both utilities validate event data and convert times to UTC for timezone-safe behavior.

### Supported event shape

```js
{
  title: "Performance Coaching Session",
  description: "1:1 elite coaching session with The Performance Club",
  start: "2026-05-06T10:00:00",
  end: "2026-05-06T11:00:00",
  timezone: "America/New_York",
  location: "Private Training Facility"
}
```

## API routes

- `POST /api/calendar/ics`
  - body: `{ event }`
  - returns RFC 5545 `text/calendar` file content
- `POST /api/calendar/google-link`
  - body: `{ event }`
  - returns `{ googleCalendarUrl }`

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start frontend + backend:

   ```bash
   npm run dev
   ```

   - Vite frontend runs at `http://localhost:5173`
   - Express API runs at `http://localhost:8787`

3. Build frontend:

   ```bash
   npm run build
   ```

## Production notes

- ICS output uses RFC 5545 line endings (`\r\n`) and line folding.
- All event timestamps are normalized to UTC with source timezone preserved in metadata.
- Utility functions are framework-agnostic and can be reused in any Node/Next API layer.
