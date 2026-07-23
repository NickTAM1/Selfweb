/**
 * A horizontally-scrolling row of badge chips. Content is duplicated once so
 * the CSS keyframe (translateX 0 -> -50%) loops seamlessly. Under
 * prefers-reduced-motion the row-level CSS drops the animation and wraps the
 * (still duplicated) chips normally, so items render twice in that mode --
 * acceptable since the row still shows every skill and never scrolls.
 */
export default function Marquee({ items, reverse = false }) {
  return (
    <div className={`marquee-row${reverse ? " reverse" : ""}`}>
      <div className="marquee-track">
        {items.map((item, i) => (
          <span className="badge-emerald" key={`${item}-a-${i}`}>
            {item}
          </span>
        ))}
        {items.map((item, i) => (
          <span className="badge-emerald marquee-dup" aria-hidden="true" key={`${item}-b-${i}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
