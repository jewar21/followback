import { describe, expect, it } from 'vitest'
import { filterVentures } from '../services/ventureService'
import { slugify } from './utils'
import type { Venture } from '../types/models'

function makeVenture(overrides: Partial<Venture>): Venture {
  const now = new Date().toISOString()
  return {
    id: 'v1',
    ownerId: 'u1',
    name: 'Test',
    slug: 'test',
    description: 'Desc',
    category: 'Arte',
    country: 'Colombia',
    department: 'Cundinamarca',
    city: 'Bogota',
    socialLinks: {},
    contact: {},
    tags: [],
    status: 'published',
    metrics: { profileViews: 0, linkClicks: 0, followersGiven: 0, followersReceived: 0, reciprocatedCount: 0, favoriteCount: 0 },
    reputation: { score: 60, level: 'new', reportCount: 0 },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('slugify', () => {
  it('normalizes spaces and diacritics', () => {
    expect(slugify('Café Aurora Studio')).toBe('cafe-aurora-studio')
  })
})

describe('filterVentures', () => {
  it('filters ventures by category and network', () => {
    const ventures = [
      makeVenture({ id: 'v1', slug: 'solar-beats', category: 'Musica', socialLinks: { spotify: 'https://open.spotify.com/artist/solar-beats' } }),
      makeVenture({ id: 'v2', slug: 'arte-local', category: 'Arte', socialLinks: { instagram: 'https://instagram.com/artelocal' } }),
    ]

    const results = filterVentures(ventures, {
      search: '',
      tag: '',
      category: 'Musica',
      country: '',
      department: '',
      city: '',
      network: 'spotify',
      sortBy: 'recent',
    })

    expect(results).toHaveLength(1)
    expect(results[0]?.slug).toBe('solar-beats')
  })
})
