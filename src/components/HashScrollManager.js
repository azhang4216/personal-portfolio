import { useEffect } from "react";

const INITIAL_REVEAL_DELAY = 1000;
const CRUISING_MILLISECONDS_PER_VIEWPORT = 1300;
const EASING_RAMP_DURATION = 400;
const MINIMUM_SCROLL_DURATION = 450;
const SETTLE_WINDOW = 5000;
const INTERRUPTION_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"];

function currentHashTarget() {
  const encodedId = window.location.hash.slice(1);
  if (!encodedId) return null;

  try {
    return document.getElementById(decodeURIComponent(encodedId));
  } catch {
    return document.getElementById(encodedId);
  }
}

function smoothStep(progress) {
  return progress * progress * (3 - (2 * progress));
}

function pacedProgress(elapsed, duration) {
  if (duration <= EASING_RAMP_DURATION * 2) {
    return smoothStep(Math.min(elapsed / duration, 1));
  }

  const cruisingScale = duration - EASING_RAMP_DURATION;
  if (elapsed < EASING_RAMP_DURATION) {
    return (elapsed * elapsed) / (2 * EASING_RAMP_DURATION * cruisingScale);
  }

  if (elapsed > duration - EASING_RAMP_DURATION) {
    const remaining = duration - elapsed;
    return 1 - ((remaining * remaining) / (2 * EASING_RAMP_DURATION * cruisingScale));
  }

  return (elapsed - (EASING_RAMP_DURATION / 2)) / cruisingScale;
}

export function scrollDurationForDistance(distance, viewportHeight = window.innerHeight) {
  const normalizedDistance = Math.abs(distance);
  if (normalizedDistance <= 1) return 0;

  const safeViewportHeight = Math.max(viewportHeight, 1);
  return Math.max(
    MINIMUM_SCROLL_DURATION,
    ((normalizedDistance / safeViewportHeight) * CRUISING_MILLISECONDS_PER_VIEWPORT)
      + EASING_RAMP_DURATION
  );
}

export function HashScrollManager() {
  useEffect(() => {
    let stopActiveRestoration = () => {};

    const restoreHashPosition = ({ revealPage = false } = {}) => {
      stopActiveRestoration();

      const target = currentHashTarget();
      if (!target) return;

      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      let stopped = false;
      let animationFrame;
      let observer;
      const timers = [];

      const targetTop = () => window.scrollY + target.getBoundingClientRect().top;
      const queueTimer = (callback, delay) => {
        const timer = window.setTimeout(callback, delay);
        timers.push(timer);
        return timer;
      };

      const stop = () => {
        if (stopped) return;
        stopped = true;
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        observer?.disconnect();
        timers.forEach((timer) => window.clearTimeout(timer));
        INTERRUPTION_EVENTS.forEach((eventName) => {
          window.removeEventListener(eventName, stop);
        });
      };

      const watchForLayoutShifts = () => {
        if (stopped || typeof ResizeObserver !== "function") return;

        observer?.disconnect();
        let previousHeight = document.body.scrollHeight;
        observer = new ResizeObserver(() => {
          const nextHeight = document.body.scrollHeight;
          const heightChanged = nextHeight !== previousHeight;
          const displaced = Math.abs(target.getBoundingClientRect().top) > 2;
          previousHeight = nextHeight;
          if (displaced && heightChanged) {
            observer.disconnect();
            animateToTarget(scrollDurationForDistance(target.getBoundingClientRect().top));
          }
        });
        observer.observe(document.body);
      };

      const animateToTarget = (duration) => {
        if (stopped || !target.isConnected) return;
        if (animationFrame) window.cancelAnimationFrame(animationFrame);

        const startY = window.scrollY;
        const startedAt = window.performance.now();

        const step = (timestamp) => {
          if (stopped || !target.isConnected) return;

          const elapsed = Math.max(timestamp - startedAt, 0);
          const progress = Math.min(elapsed / duration, 1);
          const nextY = startY + ((targetTop() - startY) * pacedProgress(elapsed, duration));
          window.scrollTo({ top: nextY, left: 0, behavior: "instant" });

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(step);
          } else {
            animationFrame = undefined;
            watchForLayoutShifts();
          }
        };

        if (reducedMotion || duration <= 0) {
          window.scrollTo({ top: targetTop(), left: 0, behavior: "instant" });
          watchForLayoutShifts();
          return;
        }

        animationFrame = window.requestAnimationFrame(step);
      };

      stopActiveRestoration = stop;
      INTERRUPTION_EVENTS.forEach((eventName) => {
        window.addEventListener(eventName, stop, { passive: true, once: true });
      });

      const moveToTarget = () => {
        const distance = targetTop() - window.scrollY;
        const duration = scrollDurationForDistance(distance);
        animateToTarget(duration);
        queueTimer(stop, duration + SETTLE_WINDOW);
      };

      if (revealPage && !reducedMotion) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        queueTimer(moveToTarget, INITIAL_REVEAL_DELAY);
      } else {
        moveToTarget();
      }
    };

    const onHashChange = () => restoreHashPosition();
    const onDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest?.("a[href]");
      if (!link) return;

      const destination = new URL(link.href, window.location.href);
      const samePage = destination.origin === window.location.origin
        && destination.pathname === window.location.pathname
        && destination.search === window.location.search;

      if (!samePage || !destination.hash) return;

      event.preventDefault();
      if (window.location.hash !== destination.hash) {
        window.history.pushState(null, "", destination.hash);
      }
      restoreHashPosition();
    };

    restoreHashPosition({ revealPage: true });
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onDocumentClick);

    return () => {
      stopActiveRestoration();
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return null;
}
