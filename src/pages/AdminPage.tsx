import { Copy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import {
  feedbackCategoryLabels,
  feedbackProfileStatusLabels,
  pushSubscriptionStatusLabels,
} from '../lib/constants'
import { formatDateLabel } from '../lib/utils'
import { sendAdminCampaignEmail, type AdminCampaignAudience } from '../services/adminEmailService'
import type { AnnouncementAudience, PushSubscriptionRecord } from '../types/models'
import { useToast } from '../hooks/useToast'

export function AdminPage() {
  const {
    currentUser,
    database,
    updateUserAdminFields,
    updateFeedbackAdminStatus,
    updateReportAdminStatus,
    sendAdminNotification,
  } = useAppData()
  const { pushToast } = useToast()
  const [campaignSubject, setCampaignSubject] = useState('Actualizá tu perfil en Voseguime y contanos cómo mejorar')
  const [campaignBody, setCampaignBody] = useState(
    [
      'Hola,',
      '',
      'Estamos aplicando mejoras en Voseguime para que los perfiles sean más fáciles de completar, explorar y mantener actualizados.',
      '',
      'Te pedimos por favor entrar de nuevo, revisar tu información y completar tu emprendimiento para dejarlo disponible con mejores datos para la comunidad.',
      '',
      'También abrimos una sección de Feedback dentro de la app para que nos cuentes si ya terminaste de actualizar tus datos, si encontraste algún bloqueo o qué mejoras te gustaría ver.',
      '',
      'Gracias por ayudarnos a mejorar Voseguime.',
    ].join('\n'),
  )
  const [campaignAudience, setCampaignAudience] = useState<AnnouncementAudience>('pending_onboarding')
  const [announcementTitle, setAnnouncementTitle] = useState('Tenés novedades pendientes en Voseguime')
  const [announcementMessage, setAnnouncementMessage] = useState(
    'Entrá a la app, revisá tu perfil y dejá feedback si algo te está frenando. Este aviso va a quedar disponible en tu bandeja interna aunque no tengas push activo.',
  )
  const [announcementCtaUrl, setAnnouncementCtaUrl] = useState('/notifications')
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [progressFilter, setProgressFilter] = useState<'all' | 'complete' | 'pending'>('all')
  const [pushFilter, setPushFilter] = useState<'all' | 'enabled' | 'blocked' | 'pending' | 'unsupported' | 'error'>('all')

  const venturesByOwnerId = useMemo(
    () => new Map(database.ventures.map((venture) => [venture.ownerId, venture])),
    [database.ventures],
  )

  const pushByUserId = useMemo(() => {
    const map = new Map<string, PushSubscriptionRecord>()

    for (const subscription of database.pushSubscriptions) {
      const current = map.get(subscription.userId)

      if (!current || Date.parse(subscription.updatedAt) > Date.parse(current.updatedAt)) {
        map.set(subscription.userId, subscription)
      }
    }

    return map
  }, [database.pushSubscriptions])

  const authenticatedUsers = useMemo(
    () => [...database.users].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)),
    [database.users],
  )

  const filteredUsers = useMemo(() => {
    const normalizedQuery = userSearch.trim().toLowerCase()

    return authenticatedUsers.filter((user) => {
      const venture = venturesByOwnerId.get(user.uid)
      const subscription = pushByUserId.get(user.uid)
      const matchesQuery =
        !normalizedQuery ||
        user.displayName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        venture?.name.toLowerCase().includes(normalizedQuery)

      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesProgress =
        progressFilter === 'all' ||
        (progressFilter === 'complete' ? user.onboardingCompleted : !user.onboardingCompleted)
      const matchesPush = pushFilter === 'all' || (subscription?.status ?? 'pending') === pushFilter

      return matchesQuery && matchesRole && matchesProgress && matchesPush
    })
  }, [authenticatedUsers, progressFilter, pushByUserId, pushFilter, roleFilter, userSearch, venturesByOwnerId])

  const feedbackQueue = useMemo(
    () => [...database.feedbacks].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [database.feedbacks],
  )

  const reportsQueue = useMemo(
    () => [...database.reports].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [database.reports],
  )

  const internalNotifications = useMemo(
    () =>
      database.notifications.filter((notification) => notification.kind === 'announcement' && notification.channel === 'in_app'),
    [database.notifications],
  )

  const contactEmails = filteredUsers.map((user) => user.email).filter(Boolean)
  const audienceCount = useMemo(() => {
    if (campaignAudience === 'all_active') {
      return authenticatedUsers.filter((user) => user.status === 'active').length
    }

    if (campaignAudience === 'completed_onboarding') {
      return authenticatedUsers.filter((user) => user.status === 'active' && user.onboardingCompleted).length
    }

    if (campaignAudience === 'without_venture') {
      return authenticatedUsers.filter((user) => user.status === 'active' && !venturesByOwnerId.has(user.uid)).length
    }

    return authenticatedUsers.filter((user) => user.status === 'active' && !user.onboardingCompleted).length
  }, [authenticatedUsers, campaignAudience, venturesByOwnerId])

  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(contactEmails.join(', '))
      pushToast('Correos copiados al portapapeles.', 'success')
    } catch {
      pushToast('No fue posible copiar los correos.', 'danger')
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Admin</span>
          <h1>Panel administrativo</h1>
          <p>Controlá usuarios autenticados, revisá onboarding, centralizá feedback y atendé reportes sin entrar a Firestore manualmente.</p>
        </div>

        <section className="stats-grid">
          <article className="metric-card">
            <span>Usuarios autenticados</span>
            <strong>{authenticatedUsers.length}</strong>
          </article>
          <article className="metric-card">
            <span>Perfiles completos</span>
            <strong>{authenticatedUsers.filter((user) => user.onboardingCompleted).length}</strong>
          </article>
          <article className="metric-card">
            <span>Push habilitado</span>
            <strong>{database.pushSubscriptions.filter((subscription) => subscription.status === 'enabled').length}</strong>
          </article>
          <article className="metric-card">
            <span>Feedback pendiente</span>
            <strong>{feedbackQueue.filter((feedback) => feedback.status === 'new').length}</strong>
          </article>
          <article className="metric-card">
            <span>Reportes pendientes</span>
            <strong>{reportsQueue.filter((report) => report.status === 'pending').length}</strong>
          </article>
        </section>

        <section className="panel admin-toolbar">
          <div>
            <strong>Contactos filtrados</strong>
            <p className="muted-text">Copiá solo los correos del segmento visible para acciones manuales, CRM o futuras campañas externas.</p>
          </div>
          <button className="button button--ghost" onClick={() => void copyEmails()} disabled={contactEmails.length === 0}>
            <Copy size={16} />
            Copiar correos
          </button>
        </section>

        <div className="admin-layout">
          <section className="stack">
            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Campana interna</h2>
                  <p>Creá avisos que quedan visibles en la bandeja de notificaciones de cada usuario aunque no tenga push activo.</p>
                </div>
              </div>

              <form
                className="stack"
                onSubmit={(event) => {
                  event.preventDefault()

                  try {
                    const count = sendAdminNotification({
                      title: announcementTitle,
                      message: announcementMessage,
                      audience: campaignAudience,
                      ctaUrl: announcementCtaUrl,
                    })
                    pushToast(`Notificacion interna creada para ${count} usuarios.`, 'success')
                  } catch (error) {
                    pushToast(error instanceof Error ? error.message : 'No fue posible crear la notificacion.', 'danger')
                  }
                }}
              >
                <div className="form-grid">
                  <label className="field">
                    <span>Audiencia</span>
                    <select
                      value={campaignAudience}
                      onChange={(event) => setCampaignAudience(event.target.value as AnnouncementAudience)}
                    >
                      <option value="pending_onboarding">Onboarding pendiente</option>
                      <option value="completed_onboarding">Onboarding completo</option>
                      <option value="without_venture">Sin emprendimiento</option>
                      <option value="all_active">Todos los activos</option>
                    </select>
                  </label>

                  <div className="feedback-meta-card">
                    <span>Destinatarios estimados</span>
                    <strong>{audienceCount}</strong>
                    <small>Se guarda en Firestore como inbox interno del usuario.</small>
                  </div>

                  <label className="field field--full">
                    <span>Titulo</span>
                    <input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} />
                  </label>

                  <label className="field field--full">
                    <span>Mensaje</span>
                    <textarea rows={6} value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} />
                  </label>

                  <label className="field field--full">
                    <span>CTA interna</span>
                    <input value={announcementCtaUrl} onChange={(event) => setAnnouncementCtaUrl(event.target.value)} placeholder="/feedback" />
                  </label>
                </div>

                <div className="button-row">
                  <button className="button button--primary" type="submit">
                    Publicar notificación interna
                  </button>
                </div>
              </form>
            </section>

            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Campaña de correo</h2>
                  <p>Este bloque se mantiene para cuando actives Functions/Blaze. Mientras tanto, la campaña interna ya te cubre el caso operativo.</p>
                </div>
              </div>

              <form
                className="stack"
                onSubmit={(event) => {
                  event.preventDefault()

                  void (async () => {
                    try {
                      const result = await sendAdminCampaignEmail({
                        subject: campaignSubject,
                        body: campaignBody,
                        audience: campaignAudience as AdminCampaignAudience,
                      })
                      pushToast(`Campana enviada a ${result.recipientCount} usuarios.`, 'success')
                    } catch (error) {
                      pushToast(error instanceof Error ? error.message : 'No fue posible enviar la campana.', 'danger')
                    }
                  })()
                }}
              >
                <div className="form-grid">
                  <label className="field field--full">
                    <span>Asunto</span>
                    <input value={campaignSubject} onChange={(event) => setCampaignSubject(event.target.value)} />
                  </label>

                  <label className="field field--full">
                    <span>Mensaje</span>
                    <textarea rows={8} value={campaignBody} onChange={(event) => setCampaignBody(event.target.value)} />
                  </label>
                </div>

                <div className="button-row">
                  <button className="button button--ghost" type="submit">
                    Intentar envío por correo
                  </button>
                </div>
              </form>
            </section>

            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Usuarios</h2>
                  <p>Filtrá por onboarding, rol y readiness de push. Este era uno de los huecos más notorios del panel actual.</p>
                </div>
              </div>

              <div className="form-grid admin-filters">
                <label className="field field--full">
                  <span>Buscar</span>
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Nombre, correo o emprendimiento"
                  />
                </label>

                <label className="field">
                  <span>Rol</span>
                  <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}>
                    <option value="all">Todos</option>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>

                <label className="field">
                  <span>Onboarding</span>
                  <select
                    value={progressFilter}
                    onChange={(event) => setProgressFilter(event.target.value as typeof progressFilter)}
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="complete">Completo</option>
                  </select>
                </label>

                <label className="field">
                  <span>Push</span>
                  <select value={pushFilter} onChange={(event) => setPushFilter(event.target.value as typeof pushFilter)}>
                    <option value="all">Todos</option>
                    <option value="enabled">Habilitado</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="pending">Pendiente</option>
                    <option value="unsupported">No soportado</option>
                    <option value="error">Error</option>
                  </select>
                </label>
              </div>

              <div className="request-list">
                {filteredUsers.map((user) => {
                  const venture = venturesByOwnerId.get(user.uid)
                  const pushSubscription = pushByUserId.get(user.uid)

                  return (
                    <article key={user.uid} className="request-card">
                      <div className="feedback-item__header">
                        <div>
                          <strong>{user.displayName}</strong>
                          <p>{user.email}</p>
                        </div>
                        <span className="status-pill">{user.role}</span>
                      </div>

                      <div className="tag-row">
                        <span className="tag">{user.status}</span>
                        <span className="tag">{user.onboardingCompleted ? 'onboarding completo' : 'onboarding pendiente'}</span>
                        <span className="tag">{venture ? venture.name : 'sin emprendimiento'}</span>
                        <span className="tag">
                          {pushSubscriptionStatusLabels[pushSubscription?.status ?? 'pending']}
                        </span>
                      </div>

                      <div className="admin-actions">
                        <label className="field">
                          <span>Rol</span>
                          <select
                            value={user.role}
                            onChange={(event) => {
                              try {
                              updateUserAdminFields(user.uid, { role: event.target.value as typeof user.role })
                              pushToast('Rol actualizado.', 'success')
                            } catch (error) {
                                pushToast(error instanceof Error ? error.message : 'No fue posible actualizar el rol.', 'danger')
                              }
                            }}
                            disabled={user.uid === currentUser?.uid}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </label>

                        <label className="field">
                          <span>Estado</span>
                          <select
                            value={user.status}
                            onChange={(event) => {
                              try {
                              updateUserAdminFields(user.uid, { status: event.target.value as typeof user.status })
                              pushToast('Estado actualizado.', 'success')
                              } catch (error) {
                                pushToast(error instanceof Error ? error.message : 'No fue posible actualizar el estado.', 'danger')
                              }
                            }}
                          >
                            <option value="active">active</option>
                            <option value="suspended">suspended</option>
                          </select>
                        </label>
                      </div>
                    </article>
                  )
                })}

                {filteredUsers.length === 0 ? <p className="muted-text">No hay usuarios para el filtro actual.</p> : null}
              </div>
            </section>
          </section>

          <section className="stack">
            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Inbox interno reciente</h2>
                  <p>Te permite auditar que ya se generó la comunicación dentro de la app antes de pensar en push o correo.</p>
                </div>
              </div>
              <div className="request-list">
                {internalNotifications.length === 0 ? (
                  <p className="muted-text">Aún no creaste notificaciones internas.</p>
                ) : (
                  internalNotifications.slice(0, 8).map((notification) => (
                    <article key={notification.id} className="request-card">
                      <div className="feedback-item__header">
                        <div>
                          <strong>{notification.title}</strong>
                          <p>
                            {notification.userId} • {formatDateLabel(notification.createdAt)}
                          </p>
                        </div>
                        <span className="status-pill">{notification.status}</span>
                      </div>
                      <p>{notification.message}</p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Feedback</h2>
                  <p>Priorizá comentarios sobre actualización de perfil, UX, bugs y mejoras.</p>
                </div>
              </div>
              <div className="request-list">
                {feedbackQueue.length === 0 ? (
                  <p className="muted-text">Aún no hay feedback registrado.</p>
                ) : (
                  feedbackQueue.slice(0, 8).map((feedback) => (
                    <article key={feedback.id} className="request-card">
                      <div className="feedback-item__header">
                        <div>
                          <strong>{feedback.title}</strong>
                          <p>
                            {feedback.contactEmail} • {formatDateLabel(feedback.createdAt)}
                          </p>
                        </div>
                        <span className="status-pill">{feedback.status}</span>
                      </div>
                      <p>
                        {feedbackCategoryLabels[feedback.category]} • {feedbackProfileStatusLabels[feedback.profileStatus]}
                      </p>
                      <p>{feedback.message}</p>
                      <label className="field">
                        <span>Estado</span>
                        <select
                          value={feedback.status}
                          onChange={(event) => {
                            try {
                              updateFeedbackAdminStatus(feedback.id, event.target.value as typeof feedback.status)
                              pushToast('Estado del feedback actualizado.', 'success')
                            } catch (error) {
                              pushToast(error instanceof Error ? error.message : 'No fue posible actualizar el feedback.', 'danger')
                            }
                          }}
                        >
                          <option value="new">new</option>
                          <option value="reviewed">reviewed</option>
                          <option value="planned">planned</option>
                          <option value="closed">closed</option>
                        </select>
                      </label>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Reportes</h2>
                  <p>Revisá incidencias sobre contenido, suplantación o datos públicos problemáticos.</p>
                </div>
              </div>
              <div className="request-list">
                {reportsQueue.length === 0 ? (
                  <p className="muted-text">No hay reportes pendientes.</p>
                ) : (
                  reportsQueue.slice(0, 8).map((report) => (
                    <article key={report.id} className="request-card">
                      <div className="feedback-item__header">
                        <div>
                          <strong>{report.reason}</strong>
                          <p>{formatDateLabel(report.createdAt)}</p>
                        </div>
                        <span className="status-pill">{report.status}</span>
                      </div>
                      <p>{report.description || 'Sin descripcion adicional.'}</p>
                      <label className="field">
                        <span>Estado</span>
                        <select
                          value={report.status}
                          onChange={(event) => {
                            try {
                              updateReportAdminStatus(report.id, event.target.value as typeof report.status)
                              pushToast('Estado del reporte actualizado.', 'success')
                            } catch (error) {
                              pushToast(error instanceof Error ? error.message : 'No fue posible actualizar el reporte.', 'danger')
                            }
                          }}
                        >
                          <option value="pending">pending</option>
                          <option value="reviewed">reviewed</option>
                          <option value="dismissed">dismissed</option>
                        </select>
                      </label>
                    </article>
                  ))
                )}
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  )
}
