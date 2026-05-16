import type { AnalyticsEvent, AppDatabase, NetworkClick, SocialNetworkName } from '../types/models'

function pushEvent(database: AppDatabase, event: Omit<AnalyticsEvent, 'id' | 'createdAt'>) {
  database.analyticsEvents.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  })
}

export function trackProfileView(database: AppDatabase, ventureId: string, userId?: string) {
  const next = structuredClone(database)
  const venture = next.ventures.find((item) => item.id === ventureId)
  if (!venture) {
    return next
  }

  venture.metrics.profileViews += 1
  venture.updatedAt = new Date().toISOString()

  pushEvent(next, {
    type: 'profile_view',
    userId,
    ventureId,
  })

  return next
}

export function trackNetworkClick(
  database: AppDatabase,
  params: {
    ventureId: string
    userId?: string
    network: SocialNetworkName
    url: string
  },
) {
  const next = structuredClone(database)
  const venture = next.ventures.find((item) => item.id === params.ventureId)
  if (!venture) {
    return next
  }

  venture.metrics.linkClicks += 1
  venture.updatedAt = new Date().toISOString()

  const click: NetworkClick = {
    id: crypto.randomUUID(),
    ventureId: params.ventureId,
    clickedByUserId: params.userId,
    network: params.network,
    url: params.url,
    createdAt: new Date().toISOString(),
  }

  next.networkClicks.unshift(click)

  pushEvent(next, {
    type: 'network_click',
    userId: params.userId,
    ventureId: params.ventureId,
    metadata: {
      network: params.network,
      url: params.url,
    },
  })

  return next
}

export function appendFollowActionEvent(
  database: AppDatabase,
  params: {
    type: 'follow_action_created' | 'follow_action_reciprocated'
    userId?: string
    ventureId?: string
    metadata?: Record<string, unknown>
  },
) {
  const next = structuredClone(database)
  pushEvent(next, params)
  return next
}

export function appendFavoriteEvent(database: AppDatabase, userId: string, ventureId: string) {
  const next = structuredClone(database)
  pushEvent(next, {
    type: 'favorite_created',
    userId,
    ventureId,
  })
  return next
}
