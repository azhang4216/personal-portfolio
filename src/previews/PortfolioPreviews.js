const LINKS = {
  linkedin: 'https://www.linkedin.com/in/angela-zl-zhang/',
  github: 'https://github.com/azhang4216/',
  email: 'mailto:angela@pier-finance.com',
  calendly: 'https://calendly.com/angela-pier-finance/30min',
};

const Arrow = ({ diagonal = false }) => (
  <svg className="arrow-icon" viewBox="0 0 20 20" aria-hidden="true">
    {diagonal ? <path d="M4 16 16 4M7 4h9v9" /> : <path d="M2 10h15M12 5l5 5-5 5" />}
  </svg>
);

const PinLogo = () => (
  <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 40V9M18 10h20l-8 8 8 8H18" />
    <text className="pin-logo-text" x="21" y="20">AZ</text>
    <ellipse cx="17" cy="40" rx="10" ry="3.5" />
    <circle className="logo-ball solid" cx="17" cy="40" r="2.5" />
  </svg>
);

const CourseDrawing = () => (
  <svg className="course-drawing" viewBox="0 0 620 450" aria-label="Illustrated golf hole">
    <path className="course-outline" d="M87 404C44 351 64 280 136 243c65-34 56-90 109-144C298 44 398 34 464 77c72 47 108 144 67 207-42 66-126 62-168 96-61 49-214 93-276 24Z" />
    <path className="course-fairway" d="M117 386c-22-46 2-94 55-124 73-42 56-91 111-139 47-42 125-48 172-16 45 31 65 92 37 134-28 43-94 42-137 70-62 41-189 112-238 75Z" />
    <path className="course-green" d="M361 106c18-34 78-43 117-14 32 24 29 72-10 93-43 23-105 6-116-28-5-16 1-36 9-51Z" />
    <path className="course-bunker" d="M378 190c24-12 55-5 62 10 8 18-14 38-44 40-28 2-47-11-39-27 4-8 11-17 21-23Z" />
    <path className="course-water" d="M150 286c27-19 70-12 78 11 8 22-24 42-60 40-31-2-52-20-40-35 6-8 13-12 22-16Z" />
    <path className="shot-line" d="M129 370C177 330 216 310 257 253s70-88 120-113" />
    <circle className="shot-start" cx="129" cy="370" r="7" />
    <circle className="shot-end" cx="378" cy="139" r="6" />
    <path className="course-pin" d="M379 141V87" />
    <path className="course-pin-flag" d="M381 88h36l-13 12 13 12h-36Z" />
    <text className="course-note water-note" x="208" y="350">water left, 50y carry</text>
    <ellipse className="miss-circle" cx="257" cy="170" rx="52" ry="25" />
    <text className="course-note miss-note" x="218" y="176">miss here</text>
  </svg>
);

const ContactIcon = ({ type }) => {
  if (type === 'linkedin') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 8.2H3.2V19h3.2V8.2ZM4.8 3a1.9 1.9 0 1 0 0 3.8A1.9 1.9 0 0 0 4.8 3ZM20.8 12.8c0-3.2-1.7-4.8-4-4.8-1.8 0-2.7 1-3.1 1.8V8.2h-3.2V19h3.2v-5.3c0-1.4.3-2.8 2-2.8 1.8 0 1.8 1.6 1.8 2.9V19h3.3v-6.2Z" /></svg>;
  }
  if (type === 'github') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.7 0-1 .4-1.9 1-2.5-.1-.3-.4-1.3.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.2 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.5.7.6 1.1 1.5 1.1 2.5 0 3.6-2.4 4.4-4.6 4.7.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.7Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3v-13Zm1.5 1.4 7.5 5.5 7.5-5.5M4.5 17l5.3-5M19.5 17l-5.3-5" /></svg>;
};

const ClubhouseSocials = () => (
  <div className="club-socials" aria-label="Contact links">
    <a href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><ContactIcon type="linkedin" /><span>LinkedIn</span></a>
    <a href={LINKS.github} target="_blank" rel="noreferrer" aria-label="GitHub"><ContactIcon type="github" /><span>GitHub</span></a>
    <a href={LINKS.email} aria-label="Email Angela"><ContactIcon type="email" /><span>Email</span></a>
  </div>
);

function ClubhousePortfolio() {
  return (
    <main className="concept clubhouse-concept" id="top">
      <div className="clubhouse-topline">
        <div className="golf-container"><span>THE CLUBHOUSE JOURNAL</span><span>ISSUE NO. 01, ANGELA ZHANG</span></div>
      </div>

      <header className="clubhouse-nav golf-container">
        <a className="clubhouse-logo" href="#top" aria-label="Back to top"><PinLogo /></a>
        <nav aria-label="Clubhouse navigation">
          <a href="#club-scorecard">Career scorecard</a>
          <a href="#club-contact">The nineteenth hole</a>
        </nav>
      </header>

      <section className="clubhouse-hero golf-container">
        <div className="clubhouse-title">
          <p>CTO | Engineer | D1 golfer</p>
          <h1>Angela <em>Zhang</em></h1>
        </div>
        <div className="clubhouse-hero-grid">
          <aside><blockquote>I love building cool things and driving solutions—on the screen and off the tee.</blockquote></aside>
          <div className="clubhouse-course"><CourseDrawing /></div>
        </div>
      </section>

      <section className="clubhouse-scorecard" id="club-scorecard">
        <div className="golf-container">
          <div className="scorecard-title-row"><h2>Career scorecard</h2></div>
          <div className="club-score-table">
            <div className="club-score-row club-score-head"><span>COURSE</span><span>ROLE</span><span>ROUND NOTES</span><span>YR</span></div>
            <article className="featured"><a className="score-company-link" href="https://www.pier-finance.com/" target="_blank" rel="noreferrer">PIER <Arrow diagonal /></a><span>Chief Technology Officer</span><p>Multiagent AI architecture + data intel for credit &amp; compliance fintech.</p><time>NOW</time></article>
            <article><strong>COHERE</strong><span>Technical Staff</span><p>Data infra. Checkpoints. k8s.</p><time>2025</time></article>
            <article><strong>PALANTIR</strong><span>Forward Deployed Engineer</span><p>Supply chain mitigation. Business ↔ tech translator.</p><time>2024</time></article>
            <article><strong>AWS</strong><span>Software Engineer</span><p>Lambda (serverless API).</p><time>2023</time></article>
            <article className="education-row"><strong>COLUMBIA UNIVERSITY</strong><span>CS Major</span><p>D1 Student Athlete</p><time aria-label="No date" /></article>
          </div>
        </div>
      </section>

      <footer className="clubhouse-footer" id="club-contact">
        <div className="golf-container clubhouse-footer-main">
          <p>THE NINETEENTH HOLE</p>
          <h2>Let’s talk.</h2>
          <div className="clubhouse-contact-actions">
            <a href={LINKS.email}><ContactIcon type="email" /><span><small>EMAIL</small>angela@pier-finance.com</span><Arrow /></a>
            <a href={LINKS.calendly} target="_blank" rel="noreferrer"><span className="calendar-icon">30</span><span><small>CALENDLY</small>Book 30 minutes</span><Arrow diagonal /></a>
          </div>
        </div>
        <div className="clubhouse-footer-bottom"><div className="golf-container"><span>ANGELA ZHANG</span><ClubhouseSocials /><span>© 2026</span></div></div>
      </footer>
    </main>
  );
}

export function PortfolioPreviews() {
  return <div className="portfolio-previews golf-theme-clubhouse"><ClubhousePortfolio /></div>;
}
