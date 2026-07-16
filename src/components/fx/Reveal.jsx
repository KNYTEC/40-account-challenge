import { useInView } from '../../hooks/useInView.js'

// Scroll-reveal wrapper: children rise + fade in the first time they enter
// the viewport. `delay` (ms) staggers siblings. Reduced-motion users see
// content immediately (CSS handles it).
export function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.15 })
  return (
    <div ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}
