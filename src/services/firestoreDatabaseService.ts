import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db, isFirebaseAvailable } from '../lib/firebase'
import { createSeedDatabase } from '../lib/seed'
import type {
  AnalyticsEvent,
  AppNotification,
  AppDatabase,
  Feedback,
  Favorite,
  FollowAction,
  NetworkClick,
  PushSubscriptionRecord,
  Report,
  User,
  Venture,
} from '../types/models'

function ensureFirestore() {
  if (!isFirebaseAvailable || !db) {
    throw new Error('Firestore no esta disponible.')
  }

  return db
}

function mergeUniqueById<T extends { id: string }>(...collections: T[][]) {
  const map = new Map<string, T>()

  for (const items of collections) {
    for (const item of items) {
      map.set(item.id, item)
    }
  }

  return Array.from(map.values())
}

export async function loadDatabaseFromFirestore(currentUser: User | null): Promise<AppDatabase> {
  const firestore = ensureFirestore()
  const empty = createSeedDatabase()

  if (!currentUser) {
    const publishedVenturesSnapshot = await getDocs(
      query(collection(firestore, 'ventures'), where('status', '==', 'published')),
    )

    return {
      ...empty,
      users: [],
      ventures: publishedVenturesSnapshot.docs.map((snapshot) => snapshot.data() as Venture),
    }
  }

  const userSnapshot = await getDoc(doc(firestore, 'users', currentUser.uid))
  const persistedUser = userSnapshot.exists() ? (userSnapshot.data() as User) : currentUser

  if (persistedUser.role === 'admin') {
    const [
      usersSnapshot,
      venturesSnapshot,
      feedbackSnapshot,
      reportsSnapshot,
      followActionsSnapshot,
      favoritesSnapshot,
      notificationsSnapshot,
      pushSubscriptionsSnapshot,
    ] =
      await Promise.all([
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'ventures')),
        getDocs(collection(firestore, 'feedback')),
        getDocs(collection(firestore, 'reports')),
        getDocs(collection(firestore, 'followActions')),
        getDocs(collection(firestore, 'favorites')),
        getDocs(collection(firestore, 'notifications')),
        getDocs(collection(firestore, 'pushSubscriptions')),
      ])

    return {
      ...empty,
      users: usersSnapshot.docs.map((snapshot) => snapshot.data() as User),
      ventures: venturesSnapshot.docs.map((snapshot) => snapshot.data() as Venture),
      feedbacks: feedbackSnapshot.docs.map((snapshot) => snapshot.data() as Feedback),
      reports: reportsSnapshot.docs.map((snapshot) => snapshot.data() as Report),
      followActions: followActionsSnapshot.docs.map((snapshot) => snapshot.data() as FollowAction),
      favorites: favoritesSnapshot.docs.map((snapshot) => snapshot.data() as Favorite),
      notifications: notificationsSnapshot.docs.map((snapshot) => snapshot.data() as AppNotification),
      pushSubscriptions: pushSubscriptionsSnapshot.docs.map((snapshot) => snapshot.data() as PushSubscriptionRecord),
    }
  }

  const [
    ownedVenturesSnapshot,
    favoritesSnapshot,
    sentActionsSnapshot,
    receivedActionsSnapshot,
    feedbackSnapshot,
    publishedVenturesSnapshot,
    notificationsSnapshot,
    pushSubscriptionsSnapshot,
  ] =
    await Promise.all([
      getDocs(query(collection(firestore, 'ventures'), where('ownerId', '==', currentUser.uid))),
      getDocs(query(collection(firestore, 'favorites'), where('userId', '==', currentUser.uid))),
      getDocs(query(collection(firestore, 'followActions'), where('fromUserId', '==', currentUser.uid))),
      getDocs(query(collection(firestore, 'followActions'), where('toUserId', '==', currentUser.uid))),
      getDocs(query(collection(firestore, 'feedback'), where('userId', '==', currentUser.uid))),
      getDocs(query(collection(firestore, 'ventures'), where('status', '==', 'published'))),
      getDocs(query(collection(firestore, 'notifications'), where('userId', '==', currentUser.uid))),
      getDocs(query(collection(firestore, 'pushSubscriptions'), where('userId', '==', currentUser.uid))),
    ])

  const ownedVentures = ownedVenturesSnapshot.docs.map((snapshot) => snapshot.data() as Venture)
  const favorites = favoritesSnapshot.docs.map((snapshot) => snapshot.data() as Favorite)
  const feedbacks = feedbackSnapshot.docs.map((snapshot) => snapshot.data() as Feedback)
  const publishedVentures = publishedVenturesSnapshot.docs.map((snapshot) => snapshot.data() as Venture)
  const followActions = mergeUniqueById(
    sentActionsSnapshot.docs.map((snapshot) => snapshot.data() as FollowAction),
    receivedActionsSnapshot.docs.map((snapshot) => snapshot.data() as FollowAction),
  )

  return {
    ...empty,
    users: [persistedUser],
    ventures: mergeUniqueById(publishedVentures, ownedVentures),
    favorites,
    followActions,
    feedbacks,
    notifications: notificationsSnapshot.docs.map((snapshot) => snapshot.data() as AppNotification),
    pushSubscriptions: pushSubscriptionsSnapshot.docs.map((snapshot) => snapshot.data() as PushSubscriptionRecord),
  }
}

export async function upsertFirestoreUser(user: User) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'users', user.uid), user)
}

export async function upsertFirestoreVenture(venture: Venture) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'ventures', venture.id), venture)
}

export async function upsertFirestoreFavorite(favorite: Favorite) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'favorites', favorite.id), favorite)
}

export async function deleteFirestoreFavorite(favoriteId: string) {
  const firestore = ensureFirestore()
  await deleteDoc(doc(firestore, 'favorites', favoriteId))
}

export async function upsertFirestoreFollowAction(action: FollowAction) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'followActions', action.id), action)
}

export async function upsertFirestoreNetworkClick(click: NetworkClick) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'networkClicks', click.id), click)
}

export async function upsertFirestoreAnalyticsEvent(event: AnalyticsEvent) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'analyticsEvents', event.id), event)
}

export async function upsertFirestoreReport(report: Report) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'reports', report.id), report)
}

export async function upsertFirestoreFeedback(feedback: Feedback) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'feedback', feedback.id), feedback)
}

export async function upsertFirestoreNotification(notification: AppNotification) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'notifications', notification.id), notification)
}

export async function upsertFirestorePushSubscription(subscription: PushSubscriptionRecord) {
  const firestore = ensureFirestore()
  await setDoc(doc(firestore, 'pushSubscriptions', subscription.id), subscription)
}
