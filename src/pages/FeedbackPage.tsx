import { useMemo, useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import { feedbackCategoryLabels, feedbackProfileStatusLabels } from '../lib/constants'
import { defaultFeedbackFormValues, type FeedbackFormValues } from '../types/forms'
import { useToast } from '../hooks/useToast'
import { formatDateLabel } from '../lib/utils'

export function FeedbackPage() {
  const { currentUser, currentVenture, database, submitFeedback } = useAppData()
  const { pushToast } = useToast()
  const [values, setValues] = useState<FeedbackFormValues>(defaultFeedbackFormValues)

  const myFeedback = useMemo(
    () => database.feedbacks.filter((feedback) => feedback.userId === currentUser?.uid),
    [currentUser?.uid, database.feedbacks],
  )
  const contactEmailValue = values.contactEmail || currentUser?.email || ''

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Feedback</span>
          <h1>Ayudanos a mejorar Voseguime</h1>
          <p>
            Estamos aplicando actualizaciones en la app. Cuéntanos si ya terminaste de actualizar tus datos y qué deberíamos mejorar para que el flujo sea más claro.
          </p>
        </div>

        <div className="feedback-layout">
          <section className="panel">
            <div className="section-heading section-heading--stack">
              <div>
                <h2>Comparte tu feedback</h2>
                <p>Este espacio también nos sirve para saber si tu perfil ya está listo o si necesitas ayuda para dejarlo disponible.</p>
              </div>
            </div>

            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault()

                try {
                  submitFeedback(values)
                  pushToast('Feedback enviado. Gracias por ayudarnos a mejorar.', 'success')
                  setValues({
                    ...defaultFeedbackFormValues,
                    contactEmail: currentUser?.email ?? '',
                  })
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : 'No fue posible enviar tu feedback.', 'danger')
                }
              }}
            >
              <div className="form-grid">
                <label className="field field--full">
                  <span>Asunto</span>
                  <input
                    value={values.title}
                    onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Quiero actualizar mi perfil pero me falta..."
                  />
                </label>

                <label className="field">
                  <span>Tipo de feedback</span>
                  <select
                    value={values.category}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        category: event.target.value as FeedbackFormValues['category'],
                      }))
                    }
                  >
                    {Object.entries(feedbackCategoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Estado de tu perfil</span>
                  <select
                    value={values.profileStatus}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        profileStatus: event.target.value as FeedbackFormValues['profileStatus'],
                      }))
                    }
                  >
                    {Object.entries(feedbackProfileStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field--full">
                  <span>Mensaje</span>
                  <textarea
                    rows={6}
                    value={values.message}
                    onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
                    placeholder="Cuéntanos qué te ayudó, qué te frenó o qué cambiarías del flujo actual."
                  />
                </label>

                <label className="field">
                  <span>Correo de contacto</span>
                  <input
                    type="email"
                    value={contactEmailValue}
                    onChange={(event) => setValues((current) => ({ ...current, contactEmail: event.target.value }))}
                    placeholder="tu@correo.com"
                  />
                </label>

                <div className="feedback-meta-card">
                  <span>Perfil asociado</span>
                  <strong>{currentVenture?.name ?? 'Aun no has creado un emprendimiento'}</strong>
                  <small>Si todavía no terminas tu perfil, también nos sirve que lo reportes aquí.</small>
                </div>
              </div>

              <div className="button-row">
                <button className="button button--primary button--block" type="submit">
                  Enviar feedback
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="section-heading section-heading--stack">
              <div>
                <h2>Tus envíos recientes</h2>
                <p>Así confirmas que tu comentario quedó registrado mientras seguimos iterando el producto.</p>
              </div>
            </div>

            {myFeedback.length === 0 ? (
              <p className="muted-text">Todavía no has enviado feedback. Si estás actualizando tus datos o ves algo confuso, este es el mejor lugar para contarlo.</p>
            ) : (
              <div className="request-list">
                {myFeedback.slice(0, 5).map((feedback) => (
                  <article key={feedback.id} className="request-card">
                    <div className="feedback-item__header">
                      <div>
                        <strong>{feedback.title}</strong>
                        <p>
                          {feedbackCategoryLabels[feedback.category]} • {feedbackProfileStatusLabels[feedback.profileStatus]}
                        </p>
                      </div>
                      <span className="status-pill">{feedback.status}</span>
                    </div>
                    <p>{feedback.message}</p>
                    <small>
                      {formatDateLabel(feedback.createdAt)} • {feedback.contactEmail}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
