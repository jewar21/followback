import { describe, expect, it } from 'vitest'
import { createSeedDatabase } from './seed'
import { filterVentures } from '../services/ventureService'
import { slugify } from './utils'

describe('slugify', () => {
  it('normalizes spaces and diacritics', () => {
    expect(slugify('Café Aurora Studio')).toBe('cafe-aurora-studio')
  })
})

describe('filterVentures', () => {
  it('filters ventures by category and network', () => {
    const database = createSeedDatabase()
    const results = filterVentures(database.ventures, {
      search: '',
      tag: '',
      category: 'Musica',
      country: '',
      city: '',
      network: 'spotify',
      sortBy: 'recent',
    })

    expect(results).toHaveLength(1)
    expect(results[0]?.slug).toBe('solar-beats')
  })
})
