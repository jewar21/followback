import { FavoritesList } from '../components/FavoritesList'
import { EmptyState } from '../components/EmptyState'
import { useAppData } from '../app/providers/AppDataProvider'
import { useFavorites } from '../hooks/useFavorites'

export function FavoritesPage() {
  const { toggleFavorite } = useAppData()
  const { favoriteVentures, isFavorite } = useFavorites()

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Favoritos</span>
          <h1>Emprendimientos guardados</h1>
          <p>Tu lista rápida para volver a revisar redes, propuestas o posibles alianzas.</p>
        </div>
        {favoriteVentures.length === 0 ? (
          <EmptyState
            title="No guardaste emprendimientos"
            description="Usá Guardar en el directorio para construir tu propia lista."
            ctaLabel="Explorar directorio"
            ctaTo="/discover"
          />
        ) : (
          <FavoritesList
            ventures={favoriteVentures}
            isFavorite={isFavorite}
            onToggleFavorite={(ventureId) => toggleFavorite(ventureId)}
          />
        )}
      </div>
    </div>
  )
}
