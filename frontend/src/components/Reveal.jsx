import { motion } from "motion/react";

const STEP_DELAY = 0.06;
const MAX_DELAY = 0.36;

/**
 * Wraps children in a Motion "bubble pop" scroll reveal: a small spring
 * scale/opacity/rise triggered by `whileInView`. Used on every page, so this
 * is written defensively -- there must be NO path where content stays stuck
 * invisible:
 *
 * - `whileInView` fires as soon as the element is (or becomes) intersecting,
 *   which covers content that is already in the viewport on first paint
 *   (e.g. above-the-fold hero/stat elements) as well as content scrolled
 *   into view later. `once: false` makes this bidirectional: the element
 *   animates back to `initial` (shrink + fade) whenever it leaves the
 *   viewport in either direction, then pops back in on re-entry -- so it
 *   must never get stuck on the "hidden" side, either. This is purely a
 *   presentational effect on the wrapping motion element; it's never used
 *   to gate real state (e.g. the Projects modal is a separate <dialog>, not
 *   wrapped in Reveal, so its open/close state can't be coupled to this).
 * - If `IntersectionObserver` isn't available (the mechanism `whileInView`
 *   relies on under the hood), we also skip Motion and render the plain
 *   static tag so nothing depends on an API that might not exist.
 */
export default function Reveal({
  children,
  index = 0,
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const noObserverSupport =
    typeof window !== "undefined" && typeof IntersectionObserver === "undefined";

  if (noObserverSupport) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[Tag] || motion.div;
  const delay = Math.min(index * STEP_DELAY, MAX_DELAY);

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, scale: 0.9, y: 22 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
