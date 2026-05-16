import type { AppDatabase, User } from '../types/models'

export function upsertUser(database: AppDatabase, incomingUser: User) {
  const next = structuredClone(database)
  const index = next.users.findIndex((user) => user.uid === incomingUser.uid)

  if (index === -1) {
    next.users.unshift(incomingUser)
    return next
  }

  const existing = next.users[index]
  next.users[index] = {
    ...incomingUser,
    role: existing.role,
    status: existing.status,
    onboardingCompleted: existing.onboardingCompleted,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  return next
}
