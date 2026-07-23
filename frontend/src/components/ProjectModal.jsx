import { useEffect, useRef, useState } from "react";

function MediaPlaceholder({ label }) {
  return (
    <div className="media-container media-placeholder">
      <p>No gameplay clip or screenshot added yet</p>
      <div className="media-overlay">
        <span className="badge-emerald">{label}</span>
        <div className="media-controls">
          <button className="btn-glass" disabled>
            ▶ Play Clip
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaVideo({ src, label }) {
  return (
    <div className="media-container">
      <span className="badge-emerald media-caption">{label}</span>
      <video className="project-video" src={src} controls preload="metadata" />
    </div>
  );
}

/**
 * In-page project detail dialog. Uses the native <dialog> element so focus
 * trapping and Esc-to-close come for free from the browser. The last opened
 * project stays rendered while the dialog plays its close animation -- it is
 * only cleared once the native "close" event actually fires.
 */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const [renderedProject, setRenderedProject] = useState(project);

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
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (project) {
      if (!dialog.open) {
        dialog.showModal();
      }
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    if (dialog.open) {
      dialog.close();
    }
    return undefined;
  }, [project]);

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
        <div className="project-modal-inner">
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

          {renderedProject.media.type === "video" ? (
            <MediaVideo src={renderedProject.media.src} label={renderedProject.media.label} />
          ) : (
            <MediaPlaceholder label={renderedProject.media.label} />
          )}

          <p className="project-section-label">Highlights</p>
          <ul className="highlights">
            {renderedProject.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          {renderedProject.detail}
        </div>
      )}
    </dialog>
  );
}
