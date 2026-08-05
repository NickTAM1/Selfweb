import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const CLOCK_MARKERS = Array.from({ length: 12 }, (_, index) => String((index + 11) % 12 + 1));

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}

function getClockAngles(value) {
  const hours = value.getHours() % 12;
  const minutes = value.getMinutes();
  const seconds = value.getSeconds();

  return {
    hour: hours * 30 + minutes * 0.5,
    minute: minutes * 6 + seconds * 0.1,
    secondDelay: -(seconds + value.getMilliseconds() / 1000),
  };
}

export default function AmbientClock() {
  const [now, setNow] = useState(() => new Date());
  const [showTopButton, setShowTopButton] = useState(false);
  const [secondDelay] = useState(() => getClockAngles(new Date()).secondDelay);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setShowTopButton(window.scrollY > 360));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const angles = useMemo(() => getClockAngles(now), [now]);
  const timeLabel = formatTime(now);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "LOCAL";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  return (
    <aside className="ambient-tools" aria-label="Time and page controls">
      <div className="ambient-clock" aria-label={`Local time ${timeLabel}`}>
        <div className="ambient-clock-face" aria-hidden="true">
          {CLOCK_MARKERS.map((marker, index) => (
            <span
              className="ambient-clock-marker"
              key={marker}
              style={{ "--marker-index": index }}
            >
              {marker}
            </span>
          ))}
          <span
            className="clock-hand clock-hand-hour"
            style={{ transform: `translateX(-50%) rotate(${angles.hour}deg)` }}
          />
          <span
            className="clock-hand clock-hand-minute"
            style={{ transform: `translateX(-50%) rotate(${angles.minute}deg)` }}
          />
          <span
            className="clock-hand clock-hand-second"
            style={{ animationDelay: `${secondDelay.current}s` }}
          />
          <span className="clock-center" />
        </div>
        <div className="ambient-clock-readout">
          <strong>{timeLabel}</strong>
          <span>{timezone.replace("/", " · ").replaceAll("_", " ")}</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showTopButton ? (
          <motion.button
            className="back-to-top btn-glass"
            type="button"
            aria-label="Back to top"
            data-tooltip="Back to top"
            initial={{ opacity: 0, y: 12, scale: 0.84 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.84 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={scrollToTop}
          >
            <span aria-hidden="true">↑</span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </aside>
  );
}
