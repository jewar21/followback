import type {
  AnnouncementAudience,
  AppDatabase,
  AppNotification,
  PushSubscriptionRecord,
  User,
} from '../types/models'

function isAudienceMatch(
  user: User,
  audience: AnnouncementAudience,
  venturesByOwnerId: Set<string>,
) {
  if (user.status !== 'active') {
    return false
  }

  if (audience === 'all_active') {
    return true
  }

  if (audience === 'completed_onboarding') {
    return user.onboardingCompleted === true
  }

  if (audience === 'without_venture') {
    return !venturesByOwnerId.has(user.uid)
  }

  return user.onboardingCompleted !== true
}

export function createAdminNotifications(
  database: AppDatabase,
  params: {
    actorUserId: string
    title: string
    message: string
    audience: AnnouncementAudience
    ctaUrl?: string
  },
) {
  const next = structuredClone(database)
  const actor = next.users.find((user) => user.uid === params.actorUserId)

  if (!actor || actor.role !== 'admin') {
    throw new Error('Solo un admin puede enviar notificaciones.')
  }

  const venturesByOwnerId = new Set(next.ventures.map((venture) => venture.ownerId))
  const recipients = next.users.filter((user) => isAudienceMatch(user, params.audience, venturesByOwnerId))

  if (recipients.length === 0) {
    throw new Error('No hay usuarios para esa audiencia.')
  }

  const timestamp = new Date().toISOString()
  const notifications = recipients.map(
    (user) =>
      ({
        id: crypto.randomUUID(),
        userId: user.uid,
        title: params.title.trim(),
        message: params.message.trim(),
        kind: 'announcement',
        channel: 'in_app',
        audience: params.audience,
        ctaUrl: params.ctaUrl?.trim() || undefined,
        createdBy: params.actorUserId,
        status: 'unread',
        createdAt: timestamp,
        updatedAt: timestamp,
      }) satisfies AppNotification,
  )

  next.notifications = [...notifications, ...next.notifications]

  return {
    database: next,
    notifications,
  }
}

export function markNotificationRead(
  database: AppDatabase,
  params: {
    notificationId: string
    userId: string
  },
) {
  const next = structuredClone(database)
  const notification = next.notifications.find((item) => item.id === params.notificationId)

  if (!notification || notification.userId !== params.userId) {
    throw new Error('La notificacion no existe para este usuario.')
  }

  if (notification.status === 'read') {
    return notification
  }

  const timestamp = new Date().toISOString()
  notification.status = 'read'
  notification.readAt = timestamp
  notification.updatedAt = timestamp
  return notification
}

export function markAllNotificationsRead(database: AppDatabase, userId: string) {
  const next = structuredClone(database)
  const timestamp = new Date().toISOString()
  const updated = next.notifications.filter((notification) => notification.userId === userId && notification.status !== 'read')

  for (const notification of updated) {
    notification.status = 'read'
    notification.readAt = timestamp
    notification.updatedAt = timestamp
  }

  return {
    database: next,
    updated,
  }
}

export function createNotificationFromPushPayload(
  database: AppDatabase,
  params: {
    userId: string
    title: string
    message: string
    ctaUrl?: string
  },
) {
  const next = structuredClone(database)
  const timestamp = new Date().toISOString()
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    userId: params.userId,
    title: params.title.trim(),
    message: params.message.trim(),
    kind: 'system',
    channel: 'push',
    ctaUrl: params.ctaUrl?.trim() || undefined,
    status: 'unread',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  next.notifications.unshift(notification)
  return {
    database: next,
    notification,
  }
}

export function upsertPushSubscriptionRecord(database: AppDatabase, incoming: PushSubscriptionRecord) {
  const next = structuredClone(database)
  const index = next.pushSubscriptions.findIndex((item) => item.id === incoming.id)

  if (index === -1) {
    next.pushSubscriptions.unshift(incoming)
    return next
  }

  next.pushSubscriptions[index] = {
    ...next.pushSubscriptions[index],
    ...incoming,
    updatedAt: incoming.updatedAt,
  }

  return next
}
