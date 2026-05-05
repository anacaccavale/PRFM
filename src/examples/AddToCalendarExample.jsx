import { AddToCalendarButtons } from "../components/calendar/AddToCalendarButtons.jsx";

const performanceClubSession = {
  title: "Performance Coaching Session",
  description: "1:1 elite coaching session with The Performance Club",
  start: "2026-05-06T10:00:00",
  end: "2026-05-06T11:00:00",
  timezone: "America/New_York",
  location: "Private Training Facility",
};

export function AddToCalendarExample() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(255,122,25,0.12) 0%, rgba(8,10,14,1) 45%, rgba(5,7,11,1) 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", color: "#f6f8fb", fontFamily: '"DM Sans", sans-serif' }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.66rem",
            letterSpacing: "0.28em",
            color: "rgba(246,248,251,0.62)",
            textTransform: "uppercase",
          }}
        >
          The Performance Club
        </p>
        <h2 style={{ marginTop: 10, marginBottom: 22, fontSize: "1.65rem", lineHeight: 1.1 }}>Save Your Session</h2>

        <AddToCalendarButtons event={performanceClubSession} />
      </div>
    </div>
  );
}
