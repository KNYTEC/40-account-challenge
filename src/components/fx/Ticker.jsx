// Terminal-style scrolling stat ticker. Content is duplicated for a seamless
// CSS marquee loop; reduced-motion users get a static strip.
export function Ticker({ items }) {
  const row = items.map((item, i) => (
    <span className="ticker-item" key={i}>
      {item}
      <span className="ticker-sep" aria-hidden="true">
        ◆
      </span>
    </span>
  ))
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  )
}
