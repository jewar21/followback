import type { Venture } from '../types/models'
import { VentureCard } from './VentureCard'

type FavoritesListProps = {
  ventures: Venture[]
  onToggleFavorite: (ventureId: string) => void
  isFavorite: (ventureId: string) => boolean
}

export function FavoritesList({ ventures, onToggleFavorite, isFavorite }: FavoritesListProps) {
  return (
    <div className="card-grid">
      {ventures.map((venture) => (
        <VentureCard
          key={venture.id}
          venture={venture}
          isFavorite={isFavorite(venture.id)}
          onToggleFavorite={() => onToggleFavorite(venture.id)}
        />
      ))}
    </div>
  )
}
