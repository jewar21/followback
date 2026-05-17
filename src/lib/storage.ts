import type { AppDatabase, User } from '../types/models'
import { createSeedDatabase } from './seed'

const DATABASE_KEY = 'followback-db-v1'
const SESSION_KEY = 'followback-session-v1'
const SCHEMA_VERSION_KEY = 'followback-schema-version'
const SCHEMA_VERSION = '3'
const LEGACY_SEED_USER_IDS = new Set(['owner-cafe', 'owner-orbita', 'owner-solar', 'owner-trazo'])
const LEGACY_SEED_VENTURE_IDS = new Set([
  'venture-cafe-arcana',
  'venture-orbita-studio',
  'venture-solar-beats',
  'venture-trazo-libre',
])

function normalizeDatabase(database: unknown) {
  const emptyDatabase = createSeedDatabase()
  if (!database || typeof database !== 'object') {
    return emptyDatabase
  }

  const candidate = database as Partial<AppDatabase>

  return {
    users: Array.isArray(candidate.users) ? candidate.users : emptyDatabase.users,
    ventures: Array.isArray(candidate.ventures) ? candidate.ventures : emptyDatabase.ventures,
    followActions: Array.isArray(candidate.followActions)
      ? candidate.followActions
      : emptyDatabase.followActions,
    favorites: Array.isArray(candidate.favorites) ? candidate.favorites : emptyDatabase.favorites,
    networkClicks: Array.isArray(candidate.networkClicks)
      ? candidate.networkClicks
      : emptyDatabase.networkClicks,
    analyticsEvents: Array.isArray(candidate.analyticsEvents)
      ? candidate.analyticsEvents
      : emptyDatabase.analyticsEvents,
    reports: Array.isArray(candidate.reports) ? candidate.reports : emptyDatabase.reports,
    feedbacks: Array.isArray(candidate.feedbacks) ? candidate.feedbacks : emptyDatabase.feedbacks,
    notifications: Array.isArray(candidate.notifications) ? candidate.notifications : emptyDatabase.notifications,
    pushSubscriptions: Array.isArray(candidate.pushSubscriptions)
      ? candidate.pushSubscriptions
      : emptyDatabase.pushSubscriptions,
  } satisfies AppDatabase
}

function migrateDatabase(database: AppDatabase) {
  const filteredUsers = database.users.filter((user) => !LEGACY_SEED_USER_IDS.has(user.uid))
  const filteredVentures = database.ventures.filter((venture) => !LEGACY_SEED_VENTURE_IDS.has(venture.id))
  const keptVentureIds = new Set(filteredVentures.map((venture) => venture.id))

  return {
    ...database,
    users: filteredUsers,
    ventures: filteredVentures,
    followActions: database.followActions.filter(
      (action) =>
        keptVentureIds.has(action.fromVentureId) &&
        keptVentureIds.has(action.toVentureId) &&
        !LEGACY_SEED_USER_IDS.has(action.fromUserId) &&
        !LEGACY_SEED_USER_IDS.has(action.toUserId),
    ),
    favorites: database.favorites.filter((favorite) => keptVentureIds.has(favorite.ventureId)),
    networkClicks: database.networkClicks.filter((click) => keptVentureIds.has(click.ventureId)),
    analyticsEvents: database.analyticsEvents.filter(
      (event) => !event.ventureId || keptVentureIds.has(event.ventureId),
    ),
    reports: database.reports.filter((report) => keptVentureIds.has(report.reportedVentureId)),
    feedbacks: database.feedbacks,
    notifications: database.notifications,
    pushSubscriptions: database.pushSubscriptions,
  } satisfies AppDatabase
}

export function loadDatabase() {
  const stored = localStorage.getItem(DATABASE_KEY)
  const schemaVersion = localStorage.getItem(SCHEMA_VERSION_KEY)

  if (schemaVersion !== SCHEMA_VERSION) {
    let parsedDatabase: unknown = null

    if (stored) {
      try {
        parsedDatabase = JSON.parse(stored)
      } catch {
        parsedDatabase = null
      }
    }

    const nextDatabase = migrateDatabase(normalizeDatabase(parsedDatabase))
    localStorage.setItem(DATABASE_KEY, JSON.stringify(nextDatabase))
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
    return nextDatabase
  }

  if (!stored) {
    const nextDatabase = createSeedDatabase()
    localStorage.setItem(DATABASE_KEY, JSON.stringify(nextDatabase))
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
    return nextDatabase
  }

  try {
    const nextDatabase = normalizeDatabase(JSON.parse(stored))
    localStorage.setItem(DATABASE_KEY, JSON.stringify(nextDatabase))
    return nextDatabase
  } catch {
    const nextDatabase = createSeedDatabase()
    localStorage.setItem(DATABASE_KEY, JSON.stringify(nextDatabase))
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
    return nextDatabase
  }
}

export function saveDatabase(database: AppDatabase) {
  localStorage.setItem(DATABASE_KEY, JSON.stringify(database))
}

export function loadSessionUser() {
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function saveSessionUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY)
    return
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}
