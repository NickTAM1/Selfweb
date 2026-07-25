import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

const EDGE_MARGIN = 16;
const GAP = 10;

/**
 * Icon-only glass button that opens a small popover listing `items` as
 * clickable links, instead of linking straight out itself. Used where a
 * single icon needs to represent more than one destination (e.g. two GitHub
 * accounts) without rendering two duplicate icon buttons side by side.
 *
 * The panel is rendered via a portal into `document.body` instead of being
 * positioned `absolute` inside `.icon-popover`. Reason: `.box` (the glass
 * card class this button often lives inside, e.g. "Get in Touch") has
 * `backdrop-filter`, which creates a new CSS stacking context per spec. A
 * panel nested in that box's DOM subtree is trapped inside that stacking
 * context no matter how high its z-index is set -- a later sibling `.box`
 * (e.g. "Send a Message") is a separate, later-painted stacking context that
 * paints on top of it regardless. Portaling the panel out to `document.body`
 * (a `position: fixed` sibling of everything, positioned from the trigger's
 * `getBoundingClientRect()`) escapes the trapped stacking context entirely --
 * the same technique used by Radix/Popper and other popover libraries.
 *
 * The open/close pop is a short, click-triggered interaction (not continuous
 * or scroll-linked motion), so -- consistent with ProjectModal's open/close
 * animation and the rest of the button/box motion in this app -- it is
 * deliberately NOT gated behind `prefers-reduced-motion`.
 */
export default function IconPopover({ icon, label, items }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const anchorRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [edgeShift, setEdgeShift] = useState(0);

  // Compute the panel's viewport-fixed top/left from the trigger's real
  // bounding rect (since the panel is now `position: fixed` on
  // `document.body` instead of `position: absolute` inside `.icon-popover`,
  // it no longer inherits any position from its trigger automatically), then
  // -- same edge-clamp logic the pre-portal version used, just adapted to
  // viewport coordinates -- measure the anchor's actual rendered width and
  // nudge the centered position back inside the viewport with an extra
  // translateX if it would overflow either edge.
  function measure() {
    const trigger = triggerRef.current;
    const anchor = anchorRef.current;
    if (!trigger || !anchor) return;
    const rect = trigger.getBoundingClientRect();
    const top = rect.bottom + GAP;
    const centerX = rect.left + rect.width / 2;
    setCoords({ top, left: centerX });

    const panelWidth = anchor.getBoundingClientRect().width;
    const panelLeft = centerX - panelWidth / 2;
    const panelRight = centerX + panelWidth / 2;
    if (panelRight > window.innerWidth - EDGE_MARGIN) {
      setEdgeShift(window.innerWidth - EDGE_MARGIN - panelRight);
    } else if (panelLeft < EDGE_MARGIN) {
      setEdgeShift(EDGE_MARGIN - panelLeft);
    } else {
      setEdgeShift(0);
    }
  }

  // Measure as soon as the portaled anchor mounts, via a callback ref rather
  // than a `useLayoutEffect` keyed on `open`. A layout effect can run before
  // the portaled node's ref is guaranteed populated (portal + AnimatePresence
  // mount timing isn't the same as a plain child element), which left the
  // very first open of each session stuck at the default {top:0, left:0}
  // coordinates. A callback ref fires exactly when this specific DOM node is
  // attached during commit, so `measure()` always has both the trigger and
  // the anchor available.
  //
  // Memoized with an empty dep array so it keeps a stable identity across
  // renders -- an inline (non-memoized) callback ref is a *new* function on
  // every render, and React re-invokes a ref callback (detach old, attach
  // new) whenever its identity changes, not just on real mount/unmount. That
  // would call `measure()` -> setState -> re-render -> new function identity
  // -> ref re-invoked -> setState again, an infinite "Maximum update depth
  // exceeded" loop. `measure` itself only reads refs/constants/globals (no
  // props or state), so a stale closure over it here is safe.
  const handleAnchorRef = useCallback((node) => {
    anchorRef.current = node;
    if (node) {
      measure();
    }
  }, []);

  // A portaled `position: fixed` element does not move with its trigger when
  // the page scrolls or the viewport resizes -- unlike the old absolutely
  // positioned version, which scrolled naturally with the document because it
  // lived inside the normal flow. Recompute on scroll/resize while open so
  // the popover never visually detaches from its trigger button.
  useEffect(() => {
    if (!open) return undefined;
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  // Close on outside click and Escape while open. Registered only while open
  // so there's no listener sitting around the rest of the time, and always
  // cleaned up on close/unmount. The panel is portaled outside
  // `containerRef`'s DOM subtree now, so a click inside the panel must also
  // be checked against `anchorRef` (the portaled wrapper containing the
  // panel) -- otherwise it would look like an "outside" click and close the
  // popover before the link's own onClick runs.
  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(e) {
      const insideTrigger = containerRef.current && containerRef.current.contains(e.target);
      const insidePanel = anchorRef.current && anchorRef.current.contains(e.target);
      if (!insideTrigger && !insidePanel) {
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
        ref={triggerRef}
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
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              // Positioning (fixed top/left + centering translateX) lives on
              // this plain (non-motion) wrapper, same reasoning as the
              // pre-portal version: Motion writes its own inline `transform`
              // on the element it animates (for the y/scale pop below), and
              // an inline style always wins over a CSS/style `transform` on
              // that same node, so a `translateX(-50%)` set directly on the
              // motion.div would get silently clobbered the instant Motion
              // attaches. Splitting positioning (this div) from animation
              // (the motion.div inside it) avoids that fight entirely.
              <div
                className="icon-popover-anchor"
                ref={handleAnchorRef}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  transform: `translateX(calc(-50% + ${edgeShift}px))`,
                }}
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
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
