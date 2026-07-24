import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const COUNT_MS = 800;
const STEP_DELAY = 0.06;
const MAX_DELAY = 0.36;

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
 * The tile itself also pops in (Motion "bubble" spring, staggered by
 * `index`) the same way Reveal-wrapped sections do -- see Reveal.jsx for the
 * reduced-motion / no-IntersectionObserver safety reasoning this mirrors.
 */
function StatTile({ value, label, index }) {
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

  const shouldReduceMotion = useReducedMotion();
  const noObserverSupport =
    typeof window !== "undefined" && typeof IntersectionObserver === "undefined";

  if (shouldReduceMotion || noObserverSupport) {
    return (
      <div className="stat-tile" ref={ref}>
        <span className="stat-value">{display}</span>
        <span className="mono-label">{label}</span>
      </div>
    );
  }

  const delay = Math.min(index * STEP_DELAY, MAX_DELAY);

  return (
    <motion.div
      className="stat-tile"
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 22 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
    >
      <span className="stat-value">{display}</span>
      <span className="mono-label">{label}</span>
    </motion.div>
  );
}

export default function StatStrip({ stats }) {
  return (
    <div className="stat-strip">
      {stats.map((stat, i) => (
        <StatTile key={stat.label} value={stat.value} label={stat.label} index={i} />
      ))}
    </div>
  );
}
