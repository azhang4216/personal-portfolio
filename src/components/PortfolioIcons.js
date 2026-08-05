export const ArrowIcon = ({ diagonal = false }) => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    {diagonal ? <path d="M5 19 19 5M8 5h11v11" /> : <path d="M4 12h16M14 6l6 6-6 6" />}
  </svg>
);

export const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 8.4H3.3V19h3.2V8.4ZM4.9 3a1.9 1.9 0 1 0 0 3.8A1.9 1.9 0 0 0 4.9 3ZM20.7 12.9c0-3.2-1.7-4.8-4-4.8-1.9 0-2.7 1-3.2 1.8V8.4h-3.2V19h3.2v-5.2c0-1.4.3-2.8 2.1-2.8 1.7 0 1.8 1.6 1.8 2.9V19h3.3v-6.1Z" />
  </svg>
);

export const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.5a9.7 9.7 0 0 0-3.1 18.9c.5.1.7-.2.7-.5V19c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.6-1.3-2.3-.3-4.6-1.1-4.6-4.8 0-1 .4-1.9 1-2.6-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.7 1a9.2 9.2 0 0 1 4.9 0c1.8-1.3 2.6-1 2.6-1 .6 1.3.2 2.3.1 2.5.7.7 1.1 1.6 1.1 2.6 0 3.7-2.4 4.5-4.7 4.8.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A9.7 9.7 0 0 0 12 2.5Z" />
  </svg>
);

export const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
);

export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></svg>
);

export const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5S14.2 18.2 12 20.5C9.8 18.2 8.8 15.4 8.8 12S9.8 5.8 12 3.5Z" /></svg>
);

export const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3v5M16.5 3v5M3.5 10h17" /></svg>
);

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
);
