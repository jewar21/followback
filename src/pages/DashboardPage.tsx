import { useAppData } from '../app/providers/AppDataProvider'
import { DashboardStats } from '../components/DashboardStats'
import { EmptyState } from '../components/EmptyState'
import { ReceivedFollowRequests } from '../components/ReceivedFollowRequests'
import { SentFollowRequests } from '../components/SentFollowRequests'
import { useFavorites } from '../hooks/useFavorites'
import { useFollowActions } from '../hooks/useFollowActions'
import { useToast } from '../hooks/useToast'

export function DashboardPage() {
  const { currentVenture, database, updateFollowActionStatus, toggleFavorite } = useAppData()
  const { received, sent } = useFollowActions()
  const { favoriteVentures, isFavorite } = useFavorites()
  const { pushToast } = useToast()
  const venturesById = new Map(database.ventures.map((venture) => [venture.id, venture]))

  if (!currentVenture) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Aun no tienes emprendimiento"
            description="Completa el onboarding para aparecer en el directorio y activar tu dashboard."
            ctaLabel="Crear mi emprendimiento"
            ctaTo="/onboarding"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Dashboard</span>
          <h1>{currentVenture.name}</h1>
          <p>Controla tu visibilidad, tus redes y las solicitudes de reciprocidad.</p>
        </div>

        <DashboardStats venture={currentVenture} />

        <section className="two-column-layout">
          <article className="panel">
            <div className="section-heading">
              <h2>Solicitudes recibidas</h2>
            </div>
            <ReceivedFollowRequests
              actions={received}
              venturesById={venturesById}
              onReciprocate={(actionId) => {
                try {
                  updateFollowActionStatus(actionId, 'reciprocated')
                  pushToast('Solicitud marcada como reciprocada.', 'success')
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : 'No fue posible actualizar la solicitud.', 'danger')
                }
              }}
              onReject={(actionId) => {
                try {
                  updateFollowActionStatus(actionId, 'rejected')
                  pushToast('Solicitud rechazada.', 'neutral')
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : 'No fue posible actualizar la solicitud.', 'danger')
                }
              }}
            />
          </article>

          <article className="panel">
            <div className="section-heading">
              <h2>Solicitudes enviadas</h2>
            </div>
            <SentFollowRequests
              actions={sent}
              venturesById={venturesById}
              onCancel={(actionId) => {
                try {
                  updateFollowActionStatus(actionId, 'cancelled')
                  pushToast('Solicitud cancelada.', 'neutral')
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : 'No fue posible cancelar la solicitud.', 'danger')
                }
              }}
            />
          </article>
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Mis favoritos</h2>
          </div>
          {favoriteVentures.length === 0 ? (
            <p className="muted-text">Guarda emprendimientos interesantes para volver rapido a sus redes.</p>
          ) : (
            <div className="card-grid">
              {favoriteVentures.map((venture) => (
                <article key={venture.id} className="mini-card">
                  <div>
                    <strong>{venture.name}</strong>
                    <p>
                      {venture.category} • {venture.city}
                    </p>
                  </div>
                  <button className="button button--ghost" onClick={() => toggleFavorite(venture.id)}>
                    {isFavorite(venture.id) ? 'Quitar' : 'Guardar'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
