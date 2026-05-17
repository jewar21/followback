import { followableNetworks, type FollowableNetwork } from './constants'
import type { SocialLinks, SocialNetworkName } from '../types/models'

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatCompactMetric(value: number) {
  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function getAvailableNetworks(socialLinks: SocialLinks) {
  return (Object.entries(socialLinks) as Array<[SocialNetworkName, string | undefined]>)
    .filter((entry) => Boolean(entry[1]?.trim()))
    .map(([network]) => network)
}

export function getFollowableNetworks(socialLinks: SocialLinks): FollowableNetwork[] {
  return getAvailableNetworks(socialLinks).filter(
    (n): n is FollowableNetwork => (followableNetworks as readonly string[]).includes(n),
  )
}

export function ensureExternalUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `https://${url}`
}

export function parseTags(input: string) {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index)
}
