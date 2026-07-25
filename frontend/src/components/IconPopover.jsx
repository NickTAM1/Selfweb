import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const EDGE_MARGIN = 16;

/**
 * Icon-only glass button that opens a small popover listing `items` as
 * clickable links, instead of linking straight out itself. Used where a
 * single icon needs to represent more than one destination (e.g. two GitHub
 * accounts) without rendering two duplicate icon buttons side by side.
 *
 * The open/close pop is a short, click-triggered interaction (not continuous
 * or scroll-linked motion), so -- consistent with ProjectModal's open/close
 * animation and the rest of the button/box motion in this app -- it is
 * deliberately NOT gated behind `prefers-reduced-motion`.
 */
export default function IconPopover({ icon, label, items }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const anchorRef = useRef(null);
  const [edgeShift, setEdgeShift] = useState(0);

  // Keep the panel centered under the trigger AND inside the viewport. This
  // has to live on a plain (non-motion) wrapper: Motion writes its own inline
  // `transform` on the element it animates (for the y/scale pop below), and
  // an inline style always wins over a CSS class's `transform`, so a CSS
  // `translateX(-50%)` on that same node would get silently clobbered the
  // moment Motion attaches -- the panel would drift right by half its own
  // width instead of centering. Splitting positioning (this anchor div, CSS
  // `left: 50%` + a JS-computed inline translateX) from animation (the
  // Motion-controlled panel inside it) avoids that fight entirely.
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setEdgeShift(0);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth - EDGE_MARGIN) {
      setEdgeShift(window.innerWidth - EDGE_MARGIN - rect.right);
    } else if (rect.left < EDGE_MARGIN) {
      setEdgeShift(EDGE_MARGIN - rect.left);
    } else {
      setEdgeShift(0);
    }
  }, [open]);

  // Close on outside click and Escape while open. Registered only while open
  // so there's no listener sitting around the rest of the time, and always
  // cleaned up on close/unmount.
  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="icon-popover" ref={containerRef}>
      <motion.button
        type="button"
        className="btn-glass btn-icon btn-link"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        data-tooltip={label}
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
      </motion.button>
      <AnimatePresence>
        {open && (
          <div
            className="icon-popover-anchor"
            ref={anchorRef}
            style={{ transform: `translateX(calc(-50% + ${edgeShift}px))` }}
          >
            <motion.div
              className="icon-popover-panel"
              role="menu"
              aria-label={label}
              initial={{ opacity: 0, scale: 0.9, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  className="icon-popover-item"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
