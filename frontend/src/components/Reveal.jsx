import { useEffect, useRef, useState } from "react";

const MAX_DELAY = 360;
const STEP_DELAY = 60;
const FALLBACK_MS = 1800;

/**
 * Wraps children in an IntersectionObserver-driven fade/rise reveal.
 * Falls back to visible-on-mount if IntersectionObserver is unavailable,
 * and always becomes visible after a timeout so content never stays hidden.
 */
export default function Reveal({
  children,
  index = 0,
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    const fallback = setTimeout(() => setVisible(true), FALLBACK_MS);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const delay = Math.min(index * STEP_DELAY, MAX_DELAY);
  const revealClass = ["reveal", visible ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={revealClass} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
