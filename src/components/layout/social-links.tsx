import { Facebook, Github, Instagram, Linkedin, Youtube } from 'lucide-react'
import { SITE_NAME, SOCIAL_PROFILES, socialProfileIsLive, type SocialProfile } from '@/lib/brand'
import { cn } from '@/lib/utils'

type IconProps = { size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }

/**
 * Lucide has no X, Telegram or WhatsApp mark, so these three are drawn here on
 * the same 24px grid with round 2px strokes, to sit in a row with the others.
 */
function StrokeIcon({ size = 18, strokeWidth = 2, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

function XIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </StrokeIcon>
  )
}

function TelegramIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
    </StrokeIcon>
  )
}

function WhatsappIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
    </StrokeIcon>
  )
}

const ICONS: Record<SocialProfile['id'], (props: IconProps) => React.ReactNode> = {
  linkedin: (props) => <Linkedin {...props} />,
  x: XIcon,
  youtube: (props) => <Youtube {...props} />,
  facebook: (props) => <Facebook {...props} />,
  instagram: (props) => <Instagram {...props} />,
  telegram: TelegramIcon,
  whatsapp: WhatsappIcon,
  github: (props) => <Github {...props} />,
}

/**
 * The social row in the footer. A profile with a URL is a link that opens in a
 * new tab; one still being set up shows its icon, dimmed and not clickable,
 * with "coming soon" on hover. See SOCIAL_PROFILES in lib/brand.
 */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)} aria-label={`${SITE_NAME} on social media`}>
      {SOCIAL_PROFILES.map((profile) => {
        const Icon = ICONS[profile.id]
        const live = socialProfileIsLive(profile)
        const box =
          'grid h-9 w-9 place-items-center rounded-ui border border-line-2 text-steel-300 transition-colors'
        return (
          <li key={profile.id}>
            {live ? (
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={`${SITE_NAME} on ${profile.label}`}
                title={profile.label}
                className={cn(box, 'hover:border-line-1 hover:bg-bg-2 hover:text-steel-100')}
              >
                <Icon size={17} strokeWidth={1.75} aria-hidden />
              </a>
            ) : (
              <span
                role="img"
                aria-label={`${profile.label}: coming soon`}
                title={`${profile.label} — coming soon`}
                className={cn(box, 'cursor-default opacity-45')}
              >
                <Icon size={17} strokeWidth={1.75} aria-hidden />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
