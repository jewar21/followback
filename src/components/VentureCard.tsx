import { Link } from 'react-router-dom'
import { FavoriteButton } from './FavoriteButton'
import { FollowBackButton } from './FollowBackButton'
import { VentureSocialLinks } from './VentureSocialLinks'
import { type FollowableNetwork } from '../lib/constants'
import { countNetworks } from '../services/ventureService'
import { formatLocationLabel, getFollowableNetworks } from '../lib/utils'
import type { Venture } from '../types/models'

type VentureCardProps = Readonly<{
  venture: Venture
  isFavorite?: boolean
  disableProtectedActions?: boolean
  onToggleFavorite?: () => void
  onCreateFollowAction?: (venture: Venture, network: FollowableNetwork) => void
  onProtectedAction?: () => void
}>

export function VentureCard({
  venture,
  isFavorite = false,
  disableProtectedActions,
  onToggleFavorite,
  onCreateFollowAction,
  onProtectedAction,
}: VentureCardProps) {
  const followableNetworks = getFollowableNetworks(venture.socialLinks)

  return (
    <article className="venture-card">
      <div className="venture-card__header">
        <div className="venture-brand">
          <div className="venture-avatar">
            {venture.logoURL ? <img src={venture.logoURL} alt={venture.name} /> : venture.name.slice(0, 2)}
          </div>
          <div className="venture-brand__copy">
            <h3>{venture.name}</h3>
            <p>{venture.category} • {formatLocationLabel(venture) || 'Ubicación pendiente'}</p>
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
