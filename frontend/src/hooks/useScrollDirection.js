import { useEffect, useRef, useState } from "react";

// Distance from the top (px) below which the nav always stays visible,
// regardless of scroll direction -- avoids a flickery hide/show right at the
// top of the page where there's barely anything to scroll past.
const TOP_THRESHOLD = 80;

/**
 * Tracks scroll direction and reports whether a fixed/sticky nav should be
 * hidden: true while actively scrolling down past TOP_THRESHOLD, false while
 * scrolling up or near the top. Sampling is rAF-throttled (one
 * getBoundingClientRect-free scrollY read per animation frame, not per
 * scroll event) so it stays cheap even on a long page.
 *
 * Doesn't touch document.body.style.overflow or anything else -- purely
 * reads window.scrollY, so it has no interaction with ProjectModal's own
 * scroll-lock. While that lock is active there's nothing to scroll, so this
 * hook simply never receives scroll events during that time.
 */
export default function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    lastYRef.current = window.scrollY;

    function evaluate() {
      tickingRef.current = false;
      const y = window.scrollY;
      const lastY = lastYRef.current;

      if (y < TOP_THRESHOLD) {
        setHidden(false);
      } else if (y > lastY) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }

      lastYRef.current = y;
    }

    function handleScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(evaluate);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return hidden;
}
