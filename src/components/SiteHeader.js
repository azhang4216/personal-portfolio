import { useEffect, useRef, useState } from "react";
import { GitHubIcon, LinkedInIcon } from "./PortfolioIcons";
import { LINKS } from "../data/portfolio";

const NAV_ITEMS = [
  ["Career scorecard", "#career"],
  ["Projects", "#projects"],
  ["Let’s connect", "#connect"],
];

export function SiteHeader() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScroll = useRef(0);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScroll.current;

      if (current < 80 || delta < -8) setVisible(true);
      if (current > 120 && delta > 8 && !menuOpen) setVisible(false);
      lastScroll.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    const focusable = menuRef.current?.querySelectorAll("a, button") || [];
    if (menuOpen) window.requestAnimationFrame(() => focusable[0]?.focus());
    if (!menuOpen && wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = menuOpen;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key === "Tab" && menuOpen && focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`site-header ${visible || menuOpen ? "is-visible" : "is-hidden"}`}>
        <div className="header-shell">
          <a className="az-mark desktop-mark" href="#top" aria-label="Angela Zhang, back to top">AZ</a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="header-links">
            <a className="header-social" href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="Angela on LinkedIn"><LinkedInIcon /></a>
            <a className="header-social" href={LINKS.github} target="_blank" rel="noreferrer" aria-label="Angela on GitHub"><GitHubIcon /></a>
            <a className="resume-link" href={LINKS.resume} target="_blank" rel="noreferrer">Résumé <span aria-hidden="true">↗</span></a>
          </div>

          <button
            ref={triggerRef}
            className={`mobile-menu-trigger ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="mobile-az">AZ</span>
            <span className="menu-lines" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>

      <div ref={menuRef} className={`mobile-navigation ${menuOpen ? "is-open" : ""}`} id="mobile-navigation" aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {NAV_ITEMS.map(([label, href], index) => (
            <a key={href} href={href} tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}><span>0{index + 1}</span>{label}</a>
          ))}
          <a href={LINKS.resume} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}><span>04</span>Résumé</a>
        </nav>
        <div className="mobile-socials">
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1}><LinkedInIcon /> LinkedIn</a>
          <a href={LINKS.github} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1}><GitHubIcon /> GitHub</a>
        </div>
        <p>Vancouver / San Francisco · <span>Available worldwide</span></p>
      </div>
    </>
  );
}
