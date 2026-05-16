import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { saveDatabase, loadDatabase } from '../../lib/storage'
import { toggleFavorite } from '../../services/favoriteService'
import { createFollowAction, updateFollowActionStatus } from '../../services/followActionService'
import { reportVenture } from '../../services/reportService'
import {
  createVenture as createVentureRecord,
  getCurrentUserVenture,
  getPublishedVentures,
  getVentureBySlug,
  updateVenture as updateVentureRecord,
} from '../../services/ventureService'
import { upsertUser } from '../../services/userService'
import { trackNetworkClick, trackProfileView } from '../../services/analyticsService'
import type { AppDatabase, FollowActionStatus, SocialNetworkName, User, Venture } from '../../types/models'
import type { VentureFormValues } from '../../types/forms'

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
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth()
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabase())

  useEffect(() => {
    saveDatabase(database)
  }, [database])

  const currentUser = authUser
    ? database.users.find((user) => user.uid === authUser.uid) ?? authUser
    : null

  const currentVenture = getCurrentUserVenture(database, currentUser?.uid)
  const publishedVentures = getPublishedVentures(database)

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
    return venture
  }

  function handleToggleFavorite(ventureId: string) {
    const user = requireUser()
    setDatabase((current) => toggleFavorite(current, user.uid, ventureId))
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

    setDatabase((current) =>
      createFollowAction(current, {
        currentUser: user,
        currentVenture,
        targetVenture,
        network,
      }),
    )
  }

  function handleUpdateFollowActionStatus(
    actionId: string,
    status: Extract<FollowActionStatus, 'reciprocated' | 'rejected' | 'cancelled'>,
  ) {
    const user = requireUser()
    setDatabase((current) =>
      updateFollowActionStatus(current, {
        actionId,
        actorUserId: user.uid,
        status,
      }),
    )
  }

  function handleTrackNetworkClick(ventureId: string, network: SocialNetworkName, url: string) {
    setDatabase((current) =>
      trackNetworkClick(current, {
        ventureId,
        userId: currentUser?.uid,
        network,
        url,
      }),
    )
  }

  function handleTrackProfileView(ventureId: string) {
    setDatabase((current) => trackProfileView(current, ventureId, currentUser?.uid))
  }

  function handleReportVenture(ventureId: string, reason: string, description: string) {
    const user = requireUser()
    setDatabase((current) =>
      reportVenture(current, {
        reporterUserId: user.uid,
        reportedVentureId: ventureId,
        reason,
        description,
      }),
    )
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
