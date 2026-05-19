import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { CategoryFilter } from '../components/CategoryFilter'
import { CityFilter } from '../components/CityFilter'
import { DepartmentFilter } from '../components/DepartmentFilter'
import { EmptyState } from '../components/EmptyState'
import { NetworkFilter } from '../components/NetworkFilter'
import { VentureCard } from '../components/VentureCard'
import { useFavorites } from '../hooks/useFavorites'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../hooks/useToast'
import { PRIMARY_COUNTRY_NAME } from '../lib/geo'
import { filterVentures } from '../services/ventureService'
import { defaultVentureFilters } from '../types/forms'

const PAGE_SIZE = 24

function isNonEmptyString(value: string | undefined): value is string {
  return Boolean(value)
}

export function DiscoverPage() {
  const navigate = useNavigate()
  useSEO({
    title: 'Explorar emprendimientos',
    description: 'Explorá emprendimientos de Colombia. Filtrá por categoría, departamento, ciudad y redes para encontrar marcas y creadores de tu comunidad.',
    path: '/discover',
  })
  const [filters, setFilters] = useState(defaultVentureFilters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filters])
  const { currentUser, currentVenture, publishedVentures, toggleFavorite, createFollowAction } = useAppData()
  const { isFavorite } = useFavorites()
  const { pushToast } = useToast()

  const filteredVentures = filterVentures(
    publishedVentures.filter((venture) => venture.country === PRIMARY_COUNTRY_NAME && venture.id !== currentVenture?.id),
    filters,
  )

  const availableDepartments = Array.from(
    new Set(
      filteredVentures
        .map((venture) => venture.department)
        .filter(isNonEmptyString),
    ),
  ).sort()
  const availableCities = Array.from(
    new Set(
      filteredVentures
        .filter((venture) => !filters.department || venture.department === filters.department)
        .map((venture) => venture.city)
        .filter(isNonEmptyString),
    ),
  ).sort()
  const activeAdvancedFilters = [
    filters.tag,
    filters.category,
    filters.department,
    filters.city,
    filters.network,
  ].filter(Boolean)

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
          <p>Empezá buscando por nombre o palabra clave. Si hace falta, filtrá por departamento, ciudad o red para afinar dentro de Colombia.</p>
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
                  placeholder="Café, branding, música..."
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
                <option value="recent">Más recientes</option>
                <option value="active">Más activos</option>
                <option value="supported">Más apoyados</option>
                <option value="trusted">Mejor reputación</option>
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

              <DepartmentFilter
                departments={availableDepartments}
                value={filters.department}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    department: value,
                    city: '',
                  }))
                }
              />

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
            {filters.category ? <span className="tag">Categoría: {filters.category}</span> : null}
            {filters.department ? <span className="tag">Departamento: {filters.department}</span> : null}
            {filters.city ? <span className="tag">Ciudad: {filters.city}</span> : null}
            {filters.network ? <span className="tag">Red: {filters.network}</span> : null}
            {filters.tag ? <span className="tag">Tag: {filters.tag}</span> : null}
          </section>
        ) : null}

        {filteredVentures.length === 0 ? (
          <EmptyState
            title="No encontramos emprendimientos con esos filtros"
            description="Probá otra categoría o una búsqueda más amplia."
          />
        ) : (
          <>
            <div className="venture-grid">
              {filteredVentures.slice(0, visibleCount).map((venture) => (
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

            {visibleCount < filteredVentures.length ? (
              <div className="load-more">
                <span className="muted-text">{Math.min(visibleCount, filteredVentures.length)} de {filteredVentures.length}</span>
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Ver más
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
