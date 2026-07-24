import { useEffect } from "react";

const RIPPLE_SELECTOR = ".btn-glass, .filter-tab, .view-details-btn, .modal-close, .btn-link";

/**
 * Delegated "bubble" ripple for every glass button on the site. Attaches a
 * single `pointerdown` listener on `document` (called once at the app shell)
 * instead of one listener per button, so new buttons work automatically with
 * zero extra wiring -- they just need one of the classes in RIPPLE_SELECTOR.
 *
 * Purely visual: it only ever appends/removes a decorative <span>, never
 * calls preventDefault/stopPropagation, so it can never interfere with the
 * button's real click behavior (navigation, modal open, form submit, etc).
 *
 * Respects prefers-reduced-motion: when the user has that set, no ripple
 * spans are created at all.
 */
export default function useRipple() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    function reducedMotion() {
      return (
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }

    function handlePointerDown(e) {
      if (reducedMotion()) return;
      // Only react to the primary button / primary touch contact.
      if (e.button !== undefined && e.button !== 0) return;

      const target = e.target;
      const el =
        target && typeof target.closest === "function" ? target.closest(RIPPLE_SELECTOR) : null;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;

      span.addEventListener("animationend", () => {
        span.remove();
      });

      el.appendChild(span);
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);
}
