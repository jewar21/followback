import { Link } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { EmptyState } from '../components/EmptyState'
import { formatDateLabel } from '../lib/utils'

export function NotificationsPage() {
  const { currentUser, database, markNotificationRead, markAllNotificationsRead } = useAppData()

  if (!currentUser) {
    return null
  }

  const notifications = [...database.notifications]
    .filter((notification) => notification.userId === currentUser.uid)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))

  const unreadCount = notifications.filter((notification) => notification.status === 'unread').length

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Notificaciones</span>
          <h1>Bandeja de novedades</h1>
          <p>Centraliza avisos del equipo, recordatorios de onboarding y mensajes que luego tambien pueden escalarse a push.</p>
        </div>

        <section className="panel admin-toolbar">
          <div>
            <strong>{unreadCount} sin leer</strong>
            <p className="muted-text">Las notificaciones administrativas quedan visibles aqui aunque el navegador no permita push.</p>
          </div>
          <button className="button button--ghost" onClick={() => markAllNotificationsRead()} disabled={unreadCount === 0}>
            Marcar todo como leido
          </button>
        </section>

        {notifications.length === 0 ? (
          <EmptyState
            title="Aun no tienes notificaciones"
            description="Cuando el equipo publique avisos internos o tengamos mensajes para tu cuenta, apareceran aqui."
            ctaLabel="Ir a explorar"
            ctaTo="/discover"
          />
        ) : (
          <section className="stack">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`panel notification-card ${notification.status === 'unread' ? 'notification-card--unread' : ''}`}
              >
                <div className="feedback-item__header">
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{formatDateLabel(notification.createdAt)}</p>
                  </div>
                  <span className="status-pill">{notification.channel === 'push' ? 'push' : 'in-app'}</span>
                </div>

                <p>{notification.message}</p>

                <div className="button-row">
                  {notification.ctaUrl ? (
                    <Link className="button button--ghost" to={notification.ctaUrl}>
                      Abrir
                    </Link>
                  ) : null}
                  {notification.status === 'unread' ? (
                    <button className="button button--primary" onClick={() => markNotificationRead(notification.id)}>
                      Marcar como leida
                    </button>
                  ) : (
                    <span className="muted-text">Leida {notification.readAt ? formatDateLabel(notification.readAt) : ''}</span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
