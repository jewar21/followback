import { PRIMARY_COUNTRY_NAME } from '../lib/geo'
import type { SocialLinks } from './models'

export type VentureFormValues = {
  name: string
  description: string
  category: string
  subcategory: string
  country: string
  department: string
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
  department: string
  city: string
  network: string
  sortBy: 'recent' | 'active' | 'supported' | 'trusted'
}

export type ReportFormValues = {
  reason: string
  description: string
}

export type FeedbackFormValues = {
  title: string
  category: 'profile_update' | 'ux' | 'bug' | 'feature' | 'other'
  profileStatus: 'updated' | 'working_on_it' | 'need_help'
  message: string
  contactEmail: string
}

export const defaultVentureFormValues: VentureFormValues = {
  name: '',
  description: '',
  category: '',
  subcategory: '',
  country: PRIMARY_COUNTRY_NAME,
  department: '',
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
  country: PRIMARY_COUNTRY_NAME,
  department: '',
  city: '',
  network: '',
  sortBy: 'recent',
}

export const defaultFeedbackFormValues: FeedbackFormValues = {
  title: '',
  category: 'profile_update',
  profileStatus: 'working_on_it',
  message: '',
  contactEmail: '',
}
