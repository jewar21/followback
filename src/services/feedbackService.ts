import type { FeedbackFormValues } from '../types/forms'
import type { AppDatabase, Feedback, User, Venture } from '../types/models'

function cleanString(value: string) {
  return value.trim()
}

export function createFeedback(
  database: AppDatabase,
  params: {
    currentUser: User
    currentVenture: Venture | null
    values: FeedbackFormValues
  },
) {
  const title = cleanString(params.values.title)
  const message = cleanString(params.values.message)
  const contactEmail = cleanString(params.values.contactEmail || params.currentUser.email)

  if (!title) {
    throw new Error('Agrega un asunto breve para tu feedback.')
  }

  if (!message) {
    throw new Error('Describe tu comentario o mejora propuesta.')
  }

  if (!contactEmail) {
    throw new Error('Necesitamos un correo de contacto para darte seguimiento.')
  }

  const next = structuredClone(database)
  const timestamp = new Date().toISOString()

  const feedback: Feedback = {
    id: crypto.randomUUID(),
    userId: params.currentUser.uid,
    ventureId: params.currentVenture?.id,
    title,
    category: params.values.category,
    profileStatus: params.values.profileStatus,
    message,
    contactEmail,
    status: 'new',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  next.feedbacks.unshift(feedback)
  return { database: next, feedback }
}
