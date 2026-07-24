import { motion, useReducedMotion } from "motion/react";

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
 *   into view later. `once: true` means it only ever needs to fire once.
 * - `prefers-reduced-motion` (via `useReducedMotion`) skips Motion entirely
 *   and renders the plain static tag, fully visible immediately -- no
 *   opacity/scale/transform is ever applied in that mode.
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
  const shouldReduceMotion = useReducedMotion();
  const noObserverSupport =
    typeof window !== "undefined" && typeof IntersectionObserver === "undefined";

  if (shouldReduceMotion || noObserverSupport) {
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
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
