import { useState } from 'react'

// Renders the profile photo when one is configured and loads successfully.
// Gracefully renders nothing if `src` is empty or the image 404s, so the
// header/footer never show a broken image before the file is added.
export function Avatar({ src, alt, className }) {
  const [ok, setOk] = useState(Boolean(src))
  if (!src || !ok) return null
  return <img className={className} src={src} alt={alt} onError={() => setOk(false)} loading="lazy" />
}
