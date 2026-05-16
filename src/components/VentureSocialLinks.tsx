import { getAvailableNetworks } from '../lib/utils'
import type { SocialLinks, SocialNetworkName } from '../types/models'
import { SocialIconButton } from './SocialIconButton'

type VentureSocialLinksProps = {
  socialLinks: SocialLinks
  onNetworkClick?: (network: SocialNetworkName, url: string) => void
  compact?: boolean
}

export function VentureSocialLinks({
  socialLinks,
  onNetworkClick,
  compact = false,
}: VentureSocialLinksProps) {
  const networks = getAvailableNetworks(socialLinks)

  if (networks.length === 0) {
    return <p className="muted-text">Sin redes publicas por ahora.</p>
  }

  return (
    <div className={`social-links-grid ${compact ? 'social-links-grid--compact' : ''}`}>
      {networks.map((network) => (
        <SocialIconButton
          key={network}
          network={network}
          url={socialLinks[network] ?? ''}
          compact={compact}
          onClick={() => onNetworkClick?.(network, socialLinks[network] ?? '')}
        />
      ))}
    </div>
  )
}
