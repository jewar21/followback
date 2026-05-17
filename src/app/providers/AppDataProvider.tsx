import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LoadingState } from '../../components/LoadingState'
import { useAuth } from '../../hooks/useAuth'
import { loadDatabase, saveDatabase } from '../../lib/storage'
import { updateFeedbackAdminStatus, updateReportAdminStatus, updateUserAdminFields } from '../../services/adminService'
import { trackNetworkClick, trackProfileView } from '../../services/analyticsService'
import { createFeedback } from '../../services/feedbackService'
import { toggleFavorite } from '../../services/favoriteService'
import {
  deleteFirestoreFavorite,
  upsertFirestoreFeedback,
  loadDatabaseFromFirestore,
  upsertFirestoreAnalyticsEvent,
  upsertFirestoreFavorite,
  upsertFirestoreFollowAction,
  upsertFirestoreNetworkClick,
  upsertFirestoreNotification,
  upsertFirestorePushSubscription,
  upsertFirestoreReport,
  upsertFirestoreUser,
  upsertFirestoreVenture,
} from '../../services/firestoreDatabaseService'
import { createFollowAction, updateFollowActionStatus } from '../../services/followActionService'
import {
  createAdminNotifications,
  createNotificationFromPushPayload,
  markAllNotificationsRead,
  markNotificationRead,
  upsertPushSubscriptionRecord,
} from '../../services/notificationService'
import { subscribeToForegroundMessages } from '../../services/pushMessagingService'
import { reportVenture } from '../../services/reportService'
import { upsertUser } from '../../services/userService'
import {
  createVenture as createVentureRecord,
  getCurrentUserVenture,
  getPublishedVentures,
  getVentureBySlug,
  updateVenture as updateVentureRecord,
} from '../../services/ventureService'
import type { FeedbackFormValues, VentureFormValues } from '../../types/forms'
import type {
  AnnouncementAudience,
  AppDatabase,
  AppNotification,
  Feedback,
  FollowActionStatus,
  PushSubscriptionRecord,
  Report,
  SocialNetworkName,
  User,
  UserRole,
  UserStatus,
  Venture,
} from '../../types/models'

type AppDataContextValue = {
  database: AppDatabase
  currentUser: User | null
  currentVenture: Venture | null
  publishedVentures: Venture[]
  getVentureBySlug: (slug: string) => Venture | null
  createVenture: (values: VentureFormValues) => Venture
  updateVenture: (ventureId: string, values: VentureFormValues) => Venture
  toggleFavorite: (ventureId: string) => void
  createFollowAction: (
    targetVenture: Venture,
    network: Extract<
      SocialNetworkName,
      'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'spotify' | 'x' | 'linkedin' | 'website' | 'whatsapp'
    >,
  ) => void
  updateFollowActionStatus: (
    actionId: string,
    status: Extract<FollowActionStatus, 'reciprocated' | 'rejected' | 'cancelled'>,
  ) => void
  trackNetworkClick: (ventureId: string, network: SocialNetworkName, url: string) => void
  trackProfileView: (ventureId: string) => void
  reportVenture: (ventureId: string, reason: string, description: string) => void
  submitFeedback: (values: FeedbackFormValues) => void
  updateUserAdminFields: (userId: string, updates: { role?: UserRole; status?: UserStatus }) => void
  updateFeedbackAdminStatus: (feedbackId: string, status: Feedback['status']) => void
  updateReportAdminStatus: (reportId: string, status: Report['status']) => void
  sendAdminNotification: (payload: {
    title: string
    message: string
    audience: AnnouncementAudience
    ctaUrl?: string
  }) => number
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  savePushSubscription: (subscription: PushSubscriptionRecord) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, loading: authLoading, firebaseEnabled } = useAuth()
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabase())
  const [loading, setLoading] = useState(firebaseEnabled)

  useEffect(() => {
    saveDatabase(database)
  }, [database])

  useEffect(() => {
    if (!firebaseEnabled) {
      return
    }

    if (authLoading) {
      return
    }

    let cancelled = false

    async function hydrate() {
      setLoading(true)

      try {
        const localDatabase = loadDatabase()
        let nextDatabase = await loadDatabaseFromFirestore(authUser)

        if (authUser) {
          const localUser = localDatabase.users.find((user) => user.uid === authUser.uid)
          const localVenture = getCurrentUserVenture(localDatabase, authUser.uid)
          const hasRemoteVenture = nextDatabase.ventures.some((venture) => venture.ownerId === authUser.uid)

          if (localUser && !nextDatabase.users.some((user) => user.uid === authUser.uid)) {
            nextDatabase = upsertUser(nextDatabase, localUser)
          }

          if (localVenture && !hasRemoteVenture) {
            nextDatabase = {
              ...nextDatabase,
              ventures: [localVenture, ...nextDatabase.ventures.filter((venture) => venture.id !== localVenture.id)],
            }
          }
        }

        if (cancelled) {
          return
        }

        setDatabase(nextDatabase)

        if (authUser) {
          const persistedUser = nextDatabase.users.find((user) => user.uid === authUser.uid) ?? authUser
          const persistedVenture = getCurrentUserVenture(nextDatabase, authUser.uid)

          await upsertFirestoreUser(persistedUser)

          if (persistedVenture) {
            await upsertFirestoreVenture(persistedVenture)
          }
        }
      } catch (error) {
        console.error('No fue posible cargar datos desde Firestore.', error)

        if (!cancelled) {
          setDatabase(loadDatabase())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [authLoading, authUser, firebaseEnabled])

  const currentUser = authUser
    ? database.users.find((user) => user.uid === authUser.uid) ?? authUser
    : null

  const currentVenture = getCurrentUserVenture(database, currentUser?.uid)
  const publishedVentures = getPublishedVentures(database)

  useEffect(() => {
    if (!firebaseEnabled || !currentUser) {
      return undefined
    }

    let cancelled = false

    const unsubscribePromise = subscribeToForegroundMessages((payload) => {
      if (cancelled) {
        return
      }

      const title = payload.notification?.title ?? payload.data?.title
      const message = payload.notification?.body ?? payload.data?.body
      const ctaUrl = payload.data?.ctaUrl

      if (!title || !message) {
        return
      }

      setDatabase((current) => {
        const result = createNotificationFromPushPayload(current, {
          userId: currentUser.uid,
          title,
          message,
          ctaUrl,
        })

        void upsertFirestoreNotification(result.notification).catch((error) => {
          console.error('No fue posible guardar la notificacion push en Firestore.', error)
        })

        return result.database
      })
    })

    return () => {
      cancelled = true
      void unsubscribePromise.then((unsubscribe) => {
        unsubscribe?.()
      })
    }
  }, [currentUser, firebaseEnabled])

  function requireUser() {
    if (!currentUser) {
      throw new Error('Debes iniciar sesion para realizar esta accion.')
    }

    return currentUser
  }

  function createVenture(values: VentureFormValues) {
    const user = requireUser()
    const result = createVentureRecord(upsertUser(database, user), user, values)
    setDatabase(result.database)

    if (firebaseEnabled) {
      const persistedUser = result.database.users.find((item) => item.uid === user.uid) ?? user
      void Promise.all([upsertFirestoreUser(persistedUser), upsertFirestoreVenture(result.venture)]).catch((error) => {
        console.error('No fue posible sincronizar el emprendimiento con Firestore.', error)
      })
    }

    return result.venture
  }

  function updateVenture(ventureId: string, values: VentureFormValues) {
    const venture = updateVentureRecord(database, ventureId, values)
    setDatabase((current) => {
      const next = structuredClone(current)
      const index = next.ventures.findIndex((item) => item.id === venture.id)
      next.ventures[index] = venture
      return next
    })

    if (firebaseEnabled) {
      void upsertFirestoreVenture(venture).catch((error) => {
        console.error('No fue posible actualizar el emprendimiento en Firestore.', error)
      })
    }

    return venture
  }

  function handleToggleFavorite(ventureId: string) {
    const user = requireUser()
    setDatabase((current) => {
      const next = toggleFavorite(current, user.uid, ventureId)

      if (firebaseEnabled) {
        const previousFavorite = current.favorites.find(
          (favorite) => favorite.userId === user.uid && favorite.ventureId === ventureId,
        )
        const nextFavorite = next.favorites.find(
          (favorite) => favorite.userId === user.uid && favorite.ventureId === ventureId,
        )
        const updatedVenture = next.ventures.find((venture) => venture.id === ventureId)

        void (async () => {
          try {
            if (previousFavorite && !nextFavorite) {
              await deleteFirestoreFavorite(previousFavorite.id)
            }

            if (nextFavorite) {
              await upsertFirestoreFavorite(nextFavorite)
            }

            if (updatedVenture) {
              await upsertFirestoreVenture(updatedVenture)
            }
          } catch (error) {
            console.error('No fue posible sincronizar favoritos con Firestore.', error)
          }
        })()
      }

      return next
    })
  }

  function handleCreateFollowAction(
    targetVenture: Venture,
    network: Extract<
      SocialNetworkName,
      'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'spotify' | 'x' | 'linkedin' | 'website' | 'whatsapp'
    >,
  ) {
    const user = requireUser()

    if (!currentVenture) {
      throw new Error('Completa tu emprendimiento antes de usar FollowBack.')
    }

    setDatabase((current) => {
      const next = createFollowAction(current, {
        currentUser: user,
        currentVenture,
        targetVenture,
        network,
      })

      if (firebaseEnabled) {
        const action = next.followActions[0]
        const fromVenture = next.ventures.find((venture) => venture.id === currentVenture.id)
        const toVenture = next.ventures.find((venture) => venture.id === targetVenture.id)
        const analyticsEvent = next.analyticsEvents[0]

        void (async () => {
          try {
            await Promise.all([
              upsertFirestoreFollowAction(action),
              fromVenture ? upsertFirestoreVenture(fromVenture) : Promise.resolve(),
              toVenture ? upsertFirestoreVenture(toVenture) : Promise.resolve(),
              analyticsEvent ? upsertFirestoreAnalyticsEvent(analyticsEvent) : Promise.resolve(),
            ])
          } catch (error) {
            console.error('No fue posible sincronizar la solicitud FollowBack con Firestore.', error)
          }
        })()
      }

      return next
    })
  }

  function handleUpdateFollowActionStatus(
    actionId: string,
    status: Extract<FollowActionStatus, 'reciprocated' | 'rejected' | 'cancelled'>,
  ) {
    const user = requireUser()
    setDatabase((current) => {
      const next = updateFollowActionStatus(current, {
        actionId,
        actorUserId: user.uid,
        status,
      })

      if (firebaseEnabled) {
        const updatedAction = next.followActions.find((item) => item.id === actionId)
        const currentAction = current.followActions.find((item) => item.id === actionId)
        const shouldSyncVentureMetrics = currentAction?.status !== updatedAction?.status && status === 'reciprocated'

        void (async () => {
          try {
            await Promise.all([
              updatedAction ? upsertFirestoreFollowAction(updatedAction) : Promise.resolve(),
              shouldSyncVentureMetrics && updatedAction
                ? Promise.all(
                    next.ventures
                      .filter(
                        (venture) =>
                          venture.id === updatedAction.fromVentureId || venture.id === updatedAction.toVentureId,
                      )
                      .map((venture) => upsertFirestoreVenture(venture)),
                  )
                : Promise.resolve(),
              next.analyticsEvents[0] && status === 'reciprocated'
                ? upsertFirestoreAnalyticsEvent(next.analyticsEvents[0])
                : Promise.resolve(),
            ])
          } catch (error) {
            console.error('No fue posible actualizar la solicitud FollowBack en Firestore.', error)
          }
        })()
      }

      return next
    })
  }

  function handleTrackNetworkClick(ventureId: string, network: SocialNetworkName, url: string) {
    setDatabase((current) => {
      const next = trackNetworkClick(current, {
        ventureId,
        userId: currentUser?.uid,
        network,
        url,
      })

      if (firebaseEnabled) {
        const updatedVenture = next.ventures.find((venture) => venture.id === ventureId)
        const click = next.networkClicks[0]
        const analyticsEvent = next.analyticsEvents[0]

        void (async () => {
          try {
            await Promise.all([
              updatedVenture ? upsertFirestoreVenture(updatedVenture) : Promise.resolve(),
              click ? upsertFirestoreNetworkClick(click) : Promise.resolve(),
              analyticsEvent ? upsertFirestoreAnalyticsEvent(analyticsEvent) : Promise.resolve(),
            ])
          } catch (error) {
            console.error('No fue posible registrar el click en Firestore.', error)
          }
        })()
      }

      return next
    })
  }

  function handleTrackProfileView(ventureId: string) {
    setDatabase((current) => {
      const next = trackProfileView(current, ventureId, currentUser?.uid)

      if (firebaseEnabled) {
        const updatedVenture = next.ventures.find((venture) => venture.id === ventureId)
        const analyticsEvent = next.analyticsEvents[0]

        void (async () => {
          try {
            await Promise.all([
              updatedVenture ? upsertFirestoreVenture(updatedVenture) : Promise.resolve(),
              analyticsEvent ? upsertFirestoreAnalyticsEvent(analyticsEvent) : Promise.resolve(),
            ])
          } catch (error) {
            console.error('No fue posible registrar la visita en Firestore.', error)
          }
        })()
      }

      return next
    })
  }

  function handleReportVenture(ventureId: string, reason: string, description: string) {
    const user = requireUser()
    setDatabase((current) => {
      const next = reportVenture(current, {
        reporterUserId: user.uid,
        reportedVentureId: ventureId,
        reason,
        description,
      })

      if (firebaseEnabled) {
        const latestReport = next.reports[0]
        void upsertFirestoreReport(latestReport).catch((error) => {
          console.error('No fue posible registrar el reporte en Firestore.', error)
        })
      }

      return next
    })
  }

  function handleSubmitFeedback(values: FeedbackFormValues) {
    const user = requireUser()
    const result = createFeedback(database, {
      currentUser: user,
      currentVenture,
      values,
    })
    setDatabase(result.database)

    if (firebaseEnabled) {
      void upsertFirestoreFeedback(result.feedback).catch((error) => {
        console.error('No fue posible registrar el feedback en Firestore.', error)
      })
    }
  }

  function handleUpdateUserAdminFields(userId: string, updates: { role?: UserRole; status?: UserStatus }) {
    const user = requireUser()
    const updatedUser = updateUserAdminFields(database, {
      userId,
      actorUserId: user.uid,
      ...updates,
    })

    setDatabase((current) => {
      const next = structuredClone(current)
      const index = next.users.findIndex((item) => item.uid === updatedUser.uid)
      next.users[index] = updatedUser
      return next
    })

    if (firebaseEnabled) {
      void upsertFirestoreUser(updatedUser).catch((error) => {
        console.error('No fue posible actualizar el usuario en Firestore.', error)
      })
    }
  }

  function handleUpdateFeedbackAdminStatus(feedbackId: string, status: Feedback['status']) {
    const user = requireUser()
    const updatedFeedback = updateFeedbackAdminStatus(database, {
      feedbackId,
      actorUserId: user.uid,
      status,
    })

    setDatabase((current) => {
      const next = structuredClone(current)
      const index = next.feedbacks.findIndex((item) => item.id === updatedFeedback.id)
      next.feedbacks[index] = updatedFeedback
      return next
    })

    if (firebaseEnabled) {
      void upsertFirestoreFeedback(updatedFeedback).catch((error) => {
        console.error('No fue posible actualizar el feedback en Firestore.', error)
      })
    }
  }

  function handleUpdateReportAdminStatus(reportId: string, status: Report['status']) {
    const user = requireUser()
    const updatedReport = updateReportAdminStatus(database, {
      reportId,
      actorUserId: user.uid,
      status,
    })

    setDatabase((current) => {
      const next = structuredClone(current)
      const index = next.reports.findIndex((item) => item.id === updatedReport.id)
      next.reports[index] = updatedReport
      return next
    })

    if (firebaseEnabled) {
      void upsertFirestoreReport(updatedReport).catch((error) => {
        console.error('No fue posible actualizar el reporte en Firestore.', error)
      })
    }
  }

  function handleSendAdminNotification(payload: {
    title: string
    message: string
    audience: AnnouncementAudience
    ctaUrl?: string
  }) {
    const user = requireUser()
    const result = createAdminNotifications(database, {
      actorUserId: user.uid,
      ...payload,
    })

    setDatabase(result.database)

    if (firebaseEnabled) {
      void Promise.all(result.notifications.map((notification) => upsertFirestoreNotification(notification))).catch((error) => {
        console.error('No fue posible guardar la campana interna en Firestore.', error)
      })
    }

    return result.notifications.length
  }

  function handleMarkNotificationRead(notificationId: string) {
    const user = requireUser()
    const updatedNotification = markNotificationRead(database, {
      notificationId,
      userId: user.uid,
    })

    setDatabase((current) => {
      const next = structuredClone(current)
      const index = next.notifications.findIndex((item) => item.id === updatedNotification.id)
      if (index !== -1) {
        next.notifications[index] = updatedNotification
      }
      return next
    })

    if (firebaseEnabled) {
      void upsertFirestoreNotification(updatedNotification).catch((error) => {
        console.error('No fue posible actualizar la notificacion en Firestore.', error)
      })
    }
  }

  function handleMarkAllNotificationsRead() {
    const user = requireUser()
    const result = markAllNotificationsRead(database, user.uid)
    setDatabase(result.database)

    if (firebaseEnabled && result.updated.length > 0) {
      void Promise.all(result.updated.map((notification) => upsertFirestoreNotification(notification))).catch((error) => {
        console.error('No fue posible marcar todas las notificaciones como leidas en Firestore.', error)
      })
    }
  }

  function handleSavePushSubscription(subscription: PushSubscriptionRecord) {
    const user = requireUser()

    if (subscription.userId !== user.uid) {
      throw new Error('No puedes guardar una suscripcion push para otro usuario.')
    }

    const nextDatabase = upsertPushSubscriptionRecord(database, subscription)
    setDatabase(nextDatabase)

    if (firebaseEnabled) {
      void upsertFirestorePushSubscription(subscription).catch((error) => {
        console.error('No fue posible sincronizar la suscripcion push en Firestore.', error)
      })
    }
  }

  if (firebaseEnabled && (authLoading || loading)) {
    return <LoadingState label="Sincronizando datos..." />
  }

  return (
    <AppDataContext.Provider
      value={{
        database,
        currentUser,
        currentVenture,
        publishedVentures,
        getVentureBySlug: (slug) => getVentureBySlug(database, slug),
        createVenture,
        updateVenture,
        toggleFavorite: handleToggleFavorite,
        createFollowAction: handleCreateFollowAction,
        updateFollowActionStatus: handleUpdateFollowActionStatus,
        trackNetworkClick: handleTrackNetworkClick,
        trackProfileView: handleTrackProfileView,
        reportVenture: handleReportVenture,
        submitFeedback: handleSubmitFeedback,
        updateUserAdminFields: handleUpdateUserAdminFields,
        updateFeedbackAdminStatus: handleUpdateFeedbackAdminStatus,
        updateReportAdminStatus: handleUpdateReportAdminStatus,
        sendAdminNotification: handleSendAdminNotification,
        markNotificationRead: handleMarkNotificationRead,
        markAllNotificationsRead: handleMarkAllNotificationsRead,
        savePushSubscription: handleSavePushSubscription,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider.')
  }

  return context
}
