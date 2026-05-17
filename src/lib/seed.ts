import type { AppDatabase } from '../types/models'

function nowMinus(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export function createSeedDatabase(): AppDatabase {
  return {
    users: [
      {
        uid: 'demo-viewer',
        email: 'demo@followback.app',
        displayName: 'Demo Founder',
        photoURL: '',
        role: 'user',
        status: 'active',
        onboardingCompleted: false,
        createdAt: nowMinus(2),
        updatedAt: nowMinus(2),
      },
    ],
    ventures: [],
    followActions: [],
    favorites: [],
    networkClicks: [],
    analyticsEvents: [],
    reports: [],
    feedbacks: [],
  }
}
