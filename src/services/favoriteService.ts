import { appendFavoriteEvent } from './analyticsService'
import type { AppDatabase } from '../types/models'

export function toggleFavorite(database: AppDatabase, userId: string, ventureId: string) {
  const next = structuredClone(database)
  const venture = next.ventures.find((item) => item.id === ventureId)
  if (!venture) {
    return next
  }

  const existingIndex = next.favorites.findIndex(
    (favorite) => favorite.userId === userId && favorite.ventureId === ventureId,
  )

  if (existingIndex >= 0) {
    next.favorites.splice(existingIndex, 1)
    venture.metrics.favoriteCount = Math.max(0, venture.metrics.favoriteCount - 1)
    return next
  }

  next.favorites.unshift({
    id: crypto.randomUUID(),
    userId,
    ventureId,
    createdAt: new Date().toISOString(),
  })
  venture.metrics.favoriteCount += 1

  return appendFavoriteEvent(next, userId, ventureId)
}
