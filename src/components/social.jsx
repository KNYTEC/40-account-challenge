export function YouTubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12z" />
    </svg>
  )
}

export function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.9 3.9 0 0 1-.9 1.4 3.9 3.9 0 0 1-1.4.9c-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.3-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.8.3 1.9.3 1.3.1 1.6.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.3.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9a2.1 2.1 0 0 0-.7-1.1 2.1 2.1 0 0 0-1.1-.7c-.4-.1-.8-.3-1.9-.3-1.3-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z" />
    </svg>
  )
}

/** Small icon-only links for the header and footer. */
export function SocialIcons({ socials, size = 18 }) {
  return (
    <>
      <a className="social-icon" href={socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube — trade recaps">
        <YouTubeIcon size={size} />
      </a>
      <a className="social-icon" href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram — behind the scenes">
        <InstagramIcon size={size} />
      </a>
    </>
  )
}

/** Big follow cards for the home page. */
export function SocialCards({ socials }) {
  return (
    <div className="social-cards">
      <a className="social-card yt" href={socials.youtube} target="_blank" rel="noreferrer">
        <span className="sc-icon">
          <YouTubeIcon size={26} />
        </span>
        <span>
          <span className="sc-name">YouTube</span>
          <span className="sc-desc">Daily trade recaps, every lockout on camera</span>
        </span>
        <span className="sc-arrow" aria-hidden="true">→</span>
      </a>
      <a className="social-card ig" href={socials.instagram} target="_blank" rel="noreferrer">
        <span className="sc-icon">
          <InstagramIcon size={26} />
        </span>
        <span>
          <span className="sc-name">Instagram</span>
          <span className="sc-desc">Behind the scenes of the 40 account challenge</span>
        </span>
        <span className="sc-arrow" aria-hidden="true">→</span>
      </a>
    </div>
  )
}
