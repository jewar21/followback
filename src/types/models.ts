export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'suspended'
export type AnnouncementAudience = 'all_active' | 'pending_onboarding' | 'completed_onboarding' | 'without_venture'
export type VentureStatus = 'draft' | 'published' | 'hidden' | 'suspended'
export type FollowActionStatus =
  | 'pending'
  | 'reciprocated'
  | 'rejected'
  | 'cancelled'
  | 'expired'
export type ReputationLevel = 'new' | 'active' | 'trusted' | 'top'
export type SocialNetworkName =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'spotify'
  | 'x'
  | 'linkedin'
  | 'website'
  | 'whatsapp'
  | 'behance'
  | 'github'

export type SocialLinks = Partial<Record<SocialNetworkName, string>>

export type User = {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: UserRole
  status: UserStatus
  onboardingCompleted: boolean
  welcomeEmailSentAt?: string
  onboardingEmailSentAt?: string
  createdAt: string
  updatedAt: string
}

export type Venture = {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string
  category: string
  subcategory?: string
  country: string
  department?: string
  city: string
  logoURL?: string
  coverURL?: string
  socialLinks: SocialLinks
  contact: {
    publicEmail?: string
    phone?: string
    whatsapp?: string
  }
  tags: string[]
  status: VentureStatus
  metrics: {
    profileViews: number
    linkClicks: number
    followersGiven: number
    followersReceived: number
    reciprocatedCount: number
    favoriteCount: number
  }
  reputation: {
    score: number
    level: ReputationLevel
    reportCount: number
  }
  createdAt: string
  updatedAt: string
}

export type FollowAction = {
  id: string
  fromUserId: string
  fromVentureId: string
  toUserId: string
  toVentureId: string
  network: Extract<
    SocialNetworkName,
    | 'instagram'
    | 'tiktok'
    | 'facebook'
    | 'youtube'
    | 'spotify'
    | 'x'
    | 'linkedin'
    | 'website'
    | 'whatsapp'
  >
  status: FollowActionStatus
  note?: string
  createdAt: string
  updatedAt: string
}

export type Favorite = {
  id: string
  userId: string
  ventureId: string
  createdAt: string
}

export type NetworkClick = {
  id: string
  ventureId: string
  clickedByUserId?: string
  network: SocialNetworkName
  url: string
  createdAt: string
}

export type AnalyticsEvent = {
  id: string
  userId?: string
  ventureId?: string
  type:
    | 'profile_view'
    | 'network_click'
    | 'follow_action_created'
    | 'follow_action_reciprocated'
    | 'favorite_created'
  metadata?: Record<string, unknown>
  createdAt: string
}

export type Report = {
  id: string
  reporterUserId: string
  reportedVentureId: string
  reason: string
  description: string
  status: 'pending' | 'reviewed' | 'dismissed'
  createdAt: string
}

export type Feedback = {
  id: string
  userId: string
  ventureId?: string
  title: string
  category: 'profile_update' | 'ux' | 'bug' | 'feature' | 'other'
  profileStatus: 'updated' | 'working_on_it' | 'need_help'
  message: string
  contactEmail: string
  status: 'new' | 'reviewed' | 'planned' | 'closed'
  createdAt: string
  updatedAt: string
}

export type AppNotification = {
  id: string
  userId: string
  title: string
  message: string
  kind: 'announcement' | 'system'
  channel: 'in_app' | 'push'
  audience?: AnnouncementAudience
  ctaUrl?: string
  createdBy?: string
  status: 'unread' | 'read'
  createdAt: string
  updatedAt: string
  readAt?: string
}

export type PushSubscriptionRecord = {
  id: string
  userId: string
  token?: string
  platform: 'web'
  permission: 'granted' | 'denied' | 'default' | 'unsupported'
  status: 'enabled' | 'blocked' | 'pending' | 'unsupported' | 'error'
  userAgent: string
  createdAt: string
  updatedAt: string
  lastTokenAt?: string
  lastError?: string
}

export type NetworkNode = {
  id: string
  label: string
  category: string
  city: string
  logoURL?: string
}

export type NetworkEdge = {
  source: string
  target: string
  network: string
  status: 'pending' | 'reciprocated'
}

export type AppDatabase = {
  users: User[]
  ventures: Venture[]
  followActions: FollowAction[]
  favorites: Favorite[]
  networkClicks: NetworkClick[]
  analyticsEvents: AnalyticsEvent[]
  reports: Report[]
  feedbacks: Feedback[]
  notifications: AppNotification[]
  pushSubscriptions: PushSubscriptionRecord[]
}
