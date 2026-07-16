import { prefersReducedMotion } from '../../hooks/useInView.js'

// Giant outlined-text strips scrolling in opposite directions.
// Reduced motion: a single static line each.
export function KineticMarquee({ lines }) {
  const reduced = prefersReducedMotion()
  return (
    <div className="km" aria-hidden="true">
      {lines.map((line, li) => (
        <div className={`km-line ${li % 2 ? 'reverse' : ''} ${line.solid ? 'solid' : ''}`} key={li}>
          {reduced ? (
            <span className="km-track static">{line.text}&nbsp;✦&nbsp;</span>
          ) : (
            <span className="km-track">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i}>{line.text}&nbsp;✦&nbsp;</span>
              ))}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
