import { Search, SlidersHorizontal, X } from 'lucide-react'
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
import { filterVentures } from '../services/ventureService'
import { defaultVentureFilters } from '../types/forms'

export function DiscoverPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultVentureFilters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const { currentUser, currentVenture, publishedVentures, toggleFavorite, createFollowAction } = useAppData()
  const { isFavorite } = useFavorites()
  const { pushToast } = useToast()

  const filteredVentures = filterVentures(
    publishedVentures.filter((venture) => venture.id !== currentVenture?.id),
    filters,
  )

  const countries = Array.from(new Set(publishedVentures.map((venture) => venture.country))).sort()
  const availableCities = Array.from(
    new Set(
      publishedVentures
        .filter((venture) => !filters.country || venture.country === filters.country)
        .map((venture) => venture.city)
        .filter(Boolean),
    ),
  ).sort()
  const activeAdvancedFilters = [filters.tag, filters.category, filters.country, filters.city, filters.network].filter(Boolean)

  function resetFilters() {
    setFilters(defaultVentureFilters)
    setShowAdvancedFilters(false)
  }

  function requireAuth() {
    if (!currentUser) {
      pushToast('Iniciá sesión para guardar o marcar seguimientos.', 'neutral')
      navigate('/login')
      return false
    }

    if (!currentVenture) {
      pushToast('Completá tu emprendimiento para usar Voseguime.', 'neutral')
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
          <h1>Explorá emprendimientos y entrá directo a sus redes</h1>
          <p>Empezá buscando por nombre o palabra clave. Si hace falta, abrí filtros avanzados para afinar.</p>
        </div>

        <section className="panel filter-panel">
          <div className="discover-toolbar">
            <label className="field field--full discover-search">
              <span>Buscar emprendimientos</span>
              <div className="discover-search__input">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Cafe, branding, musica..."
                />
              </div>
            </label>

            <label className="field">
              <span>Ordenar por</span>
              <select
                value={filters.sortBy}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    sortBy: event.target.value as typeof current.sortBy,
                  }))
                }
              >
                <option value="recent">Mas recientes</option>
                <option value="active">Mas activos</option>
                <option value="supported">Mas apoyados</option>
                <option value="trusted">Mejor reputacion</option>
              </select>
            </label>
          </div>

          <div className="discover-filter-actions">
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              <SlidersHorizontal size={16} />
              {showAdvancedFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
            </button>

            {activeAdvancedFilters.length > 0 || filters.search ? (
              <button className="button button--ghost" type="button" onClick={resetFilters}>
                <X size={16} />
                Limpiar
              </button>
            ) : null}
          </div>

          <div className="discover-filter-meta">
            <span>{filteredVentures.length} resultados</span>
            {activeAdvancedFilters.length > 0 ? <span>{activeAdvancedFilters.length} filtros activos</span> : null}
          </div>

          {showAdvancedFilters ? (
            <div className="form-grid">
              <label className="field">
                <span>Buscar por tag</span>
                <input
                  value={filters.tag}
                  onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}
                  placeholder="branding"
                />
              </label>

              <CategoryFilter
                value={filters.category}
                onChange={(value) => setFilters((current) => ({ ...current, category: value }))}
              />

              <label className="field">
                <span>Pais</span>
                <select
                  value={filters.country}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      country: event.target.value,
                      city: event.target.value === current.country ? current.city : '',
                    }))
                  }
                >
                  <option value="">Todos</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <CityFilter
                cities={availableCities}
                value={filters.city}
                onChange={(value) => setFilters((current) => ({ ...current, city: value }))}
              />

              <NetworkFilter
                value={filters.network}
                onChange={(value) => setFilters((current) => ({ ...current, network: value }))}
              />
            </div>
          ) : null}
        </section>

        {!showAdvancedFilters && activeAdvancedFilters.length > 0 ? (
          <section className="discover-active-filters">
            {filters.category ? <span className="tag">Categoria: {filters.category}</span> : null}
            {filters.country ? <span className="tag">Pais: {filters.country}</span> : null}
            {filters.city ? <span className="tag">Ciudad: {filters.city}</span> : null}
            {filters.network ? <span className="tag">Red: {filters.network}</span> : null}
            {filters.tag ? <span className="tag">Tag: {filters.tag}</span> : null}
          </section>
        ) : null}

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
                    pushToast('Solicitud creada.', 'success')
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
