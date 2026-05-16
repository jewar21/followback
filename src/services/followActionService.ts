import { appendFollowActionEvent } from './analyticsService'
import { followableNetworks } from '../lib/constants'
import type { AppDatabase, FollowActionStatus, SocialNetworkName, User, Venture } from '../types/models'

type FollowableNetwork = Extract<
  SocialNetworkName,
  'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'spotify' | 'x' | 'linkedin' | 'website' | 'whatsapp'
>

export function createFollowAction(
  database: AppDatabase,
  params: {
    currentUser: User
    currentVenture: Venture
    targetVenture: Venture
    network: FollowableNetwork
    note?: string
  },
) {
  if (!followableNetworks.includes(params.network)) {
    throw new Error('La red elegida no puede recibir acciones FollowBack.')
  }

  if (params.currentVenture.id === params.targetVenture.id) {
    throw new Error('No puedes marcar como seguido tu propio emprendimiento.')
  }

  if (!params.targetVenture.socialLinks[params.network]) {
    throw new Error('El emprendimiento no tiene esa red disponible.')
  }

  const duplicated = database.followActions.find(
    (action) =>
      action.fromUserId === params.currentUser.uid &&
      action.toVentureId === params.targetVenture.id &&
      action.network === params.network &&
      action.status === 'pending',
  )

  if (duplicated) {
    throw new Error('Ya tienes una solicitud pendiente en esa red.')
  }

  const next = structuredClone(database)
  const fromVenture = next.ventures.find((venture) => venture.id === params.currentVenture.id)
  const toVenture = next.ventures.find((venture) => venture.id === params.targetVenture.id)

  if (!fromVenture || !toVenture) {
    throw new Error('No fue posible crear la accion.')
  }

  fromVenture.metrics.followersGiven += 1
  toVenture.metrics.followersReceived += 1
  fromVenture.updatedAt = new Date().toISOString()
  toVenture.updatedAt = new Date().toISOString()

  next.followActions.unshift({
    id: crypto.randomUUID(),
    fromUserId: params.currentUser.uid,
    fromVentureId: params.currentVenture.id,
    toUserId: params.targetVenture.ownerId,
    toVentureId: params.targetVenture.id,
    network: params.network,
    status: 'pending',
    note: params.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return appendFollowActionEvent(next, {
    type: 'follow_action_created',
    userId: params.currentUser.uid,
    ventureId: params.targetVenture.id,
    metadata: {
      network: params.network,
      fromVentureId: params.currentVenture.id,
    },
  })
}

export function updateFollowActionStatus(
  database: AppDatabase,
  params: {
    actionId: string
    actorUserId: string
    status: Extract<FollowActionStatus, 'reciprocated' | 'rejected' | 'cancelled'>
  },
) {
  const next = structuredClone(database)
  const action = next.followActions.find((item) => item.id === params.actionId)
  if (!action) {
    throw new Error('La solicitud no existe.')
  }

  if (action.status !== 'pending') {
    throw new Error('Solo las solicitudes pendientes pueden cambiar de estado.')
  }

  if (params.status === 'cancelled' && action.fromUserId !== params.actorUserId) {
    throw new Error('Solo el emisor puede cancelar esta solicitud.')
  }

  if (
    (params.status === 'reciprocated' || params.status === 'rejected') &&
    action.toUserId !== params.actorUserId
  ) {
    throw new Error('Solo el receptor puede responder esta solicitud.')
  }

  action.status = params.status
  action.updatedAt = new Date().toISOString()

  if (params.status === 'reciprocated') {
    const fromVenture = next.ventures.find((venture) => venture.id === action.fromVentureId)
    const toVenture = next.ventures.find((venture) => venture.id === action.toVentureId)

    if (fromVenture) {
      fromVenture.metrics.reciprocatedCount += 1
      fromVenture.updatedAt = new Date().toISOString()
    }

    if (toVenture) {
      toVenture.metrics.reciprocatedCount += 1
      toVenture.updatedAt = new Date().toISOString()
    }

    return appendFollowActionEvent(next, {
      type: 'follow_action_reciprocated',
      userId: params.actorUserId,
      ventureId: action.toVentureId,
      metadata: {
        actionId: action.id,
        network: action.network,
      },
    })
  }

  return next
}
