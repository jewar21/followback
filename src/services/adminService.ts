import type { AppDatabase, Feedback, Report, UserRole, UserStatus } from '../types/models'

export function updateUserAdminFields(
  database: AppDatabase,
  params: {
    userId: string
    actorUserId: string
    role?: UserRole
    status?: UserStatus
  },
) {
  const next = structuredClone(database)
  const actor = next.users.find((user) => user.uid === params.actorUserId)

  if (!actor || actor.role !== 'admin') {
    throw new Error('Solo un admin puede actualizar usuarios.')
  }

  const target = next.users.find((user) => user.uid === params.userId)
  if (!target) {
    throw new Error('El usuario no existe.')
  }

  if (params.userId === params.actorUserId && params.role === 'user') {
    throw new Error('No podés quitarte el rol admin desde este panel.')
  }

  if (params.role) {
    target.role = params.role
  }

  if (params.status) {
    target.status = params.status
  }

  target.updatedAt = new Date().toISOString()
  return target
}

export function updateFeedbackAdminStatus(
  database: AppDatabase,
  params: {
    feedbackId: string
    actorUserId: string
    status: Feedback['status']
  },
) {
  const next = structuredClone(database)
  const actor = next.users.find((user) => user.uid === params.actorUserId)

  if (!actor || actor.role !== 'admin') {
    throw new Error('Solo un admin puede gestionar feedback.')
  }

  const target = next.feedbacks.find((feedback) => feedback.id === params.feedbackId)
  if (!target) {
    throw new Error('El feedback no existe.')
  }

  target.status = params.status
  target.updatedAt = new Date().toISOString()
  return target
}

export function updateReportAdminStatus(
  database: AppDatabase,
  params: {
    reportId: string
    actorUserId: string
    status: Report['status']
  },
) {
  const next = structuredClone(database)
  const actor = next.users.find((user) => user.uid === params.actorUserId)

  if (!actor || actor.role !== 'admin') {
    throw new Error('Solo un admin puede gestionar reportes.')
  }

  const target = next.reports.find((report) => report.id === params.reportId)
  if (!target) {
    throw new Error('El reporte no existe.')
  }

  target.status = params.status
  return target
}
