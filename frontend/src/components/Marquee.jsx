/**
 * A horizontally-scrolling row of badge chips. Each sequence has its own
 * measured gap so translating the complete track by exactly 50% lands on the
 * next sequence without the tiny pause/jump the old flat list produced.
 */
export default function Marquee({ items, reverse = false }) {
  return (
    <div className={`marquee-row${reverse ? " reverse" : ""}`}>
      <div className="marquee-track">
        {[false, true].map((duplicate) => (
          <div
            className={`marquee-group${duplicate ? " marquee-dup" : ""}`}
            aria-hidden={duplicate || undefined}
            key={duplicate ? "duplicate" : "primary"}
          >
            {items.map((item, i) => (
              <span className="badge-emerald" key={`${item}-${duplicate ? "b" : "a"}-${i}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
