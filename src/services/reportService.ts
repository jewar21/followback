import type { AppDatabase } from '../types/models'

export function reportVenture(
  database: AppDatabase,
  params: {
    reporterUserId: string
    reportedVentureId: string
    reason: string
    description: string
  },
) {
  const next = structuredClone(database)
  const venture = next.ventures.find((item) => item.id === params.reportedVentureId)

  if (!venture) {
    throw new Error('El emprendimiento reportado no existe.')
  }

  next.reports.unshift({
    id: crypto.randomUUID(),
    reporterUserId: params.reporterUserId,
    reportedVentureId: params.reportedVentureId,
    reason: params.reason,
    description: params.description,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })

  venture.reputation.reportCount += 1
  venture.updatedAt = new Date().toISOString()

  return next
}
