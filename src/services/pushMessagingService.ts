import type { MessagePayload } from 'firebase/messaging'
import { getFirebaseApp, isFirebaseAvailable } from '../lib/firebase'
import { firebaseEnv } from '../lib/env'
import type { PushSubscriptionRecord } from '../types/models'

function createBaseRecord(userId: string): Omit<PushSubscriptionRecord, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    platform: 'web',
    permission: typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
    status: 'pending',
    userAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
  }
}

export async function isPushMessagingSupported() {
  if (typeof window === 'undefined') {
    return false
  }

  if (!isFirebaseAvailable || !firebaseEnv.vapidKey) {
    return false
  }

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return false
  }

  const { isSupported } = await import('firebase/messaging')
  return isSupported()
}

export async function syncPushSubscription(userId: string): Promise<PushSubscriptionRecord> {
  const timestamp = new Date().toISOString()
  const baseRecord = createBaseRecord(userId)
  const subscriptionId = `${userId}-web`
  const firebaseApp = isFirebaseAvailable ? await getFirebaseApp().catch(() => null) : null

  if (!(await isPushMessagingSupported()) || !firebaseApp) {
    return {
      id: subscriptionId,
      ...baseRecord,
      permission: 'unsupported',
      status: 'unsupported',
      createdAt: timestamp,
      updatedAt: timestamp,
      lastError: firebaseEnv.vapidKey ? 'Push web no disponible en este navegador o entorno.' : 'Falta VITE_FIREBASE_VAPID_KEY.',
    }
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    return {
      id: subscriptionId,
      ...baseRecord,
      permission,
      status: permission === 'denied' ? 'blocked' : 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
      lastError: permission === 'denied' ? 'El usuario bloqueo las notificaciones.' : undefined,
    }
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(firebaseApp)
    const token = await getToken(messaging, {
      vapidKey: firebaseEnv.vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (!token) {
      return {
        id: subscriptionId,
        ...baseRecord,
        permission,
        status: 'error',
        createdAt: timestamp,
        updatedAt: timestamp,
        lastError: 'No fue posible obtener el token de FCM.',
      }
    }

    return {
      id: subscriptionId,
      ...baseRecord,
      permission,
      status: 'enabled',
      token,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastTokenAt: timestamp,
    }
  } catch (error) {
    return {
      id: subscriptionId,
      ...baseRecord,
      permission,
      status: 'error',
      createdAt: timestamp,
      updatedAt: timestamp,
      lastError: error instanceof Error ? error.message : 'No fue posible configurar las notificaciones push.',
    }
  }
}

export async function subscribeToForegroundMessages(
  callback: (payload: MessagePayload) => void,
): Promise<(() => void) | undefined> {
  const firebaseApp = isFirebaseAvailable ? await getFirebaseApp().catch(() => null) : null

  if (!(await isPushMessagingSupported()) || !firebaseApp) {
    return undefined
  }

  const { getMessaging, onMessage } = await import('firebase/messaging')
  const messaging = getMessaging(firebaseApp)
  return onMessage(messaging, callback)
}
