import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const STAGE_VARIANTS = {
  enter: (dir) => ({ opacity: 0, scale: 0.97, x: dir >= 0 ? 24 : -24 }),
  center: { opacity: 1, scale: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, scale: 0.97, x: dir >= 0 ? -24 : 24 }),
};

const STAGE_VARIANTS_REDUCED = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

function expectedFilename(src) {
  if (!src) return "media file";
  const parts = src.split("/");
  return parts[parts.length - 1];
}

function StagePlaceholder({ item }) {
  return (
    <div className="media-stage-placeholder">
      <span className="mono-label accent">
        {item.type === "video" ? "VIDEO MISSING" : "IMAGE MISSING"}
      </span>
      <p>
        Add <code>{expectedFilename(item.src)}</code> to <code>public/media/</code>
      </p>
    </div>
  );
}

function ThumbPlaceholder({ index }) {
  return (
    <div className="media-thumb-placeholder">
      <span className="mono-label">IMG {index + 1}</span>
    </div>
  );
}

/**
 * Per-project media gallery: a main stage (video or image) with a row of
 * switcher thumbnails below it. Missing files (most projects don't have real
 * clips/screenshots yet) fail gracefully into a labeled placeholder that
 * names the exact file the owner needs to drop into public/media/ -- no code
 * change required once the file shows up, since the <img>/<video> just
 * starts loading successfully instead of firing onError.
 */
export default function MediaGallery({ items }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [stageError, setStageError] = useState({});
  const [thumbError, setThumbError] = useState({});
  const [prevItems, setPrevItems] = useState(items);
  const reduceMotion = useReducedMotion();

  // ProjectModal reuses the same MediaGallery instance across different
  // projects (it isn't remounted when the active project changes), so reset
  // back to the first item whenever the `items` array itself changes --
  // otherwise reopening a different project could start on whatever index
  // was last viewed for the previous one. Adjusting state during render
  // (rather than in an effect) avoids an extra cascading render, same
  // pattern ProjectModal itself uses to sync `renderedProject`.
  if (items !== prevItems) {
    setPrevItems(items);
    setIndex(0);
    setDirection(0);
    setStageError({});
    setThumbError({});
  }

  if (!items || items.length === 0) return null;

  const active = items[Math.min(index, items.length - 1)];
  const activeBroken = stageError[active.src];

  function goTo(nextIndex) {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
  }

  function goPrev() {
    goTo((index - 1 + items.length) % items.length);
  }

  function goNext() {
    goTo((index + 1) % items.length);
  }

  const variants = reduceMotion ? STAGE_VARIANTS_REDUCED : STAGE_VARIANTS;
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 320, damping: 34 };

  return (
    <div className="media-gallery">
      <div className="media-stage">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={active.src}
            className="media-stage-frame"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {activeBroken ? (
              <StagePlaceholder item={active} />
            ) : active.type === "video" ? (
              <video
                className="project-video"
                src={active.src}
                controls
                preload="metadata"
                onError={() => setStageError((prev) => ({ ...prev, [active.src]: true }))}
              />
            ) : (
              <img
                src={active.src}
                alt={active.label || `Project media ${index + 1}`}
                onError={() => setStageError((prev) => ({ ...prev, [active.src]: true }))}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <span className="badge-emerald media-caption">{active.label}</span>

        {items.length > 1 && (
          <>
            <button
              type="button"
              className="media-nav media-nav-prev"
              aria-label="Previous media"
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              type="button"
              className="media-nav media-nav-next"
              aria-label="Next media"
              onClick={goNext}
            >
              ›
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="media-thumbs" role="tablist" aria-label="Media switcher">
          {items.map((item, i) => {
            const broken = thumbError[item.src];
            const isActive = i === index;
            return (
              <motion.button
                type="button"
                key={item.src}
                className="media-thumb"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label || `Media item ${i + 1}`}
                onClick={() => goTo(i)}
                whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              >
                {broken ? (
                  <ThumbPlaceholder index={i} />
                ) : item.type === "video" ? (
                  <video
                    className="media-thumb-media"
                    src={item.src}
                    muted
                    preload="metadata"
                    onError={() => setThumbError((prev) => ({ ...prev, [item.src]: true }))}
                  />
                ) : (
                  <img
                    className="media-thumb-media"
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    onError={() => setThumbError((prev) => ({ ...prev, [item.src]: true }))}
                  />
                )}
                {item.type === "video" && !broken && (
                  <span className="media-thumb-play" aria-hidden="true">
                    ▶
                  </span>
                )}
                {isActive && (
                  <motion.span
                    className="media-thumb-ring"
                    layoutId="media-thumb-ring"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
