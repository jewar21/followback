import type { AppDatabase, User } from '../types/models'
import { createSeedDatabase } from './seed'

const DATABASE_KEY = 'followback-db-v1'
const SESSION_KEY = 'followback-session-v1'
const SCHEMA_VERSION_KEY = 'followback-schema-version'
const SCHEMA_VERSION = '2'

export function loadDatabase() {
  const schemaVersion = localStorage.getItem(SCHEMA_VERSION_KEY)
  if (schemaVersion !== SCHEMA_VERSION) {
    const nextDatabase = createSeedDatabase()
    localStorage.setItem(DATABASE_KEY, JSON.stringify(nextDatabase))
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
    return nextDatabase
  }

  const stored = localStorage.getItem(DATABASE_KEY)
  if (!stored) {
    const nextDatabase = createSeedDatabase()
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
    return nextDatabase
  }

  try {
    return JSON.parse(stored) as AppDatabase
  } catch {
    const nextDatabase = createSeedDatabase()
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
