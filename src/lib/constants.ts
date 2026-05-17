import type { SocialNetworkName } from '../types/models'

export const ventureCategories = [
  'Moda',
  'Comida',
  'Música',
  'Arte',
  'Tecnología',
  'Educación',
  'Diseño',
  'Belleza',
  'Salud',
  'Fitness',
  'Turismo',
  'Fotografía',
  'Marketing',
  'Eventos',
  'Gaming',
  'Contenido digital',
  'Servicios profesionales',
  'Tienda online',
  'Marca personal',
  'Otro',
]

export const socialNetworkLabels: Record<SocialNetworkName, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
  spotify: 'Spotify',
  x: 'X',
  linkedin: 'LinkedIn',
  website: 'Website',
  whatsapp: 'WhatsApp',
  behance: 'Behance',
  github: 'GitHub',
}

export const dashboardMetricLabels = {
  profileViews: 'Visitas al perfil',
  linkClicks: 'Clics en redes',
  followersGiven: 'Follows enviados',
  followersReceived: 'Follows recibidos',
  reciprocatedCount: 'Seguimientos recíprocos',
  favoriteCount: 'Favoritos',
}

export const followableNetworks = [
  'instagram',
  'tiktok',
  'facebook',
  'youtube',
  'spotify',
  'x',
  'linkedin',
  'website',
  'whatsapp',
] as const satisfies readonly SocialNetworkName[]

export type FollowableNetwork = (typeof followableNetworks)[number]

export const reportReasons = [
  'Spam',
  'Contenido engañoso',
  'Suplantación',
  'Datos desactualizados',
  'Otro',
]

export const feedbackCategoryLabels = {
  profile_update: 'Actualización de perfil',
  ux: 'Experiencia de uso',
  bug: 'Problema o error',
  feature: 'Idea o mejora',
  other: 'Otro',
} as const

export const feedbackProfileStatusLabels = {
  updated: 'Ya actualicé mis datos',
  working_on_it: 'Estoy actualizando mis datos',
  need_help: 'Necesito ayuda para completar mi perfil',
} as const

export const pushSubscriptionStatusLabels = {
  enabled: 'Push habilitado',
  blocked: 'Permiso bloqueado',
  pending: 'Pendiente de permiso',
  unsupported: 'No soportado',
  error: 'Error de configuración',
} as const
