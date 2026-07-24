import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import MediaGallery from "./MediaGallery.jsx";

const MODAL_VARIANTS = {
  closed: { scale: 0.85, opacity: 0 },
  open: { scale: 1, opacity: 1 },
};

// Defensively open the dialog. showModal() can throw InvalidStateError in a
// handful of real-world cases beyond the obvious "already open" one -- e.g.
// an engine that still considers the element mid-removal from the top layer
// right after a very recent close() (see the race documented above the
// `[project]` effect below). Recovery: force-close whatever native state
// exists, then retry showModal() once. Both the initial attempt and the
// recovery attempt are wrapped so a second failure can never throw an
// uncaught exception into React's render/effect cycle -- worst case the
// dialog silently fails to show and we log a warning instead of crashing.
function safeShowModal(dialog) {
  try {
    dialog.showModal();
  } catch {
    try {
      dialog.close();
    } catch {
      // Already closed / nothing to close -- fine, ignore.
    }
    try {
      dialog.showModal();
    } catch (retryErr) {
      console.warn("ProjectModal: showModal() recovery failed; dialog may not be visible", retryErr);
    }
  }
}

// Defensively close the dialog. Per spec close() on a non-open dialog is a
// no-op, but some engines have been observed throwing InvalidStateError
// there too, so this guards with `dialog.open` (cheap, avoids the throw in
// the common case) AND wraps the call itself (belt and suspenders) so a
// stubborn engine still can't crash the app.
function safeClose(dialog) {
  if (!dialog.open) return;
  try {
    dialog.close();
  } catch (err) {
    console.warn("ProjectModal: dialog.close() failed", err);
  }
}

/**
 * In-page project detail dialog. Uses the native <dialog> element so focus
 * trapping comes for free from the browser. Open/close state is driven
 * entirely from the `project` prop (React state), never from the dialog's
 * native "close"/"cancel" events -- those are not fired reliably by every
 * engine, and tying scroll-lock or state resets to them can leave the page
 * permanently unscrollable. The last opened project stays rendered while the
 * dialog plays its close animation, and is only replaced once a new project
 * is selected (see the render-time sync below).
 */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const [renderedProject, setRenderedProject] = useState(project);
  const reduceMotion = useReducedMotion();

  // Keep the dialog's contents in sync when a project is selected. Setting this
  // during render (not in an effect) means the content is correct before the
  // browser paints the open animation.
  if (project && project !== renderedProject) {
    setRenderedProject(project);
  }

  // Drive the native <dialog> AND the body scroll-lock straight from the
  // `project` prop (React state) -- deliberately NOT from the dialog's "close"
  // event. Some engines don't fire "close" reliably, and if the scroll-lock
  // restore is tied to that event a single missed fire leaves the whole page
  // frozen (overflow:hidden) forever, and state desynced so the modal can't
  // reopen. Tying the restore to this effect's cleanup keyed on `project`
  // guarantees it always runs when the modal closes or the component unmounts.
  //
  // Why switching projects mid-animation is safe -- traced explicitly:
  // Clicking a *different* project's "View details" while a modal is already
  // open sets `activeId` straight from A to B (Projects.jsx never passes
  // through null in that case), so `project` goes A -> B in one commit. The
  // dialog is already open, `renderedProject` is updated synchronously during
  // render (see the `if (project && project !== renderedProject)` line
  // above, which runs before this effect), and the effect below sees
  // `dialog.open === true` so it skips showModal() entirely -- only the
  // content changes, the native dialog state is untouched. No desync
  // possible in that path.
  // The trickier interleaving is: close project A (activeId -> null, this
  // effect calls dialog.close()), and *before* the browser's close-animation
  // finishes, the user opens project B from the grid (activeId -> B). Because
  // `dialog.close()` clears `dialog.open` synchronously even though the CSS
  // transition (`overlay`/`display: allow-discrete`) is still animating the
  // element out of the top layer, some engines are not yet ready to accept a
  // fresh `showModal()` call at that exact moment and throw InvalidStateError.
  // That's precisely the case `safeShowModal` exists for: it force-resets
  // (close, swallow any error) and retries once, so this interleaving can
  // never leave the dialog stuck closed (or throw into React) -- worst case
  // it logs a `console.warn` and the user can click again.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (project) {
      if (!dialog.open) {
        safeShowModal(dialog);
      }
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    // Backdrop clicks and the close (x) button never call dialog.close()
    // directly -- they call `onClose()`, which flips the `project` prop to
    // null and lets this single effect drive the actual native close. That
    // keeps exactly one code path responsible for closing the dialog, so the
    // `dialog.open` guard only needs to live here to cover every close
    // trigger (backdrop click, close button, Esc-via-keydown-handler below).
    safeClose(dialog);
    return undefined;
  }, [project]);

  // Final safety net, independent of the effect above: no matter what order
  // effects fire in, or whether some future edit changes the logic above,
  // guarantee the body scroll lock can never survive this component
  // unmounting. This is an unconditional unmount-only cleanup and does not
  // duplicate/contradict the per-open cleanup above (that one restores on
  // every close/change of `project`; this one is the last-resort backstop).
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Esc via an explicit keydown handler rather than the dialog's native
  // "cancel" event. Native Esc-dismissal (and the cancel/close events) is not
  // fired by every engine, so handling the key directly makes Esc behave the
  // same everywhere. preventDefault stops any native dismissal so React state
  // stays the single source of truth; onClose then drives the close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function requestClose() {
    onClose();
  }

  function handleBackdropClick(e) {
    if (e.target === dialogRef.current) {
      requestClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="project-modal"
      onClick={handleBackdropClick}
      aria-labelledby={renderedProject ? "project-modal-title" : undefined}
    >
      {renderedProject && (
        <motion.div
          className="project-modal-inner"
          variants={MODAL_VARIANTS}
          initial="closed"
          animate={project ? "open" : "closed"}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 30 }
          }
        >
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={requestClose}
          >
            ×
          </button>

          <span className="mono-label accent project-category">
            {renderedProject.categoryLabel}
          </span>
          <h2 id="project-modal-title">{renderedProject.title}</h2>
          <p className="project-summary">{renderedProject.summary}</p>

          <div className="badge-row">
            {renderedProject.badges.map((badge) => (
              <span className="badge-emerald" key={badge}>
                {badge}
              </span>
            ))}
          </div>

          <MediaGallery items={renderedProject.media} />

          <p className="project-section-label">Highlights</p>
          <ul className="highlights">
            {renderedProject.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          {renderedProject.detail}
        </motion.div>
      )}
    </dialog>
  );
}
