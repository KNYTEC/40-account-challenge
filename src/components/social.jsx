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

export function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.2v12.86a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.3-2.49v-3.27a5.87 5.87 0 0 0-.71-.04A5.86 5.86 0 0 0 4 15.83 5.86 5.86 0 0 0 9.86 21.7a5.86 5.86 0 0 0 5.86-5.87V9.4a7.36 7.36 0 0 0 4.28 1.37V7.57a4.28 4.28 0 0 1-3.4-1.75z" />
    </svg>
  )
}

export function KickIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 3h6v5h2V6h2V3h6v6h-2v2h-2v2h2v2h2v6h-6v-3h-2v-2H9v5H3z" />
    </svg>
  )
}

// Promo order (also the order shown everywhere). Filtered to the socials that
// actually have a URL in config, so adding/removing one is a config-only change.
const SOCIALS = [
  {
    key: 'youtube',
    label: 'YouTube',
    Icon: YouTubeIcon,
    bg: '#e01e2f',
    fg: '#fff',
    desc: 'The road to $100K in payouts — every lockout on camera',
    short: 'long-form recaps',
  },
  {
    key: 'kick',
    label: 'Kick',
    Icon: KickIcon,
    bg: '#53fc18',
    fg: '#0b0b0b',
    desc: 'Live streams — the trades as they happen',
    short: 'live streams',
  },
  {
    key: 'x',
    label: 'X',
    Icon: XIcon,
    bg: '#0b0b0b',
    fg: '#fff',
    desc: 'Real-time posts, quick hits & threads',
    short: 'real-time posts',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    Icon: InstagramIcon,
    bg: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)',
    fg: '#fff',
    desc: 'Behind the scenes of the 40 account challenge',
    short: 'behind the scenes',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    Icon: TikTokIcon,
    bg: '#0b0b0b',
    fg: '#fff',
    desc: 'Short clips — the best & worst moments',
    short: 'short clips',
  },
]

export function socialList(socials) {
  return SOCIALS.filter((s) => socials && socials[s.key])
}

/** Small monochrome icon-only links for the header and footer. */
export function SocialIcons({ socials, size = 18 }) {
  return (
    <>
      {socialList(socials).map((s) => (
        <a
          key={s.key}
          className="social-icon"
          href={socials[s.key]}
          target="_blank"
          rel="noreferrer"
          aria-label={`${s.label} — ${s.short}`}
        >
          <s.Icon size={size} />
        </a>
      ))}
    </>
  )
}

/** Big follow cards for the home page. */
export function SocialCards({ socials }) {
  return (
    <div className="social-cards">
      {socialList(socials).map((s) => (
        <a key={s.key} className="social-card" href={socials[s.key]} target="_blank" rel="noreferrer">
          <span className="sc-icon" style={{ background: s.bg, color: s.fg }}>
            <s.Icon size={26} />
          </span>
          <span>
            <span className="sc-name">{s.label}</span>
            <span className="sc-desc">{s.desc}</span>
          </span>
          <span className="sc-arrow" aria-hidden="true">
            →
          </span>
        </a>
      ))}
    </div>
  )
}
