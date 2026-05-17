import { beforeEach, describe, expect, it } from 'vitest'
import { loadDatabase, saveDatabase } from './storage'

describe('loadDatabase', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty for a fresh project', () => {
    const database = loadDatabase()

    expect(database.ventures).toEqual([])
    expect(database.followActions).toEqual([])
    expect(database.users).toHaveLength(1)
    expect(database.users[0]?.uid).toBe('demo-viewer')
  })

  it('migrates legacy seeded data without deleting custom ventures', () => {
    localStorage.setItem(
      'followback-db-v1',
      JSON.stringify({
        users: [{ uid: 'demo-viewer' }, { uid: 'owner-cafe' }, { uid: 'custom-user' }],
        ventures: [
          { id: 'venture-cafe-arcana', ownerId: 'owner-cafe', slug: 'cafe-arcana' },
          { id: 'custom-venture', ownerId: 'custom-user', slug: 'custom-venture' },
        ],
        followActions: [
          {
            id: 'legacy-action',
            fromUserId: 'owner-cafe',
            fromVentureId: 'venture-cafe-arcana',
            toUserId: 'custom-user',
            toVentureId: 'custom-venture',
          },
        ],
        favorites: [{ id: 'fav', userId: 'custom-user', ventureId: 'custom-venture' }],
        networkClicks: [{ id: 'click', ventureId: 'custom-venture' }],
        analyticsEvents: [{ id: 'event', ventureId: 'custom-venture' }],
        reports: [{ id: 'report', reportedVentureId: 'custom-venture' }],
      }),
    )

    const database = loadDatabase()

    expect(database.users.map((user) => user.uid)).toEqual(['demo-viewer', 'custom-user'])
    expect(database.ventures.map((venture) => venture.id)).toEqual(['custom-venture'])
    expect(database.followActions).toEqual([])
    expect(database.favorites).toHaveLength(1)
  })

  it('keeps valid current-schema data', () => {
    const database = loadDatabase()
    database.users.push({
      uid: 'custom-user',
      email: 'custom@example.com',
      displayName: 'Custom',
      photoURL: '',
      role: 'user',
      status: 'active',
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    saveDatabase(database)
    localStorage.setItem('followback-schema-version', '3')

    const reloaded = loadDatabase()

    expect(reloaded.users.map((user) => user.uid)).toContain('custom-user')
  })
})
