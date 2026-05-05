import express from "express";
import cors from "cors";
import { generateICS, generateGoogleCalendarLink } from "../utils/calendar.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "performance-club-calendar" });
});

app.post("/api/calendar/ics", (req, res) => {
  try {
    const event = req.body?.event;
    const icsContent = generateICS(event);

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="performance-club-session.ics"');
    res.status(200).send(icsContent);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to generate ICS file",
    });
  }
});

app.post("/api/calendar/google-link", (req, res) => {
  try {
    const event = req.body?.event;
    const googleCalendarUrl = generateGoogleCalendarLink(event);
    res.status(200).json({ googleCalendarUrl });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to generate Google Calendar link",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Calendar API listening at http://localhost:${PORT}`);
});
