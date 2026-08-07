import { useEffect } from "react";

const INITIAL_REVEAL_DELAY = 650;
const SETTLE_CHECK_DELAYS = [900, 1800, 2700];
const SETTLE_WINDOW = 3600;
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

export function HashScrollManager() {
  useEffect(() => {
    let stopActiveRestoration = () => {};

    const restoreHashPosition = ({ revealPage = false } = {}) => {
      stopActiveRestoration();

      const target = currentHashTarget();
      if (!target) return;

      let stopped = false;
      let observer;
      const timers = [];

      const alignTarget = (behavior = "instant", force = false) => {
        if (stopped || !target.isConnected) return;
        if (force || Math.abs(target.getBoundingClientRect().top) > 1) {
          target.scrollIntoView({ block: "start", behavior });
        }
      };

      const stop = () => {
        if (stopped) return;
        stopped = true;
        observer?.disconnect();
        timers.forEach((timer) => window.clearTimeout(timer));
        INTERRUPTION_EVENTS.forEach((eventName) => {
          window.removeEventListener(eventName, stop);
        });
      };

      stopActiveRestoration = stop;
      INTERRUPTION_EVENTS.forEach((eventName) => {
        window.addEventListener(eventName, stop, { passive: true, once: true });
      });

      const beginLayoutSettling = () => {
        alignTarget("instant");

        if (typeof ResizeObserver === "function") {
          let previousHeight = document.body.scrollHeight;
          observer = new ResizeObserver(() => {
            const nextHeight = document.body.scrollHeight;
            if (nextHeight !== previousHeight) {
              previousHeight = nextHeight;
              alignTarget("instant");
            }
          });
          observer.observe(document.body);
        } else {
          SETTLE_CHECK_DELAYS.slice(1).forEach((delay) => {
            timers.push(window.setTimeout(() => alignTarget("instant"), delay));
          });
        }
      };

      const moveToTarget = () => {
        alignTarget("smooth", true);
        timers.push(window.setTimeout(beginLayoutSettling, SETTLE_CHECK_DELAYS[0]));
        timers.push(window.setTimeout(stop, SETTLE_WINDOW));
      };

      if (revealPage) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        timers.push(window.setTimeout(moveToTarget, INITIAL_REVEAL_DELAY));
      } else {
        moveToTarget();
      }
    };

    const onHashChange = () => restoreHashPosition();

    restoreHashPosition({ revealPage: true });
    window.addEventListener("hashchange", onHashChange);

    return () => {
      stopActiveRestoration();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
