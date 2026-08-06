import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, CalendarIcon, CheckIcon, ClockIcon, GitHubIcon, GlobeIcon, LinkedInIcon } from "./PortfolioIcons";
import { LINKS } from "../data/portfolio";

const API_URL = (process.env.REACT_APP_SCHEDULING_API_URL || "").replace(/\/$/, "");
const DEFAULT_TIME_ZONE = "America/Vancouver";
const COMMON_TIME_ZONES = [
  "America/Vancouver",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function detectedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function dateKey(value, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function formatDate(value, timeZone) {
  return new Intl.DateTimeFormat(undefined, { timeZone, weekday: "short", month: "short", day: "numeric" }).format(new Date(value));
}

function formatTime(value, timeZone) {
  return new Intl.DateTimeFormat(undefined, { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function friendlyTimeZone(timeZone) {
  return timeZone.replaceAll("_", " ").replace("America/", "").replace("Europe/", "").replace("Asia/", "").replace("Australia/", "");
}

export function Scheduler() {
  const [duration, setDuration] = useState(30);
  const [timeZone, setTimeZone] = useState(detectedTimeZone);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availabilityState, setAvailabilityState] = useState(API_URL ? "loading" : "unconfigured");
  const [form, setForm] = useState({ name: "", email: "", website: "" });
  const [formState, setFormState] = useState("idle");
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(null);

  const timeZones = useMemo(() => {
    const supported = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : COMMON_TIME_ZONES;
    return Array.from(new Set([timeZone, ...COMMON_TIME_ZONES, ...supported]));
  }, [timeZone]);

  useEffect(() => {
    if (!API_URL) return undefined;
    const controller = new AbortController();
    setAvailabilityState("loading");
    setSelectedSlot(null);

    fetch(`${API_URL}/v1/availability?duration=${duration}&timeZone=${encodeURIComponent(timeZone)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    }).then(async (response) => {
      if (!response.ok) throw new Error("availability");
      const data = await response.json();
      const nextSlots = Array.isArray(data.slots) ? data.slots : [];
      setSlots(nextSlots);
      setSelectedDate(nextSlots[0] ? dateKey(nextSlots[0].start, timeZone) : "");
      setAvailabilityState(nextSlots.length ? "ready" : "empty");
    }).catch((error) => {
      if (error.name !== "AbortError") setAvailabilityState("error");
    });

    return () => controller.abort();
  }, [duration, timeZone]);

  const groupedSlots = useMemo(() => slots.reduce((groups, slot) => {
    const key = dateKey(slot.start, timeZone);
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
    return groups;
  }, {}), [slots, timeZone]);

  const dates = Object.keys(groupedSlots).slice(0, 10);
  const visibleSlots = groupedSlots[selectedDate] || [];

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!selectedSlot || formState === "submitting") return;

    setFormState("submitting");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/v1/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          start: selectedSlot.start,
          duration,
          timeZone,
          name: form.name.trim(),
          email: form.email.trim(),
          website: form.website,
          idempotencyKey: window.crypto?.randomUUID?.() || `${Date.now()}-${form.email.trim()}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "That time is no longer available.");
      setBooking(data.booking);
      setFormState("success");
    } catch (error) {
      setFormState("error");
      setMessage(error.message || "Something went wrong. Please try another time.");
    }
  };

  return (
    <section className="connect-section" id="connect">
      <div className="site-container">
        <div className="section-heading connect-heading">
          <div><h2>Let’s connect</h2></div>
          <div className="connect-intro">
            <p>Pick a time. Let’s chat.</p>
            <div className="connect-socials">
              <a href={LINKS.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon /> LinkedIn <ArrowIcon diagonal /></a>
              <a href={LINKS.github} target="_blank" rel="noreferrer"><GitHubIcon /> GitHub <ArrowIcon diagonal /></a>
            </div>
          </div>
        </div>

        <div className="scheduler-shell">
          <aside className="scheduler-context">
            <div><span className="scheduler-step">01</span><h3>Choose a conversation</h3></div>
            <div className="duration-options" role="group" aria-label="Meeting duration">
              {[15, 30].map((minutes) => (
                <button key={minutes} className={duration === minutes ? "active" : ""} type="button" onClick={() => setDuration(minutes)}>
                  <ClockIcon /><span><strong>{minutes} minutes</strong>{minutes === 15 ? "Quick hello" : "Room to go deeper"}</span><i />
                </button>
              ))}
            </div>
            <div className="calendar-privacy">
              <p><CalendarIcon /> Powered by Google Calendar</p>
              <ul>
                <li><CheckIcon />Checks all three calendars</li>
                <li><CheckIcon />Shows availability, never event details</li>
                <li><CheckIcon />Creates a private Google Meet request</li>
              </ul>
            </div>
          </aside>

          <div className="scheduler-booking">
            {formState === "success" && booking ? (
              <div className="booking-success" role="status">
                <span className="success-mark"><CheckIcon /></span>
                <p className="section-kicker">Request sent</p>
                <h3>You’re on the calendar.</h3>
                <p>{formatDate(booking.start, timeZone)} at {formatTime(booking.start, timeZone)} · {duration} minutes</p>
                <div><CalendarIcon /><span>Angela will accept or decline the invitation from Google Calendar. Your Meet link will arrive with the event.</span></div>
                <button type="button" onClick={() => { setFormState("idle"); setBooking(null); setSelectedSlot(null); }}>Choose another time</button>
              </div>
            ) : (
              <>
                <div className="scheduler-toolbar">
                  <div><span className="scheduler-step">02</span><h3>Pick a time</h3></div>
                  <label className="timezone-select"><GlobeIcon /><span className="sr-only">Time zone</span><select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>{timeZones.map((zone) => <option key={zone} value={zone}>{friendlyTimeZone(zone)}</option>)}</select></label>
                </div>

                {availabilityState === "ready" && <>
                  <div className="date-strip" role="tablist" aria-label="Available dates">
                    {dates.map((date) => (
                      <button key={date} type="button" role="tab" aria-selected={selectedDate === date} className={selectedDate === date ? "active" : ""} onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}>
                        <span>{formatDate(groupedSlots[date][0].start, timeZone).split(",")[0]}</span>
                        <strong>{new Intl.DateTimeFormat(undefined, { timeZone, day: "2-digit" }).format(new Date(groupedSlots[date][0].start))}</strong>
                        <small>{new Intl.DateTimeFormat(undefined, { timeZone, month: "short" }).format(new Date(groupedSlots[date][0].start))}</small>
                      </button>
                    ))}
                  </div>
                  <div className="time-grid" aria-label={`Available times for ${selectedDate}`}>
                    {visibleSlots.map((slot) => (
                      <button key={slot.start} type="button" className={selectedSlot?.start === slot.start ? "active" : ""} onClick={() => { setSelectedSlot(slot); setFormState("idle"); setMessage(""); }}>
                        {formatTime(slot.start, timeZone)}
                      </button>
                    ))}
                  </div>
                </>}

                {availabilityState === "loading" && <div className="scheduler-loading" aria-live="polite"><i /><i /><i /><p>Checking Angela’s calendars…</p></div>}
                {availabilityState === "empty" && <div className="scheduler-notice"><CalendarIcon /><h4>No open times in the next few weeks.</h4><p>Check back soon—availability updates automatically.</p></div>}
                {availabilityState === "error" && <div className="scheduler-notice"><CalendarIcon /><h4>Availability is taking a breather.</h4><p>Please refresh in a moment or reach out through LinkedIn.</p></div>}
                {availabilityState === "unconfigured" && <div className="scheduler-notice scheduler-setup"><CalendarIcon /><h4>Live availability is coming online.</h4><p>Until then, the best way to start a conversation is through LinkedIn.</p></div>}

                {selectedSlot && availabilityState === "ready" && <form className="booking-form" onSubmit={submitBooking}>
                  <div className="selected-time"><span>{formatDate(selectedSlot.start, timeZone)}</span><strong>{formatTime(selectedSlot.start, timeZone)} · {duration} min</strong><button type="button" onClick={() => setSelectedSlot(null)}>Change</button></div>
                  <div className="booking-fields">
                    <label><span>Name</span><input name="name" value={form.name} onChange={updateForm} autoComplete="name" maxLength="80" required placeholder="Your name" /></label>
                    <label><span>Email</span><input name="email" type="email" value={form.email} onChange={updateForm} autoComplete="email" maxLength="160" required placeholder="you@company.com" /></label>
                    <label className="website-field" aria-hidden="true"><span>Website</span><input name="website" value={form.website} onChange={updateForm} tabIndex="-1" autoComplete="off" /></label>
                  </div>
                  {message && <p className="booking-error" role="alert">{message}</p>}
                  <button className="request-button" type="submit" disabled={formState === "submitting"}>{formState === "submitting" ? "Requesting…" : "Request this time"}<ArrowIcon /></button>
                  <p className="booking-fineprint">A calendar invitation is sent only after one final availability check.</p>
                </form>}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
