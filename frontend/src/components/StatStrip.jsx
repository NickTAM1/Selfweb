import { useEffect, useRef, useState } from "react";

const COUNT_MS = 800;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * A single stat tile. Numeric values count up from 0 when scrolled into
 * view; non-numeric values (e.g. "N1", "BSc") just render as-is once visible.
 */
function StatTile({ value, label }) {
  const ref = useRef(null);
  const numericTarget = /^\d+$/.test(String(value)) ? parseInt(value, 10) : null;
  // Lazy initializer so the "already correct" cases (non-numeric, reduced
  // motion, no IntersectionObserver support) never need a setState call
  // inside the effect -- only the animated count-up path does, and that
  // happens asynchronously inside requestAnimationFrame callbacks.
  const [display, setDisplay] = useState(() => {
    if (numericTarget === null) return value;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      return numericTarget;
    }
    return 0;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (numericTarget === null) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    let rafId;
    const runCountUp = () => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / COUNT_MS, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        setDisplay(Math.round(eased * numericTarget));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplay(numericTarget);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stat-tile" ref={ref}>
      <span className="stat-value">{display}</span>
      <span className="mono-label">{label}</span>
    </div>
  );
}

export default function StatStrip({ stats }) {
  return (
    <div className="stat-strip">
      {stats.map((stat) => (
        <StatTile key={stat.label} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
}
