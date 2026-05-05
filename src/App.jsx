import CalendarBookingCard from "./components/CalendarBookingCard";

const exampleEvent = {
  title: "Performance Coaching Session",
  description: "1:1 elite coaching session with The Performance Club",
  start: "2026-05-06T10:00:00",
  end: "2026-05-06T11:00:00",
  timezone: "America/New_York",
  location: "Private Training Facility",
};

export default function App() {
  return <CalendarBookingCard event={exampleEvent} />;
}
