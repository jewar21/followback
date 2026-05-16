import type { AppDatabase, User } from '../types/models'
import { createSeedDatabase } from './seed'

const DATABASE_KEY = 'followback-db-v1'
const SESSION_KEY = 'followback-session-v1'

export function loadDatabase() {
  const stored = localStorage.getItem(DATABASE_KEY)
  if (!stored) {
    return createSeedDatabase()
  }

  try {
    return JSON.parse(stored) as AppDatabase
  } catch {
    return createSeedDatabase()
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
