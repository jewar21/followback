import type { ComponentType } from 'react'
import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  Circle,
  Clapperboard,
  Globe,
  MessageCircle,
  Music2,
  Palette,
  Send,
} from 'lucide-react'
import { socialNetworkLabels } from '../lib/constants'
import { ensureExternalUrl } from '../lib/utils'
import type { SocialNetworkName } from '../types/models'

const iconMap = {
  instagram: Camera,
  tiktok: Clapperboard,
  facebook: Circle,
  youtube: Clapperboard,
  spotify: Music2,
  x: Send,
  linkedin: BriefcaseBusiness,
  website: Globe,
  whatsapp: MessageCircle,
  behance: Palette,
  github: AtSign,
} satisfies Record<SocialNetworkName, ComponentType<{ size?: number; strokeWidth?: number }>>

type SocialIconButtonProps = {
  network: SocialNetworkName
  url: string
  onClick?: () => void
  compact?: boolean
}

export function SocialIconButton({
  network,
  url,
  onClick,
  compact = false,
}: SocialIconButtonProps) {
  const Icon = iconMap[network]

  return (
    <a
      className={`social-link ${compact ? 'social-link--compact' : ''}`}
      href={ensureExternalUrl(url)}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
    >
      <Icon size={18} strokeWidth={2.1} />
      <span>{socialNetworkLabels[network]}</span>
    </a>
  )
}
