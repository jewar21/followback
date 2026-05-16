import type { SocialNetworkName } from '../types/models'

export const ventureCategories = [
  'Moda',
  'Comida',
  'Musica',
  'Arte',
  'Tecnologia',
  'Educacion',
  'Diseno',
  'Belleza',
  'Salud',
  'Fitness',
  'Turismo',
  'Fotografia',
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
  reciprocatedCount: 'FollowBack completados',
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
] satisfies SocialNetworkName[]

export const reportReasons = [
  'Spam',
  'Contenido enganoso',
  'Suplantacion',
  'Datos desactualizados',
  'Otro',
]
