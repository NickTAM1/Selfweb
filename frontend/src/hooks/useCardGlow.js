import { useEffect } from "react";

const CARD_SELECTOR = ".box, .project-card-compact";

/**
 * Cursor-following "spotlight" highlight for glass cards (see the .box::after
 * rule in App.css). A single shared `pointermove` listener on `document`
 * drives every card on the page -- not one listener per card -- so the cost
 * stays flat no matter how many cards are rendered.
 *
 * Performance: `getBoundingClientRect()` is only called when the hovered
 * card actually changes (tracked in `currentCard`/`currentRect`), never on
 * every single mousemove, and never by iterating all cards -- only the one
 * element under the pointer is ever measured.
 *
 * Visibility is intentionally NOT handled here: this hook only ever writes
 * the `--mx`/`--my` position as plain DOM style properties (never React
 * state, so it can't trigger re-renders), while the CSS `:hover` pseudo-class
 * alone decides whether the glow is visible. That split keeps the JS work on
 * every pointer move to the bare minimum.
 *
 * Gated behind `(hover: hover) and (pointer: fine)` so touch/coarse-pointer
 * devices never attach the listener at all -- zero overhead on mobile, and
 * no glow left stuck at the last touch position.
 */
export default function useCardGlow() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!hasFinePointer.matches) {
      return undefined;
    }

    let currentCard = null;
    let currentRect = null;

    function handlePointerMove(e) {
      const target = e.target;
      const card = target && typeof target.closest === "function" ? target.closest(CARD_SELECTOR) : null;

      if (card !== currentCard) {
        currentCard = card;
        currentRect = card ? card.getBoundingClientRect() : null;
      }

      if (!currentCard || !currentRect) return;

      const x = ((e.clientX - currentRect.left) / currentRect.width) * 100;
      const y = ((e.clientY - currentRect.top) / currentRect.height) * 100;
      currentCard.style.setProperty("--mx", `${x}%`);
      currentCard.style.setProperty("--my", `${y}%`);
    }

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);
}
