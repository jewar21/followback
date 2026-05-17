import { Copy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import { sendAdminCampaignEmail, type AdminCampaignAudience } from '../services/adminEmailService'
import { feedbackCategoryLabels, feedbackProfileStatusLabels } from '../lib/constants'
import { formatDateLabel } from '../lib/utils'
import { useToast } from '../hooks/useToast'

export function AdminPage() {
  const {
    currentUser,
    database,
    updateUserAdminFields,
    updateFeedbackAdminStatus,
    updateReportAdminStatus,
  } = useAppData()
  const { pushToast } = useToast()
  const [campaignSubject, setCampaignSubject] = useState('Actualiza tu perfil en FollowBack y cuentanos como mejorar')
  const [campaignBody, setCampaignBody] = useState(
    [
      'Hola,',
      '',
      'Estamos aplicando mejoras en FollowBack para que los perfiles sean mas faciles de completar, explorar y mantener actualizados.',
      '',
      'Te pedimos por favor entrar de nuevo, revisar tu informacion y completar tu emprendimiento para dejarlo disponible con mejores datos para la comunidad.',
      '',
      'Tambien abrimos una seccion de Feedback dentro de la app para que nos cuentes si ya terminaste de actualizar tus datos, si encontraste algun bloqueo o que mejoras te gustaria ver.',
      '',
      'Gracias por ayudarnos a mejorar FollowBack.',
    ].join('\n'),
  )
  const [campaignAudience, setCampaignAudience] = useState<AdminCampaignAudience>('pending_onboarding')

  const venturesByOwnerId = useMemo(
    () => new Map(database.ventures.map((venture) => [venture.ownerId, venture])),
    [database.ventures],
  )

  const authenticatedUsers = useMemo(
    () => [...database.users].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)),
    [database.users],
  )

  const feedbackQueue = useMemo(
    () => [...database.feedbacks].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [database.feedbacks],
  )

  const reportsQueue = useMemo(
    () => [...database.reports].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [database.reports],
  )

  const contactEmails = authenticatedUsers.map((user) => user.email).filter(Boolean)
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
          <p>Controla usuarios autenticados, revisa onboarding, centraliza feedback y atiende reportes sin entrar a Firestore manualmente.</p>
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
            <strong>Contactos disponibles</strong>
            <p className="muted-text">Aqui puedes tomar los correos de usuarios autenticados para enviar actualizaciones, recordatorios o solicitudes de feedback.</p>
          </div>
          <button className="button button--ghost" onClick={() => void copyEmails()}>
            <Copy size={16} />
            Copiar correos
          </button>
        </section>

        <section className="panel">
          <div className="section-heading section-heading--stack">
            <div>
              <h2>Campana de correo</h2>
              <p>Envia un mensaje directo desde el dashboard a usuarios autenticados y segmenta por avance de onboarding.</p>
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
                    audience: campaignAudience,
                  })
                  pushToast(`Campana enviada a ${result.recipientCount} usuarios.`, 'success')
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : 'No fue posible enviar la campana.', 'danger')
                }
              })()
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>Audiencia</span>
                <select
                  value={campaignAudience}
                  onChange={(event) => setCampaignAudience(event.target.value as AdminCampaignAudience)}
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
                <small>El backend valida nuevamente la audiencia antes de enviar.</small>
              </div>

              <label className="field field--full">
                <span>Asunto</span>
                <input value={campaignSubject} onChange={(event) => setCampaignSubject(event.target.value)} />
              </label>

              <label className="field field--full">
                <span>Mensaje</span>
                <textarea rows={10} value={campaignBody} onChange={(event) => setCampaignBody(event.target.value)} />
              </label>
            </div>

            <div className="button-row">
              <button className="button button--primary" type="submit">
                Enviar campana
              </button>
            </div>
          </form>
        </section>

        <div className="admin-layout">
          <section className="panel">
            <div className="section-heading section-heading--stack">
              <div>
                <h2>Usuarios</h2>
                <p>Administra rol, estado y visibilidad de quienes ya iniciaron sesion.</p>
              </div>
            </div>
            <div className="request-list">
              {authenticatedUsers.map((user) => {
                const venture = venturesByOwnerId.get(user.uid)

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
            </div>
          </section>

          <section className="stack">
            <section className="panel">
              <div className="section-heading section-heading--stack">
                <div>
                  <h2>Feedback</h2>
                  <p>Prioriza comentarios sobre actualizacion de perfil, UX, bugs y mejoras.</p>
                </div>
              </div>
              <div className="request-list">
                {feedbackQueue.length === 0 ? (
                  <p className="muted-text">Aun no hay feedback registrado.</p>
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
                  <p>Revisa incidencias sobre contenido, suplantacion o datos publicos problematicos.</p>
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
