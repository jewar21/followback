import { Link } from 'react-router-dom'
import { FavoriteButton } from './FavoriteButton'
import { FollowBackButton } from './FollowBackButton'
import { VentureSocialLinks } from './VentureSocialLinks'
import { countNetworks } from '../services/ventureService'
import { getAvailableNetworks } from '../lib/utils'
import type { SocialNetworkName, Venture } from '../types/models'

type VentureCardProps = {
  venture: Venture
  isFavorite?: boolean
  disableProtectedActions?: boolean
  onToggleFavorite?: () => void
  onCreateFollowAction?: (
    venture: Venture,
    network: Extract<
      SocialNetworkName,
      'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'spotify' | 'x' | 'linkedin' | 'website' | 'whatsapp'
    >,
  ) => void
  onProtectedAction?: () => void
}

export function VentureCard({
  venture,
  isFavorite = false,
  disableProtectedActions,
  onToggleFavorite,
  onCreateFollowAction,
  onProtectedAction,
}: VentureCardProps) {
  const followableNetworks = getAvailableNetworks(venture.socialLinks).filter((network) =>
    ['instagram', 'tiktok', 'facebook', 'youtube', 'spotify', 'x', 'linkedin', 'website', 'whatsapp'].includes(network),
  ) as Array<
    Extract<
      SocialNetworkName,
      'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'spotify' | 'x' | 'linkedin' | 'website' | 'whatsapp'
    >
  >

  return (
    <article className="venture-card">
      <div className="venture-card__header">
        <div className="venture-brand">
          <div className="venture-avatar">
            {venture.logoURL ? <img src={venture.logoURL} alt={venture.name} /> : venture.name.slice(0, 2)}
          </div>
          <div>
            <h3>{venture.name}</h3>
            <p>
              {venture.category} • {venture.city || 'Ciudad pendiente'}, {venture.country}
            </p>
          </div>
        </div>
        <span className="status-pill">{countNetworks(venture)} redes</span>
      </div>

      <p className="venture-description">{venture.description}</p>

      <div className="tag-row">
        {venture.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <VentureSocialLinks socialLinks={venture.socialLinks} compact />

      <div className="button-row button-row--stretch">
        <Link className="button button--ghost" to={`/ventures/${venture.slug}/networks`}>
          Ver redes
        </Link>
        <FavoriteButton
          active={isFavorite}
          disabled={disableProtectedActions}
          onClick={() => (disableProtectedActions ? onProtectedAction?.() : onToggleFavorite?.())}
        />
        <FollowBackButton
          networks={followableNetworks}
          disabled={disableProtectedActions}
          onSelect={(network) =>
            disableProtectedActions ? onProtectedAction?.() : onCreateFollowAction?.(venture, network)
          }
        />
      </div>
    </article>
  )
}
