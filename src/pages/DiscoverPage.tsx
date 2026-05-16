import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { CategoryFilter } from '../components/CategoryFilter'
import { CityFilter } from '../components/CityFilter'
import { EmptyState } from '../components/EmptyState'
import { NetworkFilter } from '../components/NetworkFilter'
import { VentureCard } from '../components/VentureCard'
import { useFavorites } from '../hooks/useFavorites'
import { useToast } from '../hooks/useToast'
import { defaultVentureFilters } from '../types/forms'
import { filterVentures } from '../services/ventureService'

export function DiscoverPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultVentureFilters)
  const { currentUser, currentVenture, publishedVentures, toggleFavorite, createFollowAction } = useAppData()
  const { isFavorite } = useFavorites()
  const { pushToast } = useToast()

  const filteredVentures = filterVentures(
    publishedVentures.filter((venture) => venture.id !== currentVenture?.id),
    filters,
  )
  const cities = Array.from(new Set(publishedVentures.map((venture) => venture.city).filter(Boolean))).sort()
  const countries = Array.from(new Set(publishedVentures.map((venture) => venture.country))).sort()

  function requireAuth() {
    if (!currentUser) {
      pushToast('Inicia sesion para guardar o marcar follows.', 'neutral')
      navigate('/login')
      return false
    }

    if (!currentVenture) {
      pushToast('Completa tu emprendimiento para usar FollowBack.', 'neutral')
      navigate('/onboarding')
      return false
    }

    return true
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Discover</span>
          <h1>Explora emprendimientos y entra directo a sus redes</h1>
          <p>Filtra por categoria, ciudad, pais o red disponible. Guarda perfiles y registra followbacks manuales.</p>
        </div>

        <section className="panel filter-panel">
          <div className="form-grid">
            <label className="field">
              <span>Buscar por nombre</span>
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Cafe, branding, musica..."
              />
            </label>

            <label className="field">
              <span>Buscar por tag</span>
              <input
                value={filters.tag}
                onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}
                placeholder="branding"
              />
            </label>

            <CategoryFilter value={filters.category} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} />

            <label className="field">
              <span>Pais</span>
              <select value={filters.country} onChange={(event) => setFilters((current) => ({ ...current, country: event.target.value }))}>
                <option value="">Todos</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <CityFilter cities={cities} value={filters.city} onChange={(value) => setFilters((current) => ({ ...current, city: value }))} />

            <NetworkFilter value={filters.network} onChange={(value) => setFilters((current) => ({ ...current, network: value }))} />

            <label className="field">
              <span>Ordenar por</span>
              <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value as typeof current.sortBy }))}>
                <option value="recent">Mas recientes</option>
                <option value="active">Mas activos</option>
                <option value="supported">Mas apoyados</option>
                <option value="trusted">Mejor reputacion</option>
              </select>
            </label>
          </div>
        </section>

        {filteredVentures.length === 0 ? (
          <EmptyState
            title="No encontramos emprendimientos con esos filtros"
            description="Prueba otra categoria, pais o una busqueda mas amplia."
          />
        ) : (
          <div className="card-grid">
            {filteredVentures.map((venture) => (
              <VentureCard
                key={venture.id}
                venture={venture}
                isFavorite={isFavorite(venture.id)}
                disableProtectedActions={!currentUser}
                onProtectedAction={requireAuth}
                onToggleFavorite={() => {
                  if (!requireAuth()) {
                    return
                  }

                  toggleFavorite(venture.id)
                  pushToast('Favoritos actualizados.', 'success')
                }}
                onCreateFollowAction={(targetVenture, network) => {
                  if (!requireAuth()) {
                    return
                  }

                  try {
                    createFollowAction(targetVenture, network)
                    pushToast('Solicitud FollowBack creada.', 'success')
                  } catch (error) {
                    pushToast(error instanceof Error ? error.message : 'No fue posible crear la solicitud.', 'danger')
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
