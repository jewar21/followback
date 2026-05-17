import { socialNetworkLabels } from '../lib/constants'
import { getAvailableNetworks, parseTags, slugify } from '../lib/utils'
import type { AppDatabase, User, Venture } from '../types/models'
import type { VentureFilters, VentureFormValues } from '../types/forms'

function cleanString(value: string) {
  return value.trim()
}

function cleanSocialLinks(values: VentureFormValues['socialLinks']) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, cleanString(value ?? '')]),
  )
}

function validateVenture(values: VentureFormValues) {
  if (!cleanString(values.name)) {
    throw new Error('El nombre del emprendimiento es obligatorio.')
  }

  if (!cleanString(values.category)) {
    throw new Error('La categoria es obligatoria.')
  }

  if (!cleanString(values.country)) {
    throw new Error('El pais es obligatorio.')
  }

  if (cleanString(values.description).length > 240) {
    throw new Error('La descripción no puede superar 240 caracteres.')
  }

  const socialLinks = cleanSocialLinks(values.socialLinks)
  const hasAtLeastOneSocial = Object.values(socialLinks).some(Boolean)

  if (!hasAtLeastOneSocial) {
    throw new Error('Agregá al menos una red social o sitio web.')
  }
}

function buildVenture(values: VentureFormValues, ownerId: string, slug: string): Venture {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    ownerId,
    name: cleanString(values.name),
    slug,
    description: cleanString(values.description),
    category: cleanString(values.category),
    subcategory: cleanString(values.subcategory) || undefined,
    country: cleanString(values.country),
    city: cleanString(values.city),
    logoURL: cleanString(values.logoURL) || undefined,
    coverURL: cleanString(values.coverURL) || undefined,
    socialLinks: cleanSocialLinks(values.socialLinks),
    contact: {
      publicEmail: cleanString(values.contact.publicEmail) || undefined,
      phone: cleanString(values.contact.phone) || undefined,
      whatsapp: cleanString(values.contact.whatsapp) || undefined,
    },
    tags: parseTags(values.tags),
    status: 'published',
    metrics: {
      profileViews: 0,
      linkClicks: 0,
      followersGiven: 0,
      followersReceived: 0,
      reciprocatedCount: 0,
      favoriteCount: 0,
    },
    reputation: {
      score: 60,
      level: 'new',
      reportCount: 0,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function getPublishedVentures(database: AppDatabase) {
  return database.ventures.filter((venture) => venture.status === 'published')
}

export function getCurrentUserVenture(database: AppDatabase, userId?: string | null) {
  if (!userId) {
    return null
  }

  return database.ventures.find((venture) => venture.ownerId === userId) ?? null
}

export function getVentureBySlug(database: AppDatabase, slug: string) {
  return database.ventures.find((venture) => venture.slug === slug) ?? null
}

export function createVenture(database: AppDatabase, user: User, values: VentureFormValues) {
  validateVenture(values)

  if (getCurrentUserVenture(database, user.uid)) {
    throw new Error('El MVP solo permite un emprendimiento por usuario.')
  }

  const slug = slugify(values.name)
  if (!slug) {
    throw new Error('No fue posible generar el slug del emprendimiento.')
  }

  const slugExists = database.ventures.some((venture) => venture.slug === slug)
  if (slugExists) {
    throw new Error('Ya existe un emprendimiento con ese nombre. Cambialo un poco.')
  }

  const next = structuredClone(database)
  const venture = buildVenture(values, user.uid, slug)
  next.ventures.unshift(venture)

  const currentUser = next.users.find((item) => item.uid === user.uid)
  if (currentUser) {
    currentUser.onboardingCompleted = true
    currentUser.updatedAt = new Date().toISOString()
  }

  return { database: next, venture }
}

export function updateVenture(database: AppDatabase, ventureId: string, values: VentureFormValues) {
  validateVenture(values)
  const next = structuredClone(database)
  const venture = next.ventures.find((item) => item.id === ventureId)

  if (!venture) {
    throw new Error('El emprendimiento no existe.')
  }

  const nextSlug = slugify(values.name)
  const slugTaken = next.ventures.some((item) => item.slug === nextSlug && item.id !== venture.id)
  if (slugTaken) {
    throw new Error('Ese nombre ya genera un slug ocupado.')
  }

  const updated = buildVenture(values, venture.ownerId, nextSlug)

  Object.assign(venture, {
    ...updated,
    id: venture.id,
    createdAt: venture.createdAt,
    metrics: venture.metrics,
    reputation: venture.reputation,
    updatedAt: new Date().toISOString(),
  })

  return venture
}

export function filterVentures(ventures: Venture[], filters: VentureFilters) {
  const search = filters.search.trim().toLowerCase()
  const tag = filters.tag.trim().toLowerCase()

  const filtered = ventures.filter((venture) => {
    const matchesSearch =
      !search ||
      [venture.name, venture.description, venture.category, venture.city, venture.country]
        .join(' ')
        .toLowerCase()
        .includes(search)

    const matchesTag = !tag || venture.tags.some((item) => item.toLowerCase().includes(tag))
    const matchesCategory = !filters.category || venture.category === filters.category
    const matchesCountry = !filters.country || venture.country === filters.country
    const matchesCity = !filters.city || venture.city === filters.city
    const matchesNetwork = !filters.network || Boolean(venture.socialLinks[filters.network as keyof typeof socialNetworkLabels])

    return (
      matchesSearch &&
      matchesTag &&
      matchesCategory &&
      matchesCountry &&
      matchesCity &&
      matchesNetwork
    )
  })

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'active') {
      return right.metrics.linkClicks - left.metrics.linkClicks
    }

    if (filters.sortBy === 'supported') {
      return right.metrics.followersReceived - left.metrics.followersReceived
    }

    if (filters.sortBy === 'trusted') {
      return right.reputation.score - left.reputation.score
    }

    return Date.parse(right.createdAt) - Date.parse(left.createdAt)
  })
}

export function ventureToFormValues(venture: Venture): VentureFormValues {
  return {
    name: venture.name,
    description: venture.description,
    category: venture.category,
    subcategory: venture.subcategory ?? '',
    country: venture.country,
    city: venture.city,
    logoURL: venture.logoURL ?? '',
    coverURL: venture.coverURL ?? '',
    tags: venture.tags.join(', '),
    socialLinks: {
      instagram: venture.socialLinks.instagram ?? '',
      tiktok: venture.socialLinks.tiktok ?? '',
      facebook: venture.socialLinks.facebook ?? '',
      youtube: venture.socialLinks.youtube ?? '',
      spotify: venture.socialLinks.spotify ?? '',
      x: venture.socialLinks.x ?? '',
      linkedin: venture.socialLinks.linkedin ?? '',
      website: venture.socialLinks.website ?? '',
      whatsapp: venture.socialLinks.whatsapp ?? '',
      behance: venture.socialLinks.behance ?? '',
      github: venture.socialLinks.github ?? '',
    },
    contact: {
      publicEmail: venture.contact.publicEmail ?? '',
      phone: venture.contact.phone ?? '',
      whatsapp: venture.contact.whatsapp ?? '',
    },
  }
}

export function countNetworks(venture: Venture) {
  return getAvailableNetworks(venture.socialLinks).length
}
