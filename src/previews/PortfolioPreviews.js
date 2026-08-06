import { useEffect, useState } from "react";
import { AsciiHero } from "../components/AsciiHero";
import { ProjectShowcase } from "../components/ProjectShowcase";
import { Scheduler } from "../components/Scheduler";
import { SiteHeader } from "../components/SiteHeader";
import { ArrowIcon, GolfFlagMark } from "../components/PortfolioIcons";
import { EXPERIENCE, ROLES } from "../data/portfolio";

const HERO_ROLES = ROLES.map((label, index) => ({
  label,
  mode: ["architect", "customer", "builder", "leader"][index],
}));

function Hero() {
  const [autoIndex, setAutoIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const activeIndex = previewIndex ?? selectedIndex ?? autoIndex;
  const activeRole = HERO_ROLES[activeIndex];

  useEffect(() => {
    if (selectedIndex !== null || previewIndex !== null) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return undefined;
    const timer = window.setTimeout(() => setAutoIndex((index) => (index + 1) % HERO_ROLES.length), 4800);
    return () => window.clearTimeout(timer);
  }, [autoIndex, previewIndex, selectedIndex]);

  return (
    <section className={`hero-section hero-mode-${activeRole.mode}`}>
      <AsciiHero mode={activeRole.mode} />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-readout readout-left" aria-hidden="true"><span>AZ / PORTFOLIO</span><span>SF / NYC</span></div>
      <div className="hero-readout readout-right" aria-hidden="true"><span>SYSTEM ONLINE</span><span>2026 / 08</span></div>
      <div className="site-container hero-content">
        <p className="hero-kicker"><span /> CTO at Pier · Previously Cohere · Palantir · AWS · Columbia D1 golfer</p>
        <h1>Angela<br /><em>Zhang</em></h1>
        <div className="hero-positioning">
          <p>I build AI systems that turn complex data into decisions.</p>
          <div className="role-list" aria-label="Areas of expertise">
            {HERO_ROLES.map((role, index) => (
              <button
                key={role.label}
                type="button"
                className={activeIndex === index ? "active" : ""}
                aria-pressed={selectedIndex === index}
                onPointerEnter={() => setPreviewIndex(index)}
                onPointerLeave={() => setPreviewIndex(null)}
                onFocus={() => setPreviewIndex(index)}
                onBlur={() => setPreviewIndex(null)}
                onClick={() => { setSelectedIndex(index); setAutoIndex(index); }}
              >
                <i>0{index + 1}</i><span>{role.label}</span><b aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        <div className="hero-actions">
          <a className="primary-action" href="#projects">Explore my work <ArrowIcon /></a>
          <a className="text-action" href="#connect">Book a conversation <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div className="hero-proof"><span>Based between</span><strong>San Francisco · New York</strong></div>
      <a className="scroll-cue" href="#career" aria-label="Scroll to career scorecard"><span>Scroll</span><i /></a>
    </section>
  );
}

function Career() {
  return (
    <section className="career-section" id="career">
      <div className="site-container">
        <div className="section-heading career-heading">
          <div><span className="section-kicker">Career scorecard</span><h2>Deeply technical.<br />Entrepreneurial.<br />Customer-obsessed.</h2></div>
          <div className="career-intro">
            <p className="career-tagline">I ship complex technology, lead technical teams, and turn ambitious ideas into meaningful enterprise outcomes.</p>
            <p className="career-context">I thrive where the problem is ambiguous, the technical stakes are real, and the distance between a decision and shipped software needs to be short.</p>
          </div>
        </div>

        <div className="career-table">
          <div className="career-table-head"><span>Company</span><span>Role</span><span>What moved</span><span>Year</span></div>
          {EXPERIENCE.map((item, index) => (
            <article key={item.company} className={item.current ? "current" : ""}>
              <span className="career-index">0{index + 1}</span>
              <h3><a href={item.href} target="_blank" rel="noreferrer">{item.company}<ArrowIcon diagonal /></a></h3>
              <p className="career-role">{item.role}</p>
              <p className="career-note">{item.note}</p>
              <time>{item.period}</time>
            </article>
          ))}
        </div>

        <div className="career-foundation">
          <div><span className="section-kicker">Foundation</span><h3>Columbia University</h3><p>Computer Science · 4.15 / 4.0</p></div>
          <div className="foundation-points">
            <p><strong>3×</strong><span>WGCA All-American Scholar</span></p>
            <p><strong>D1</strong><span>Student athlete</span></p>
            <p><strong>TA</strong><span>Software engineering · Python · Data visualization</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <a className="az-mark" href="/" aria-label="Back to top"><GolfFlagMark /></a>
        <span>© {new Date().getFullYear()} Angela Zhang</span>
      </div>
    </footer>
  );
}

function ClubhousePortfolio() {
  return (
    <div className="portfolio-site">
      <a className="skip-link" href="#career">Skip to content</a>
      <SiteHeader />
      <main>
        <Hero />
        <Career />
        <ProjectShowcase />
        <Scheduler />
      </main>
      <Footer />
    </div>
  );
}

export function PortfolioPreviews() {
  return <ClubhousePortfolio />;
}
