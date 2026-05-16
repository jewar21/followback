import type { SocialLinks } from './models'

export type VentureFormValues = {
  name: string
  description: string
  category: string
  subcategory: string
  country: string
  city: string
  logoURL: string
  coverURL: string
  tags: string
  socialLinks: SocialLinks
  contact: {
    publicEmail: string
    phone: string
    whatsapp: string
  }
}

export type VentureFilters = {
  search: string
  tag: string
  category: string
  country: string
  city: string
  network: string
  sortBy: 'recent' | 'active' | 'supported' | 'trusted'
}

export type ReportFormValues = {
  reason: string
  description: string
}

export const defaultVentureFormValues: VentureFormValues = {
  name: '',
  description: '',
  category: '',
  subcategory: '',
  country: '',
  city: '',
  logoURL: '',
  coverURL: '',
  tags: '',
  socialLinks: {
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
    spotify: '',
    x: '',
    linkedin: '',
    website: '',
    whatsapp: '',
    behance: '',
    github: '',
  },
  contact: {
    publicEmail: '',
    phone: '',
    whatsapp: '',
  },
}

export const defaultVentureFilters: VentureFilters = {
  search: '',
  tag: '',
  category: '',
  country: '',
  city: '',
  network: '',
  sortBy: 'recent',
}
