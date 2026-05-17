import {
  getFirestoreDb,
  isFirebaseAvailable,
} from '../lib/firebase'
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
  if (!isFirebaseAvailable) {
    throw new Error('Firestore no esta disponible.')
  }
}

type FirestoreModule = typeof import('firebase/firestore')

let firestoreModulePromise: Promise<FirestoreModule> | null = null

async function getFirestoreContext() {
  ensureFirestore()
  const firestore = await getFirestoreDb()
  firestoreModulePromise ??= import('firebase/firestore')
  const firestoreModule = await firestoreModulePromise

  return {
    firestore,
    ...firestoreModule,
  }
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

function sanitizePushSubscription(subscription: PushSubscriptionRecord): PushSubscriptionRecord {
  return {
    ...subscription,
    token: undefined,
  }
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, stripUndefinedDeep(nestedValue)]),
    ) as T
  }

  return value
}

export async function loadDatabaseFromFirestore(currentUser: User | null): Promise<AppDatabase> {
  const { firestore, collection, doc, getDoc, getDocs, query, where } = await getFirestoreContext()
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
      pushSubscriptions: pushSubscriptionsSnapshot.docs.map((snapshot) =>
        sanitizePushSubscription(snapshot.data() as PushSubscriptionRecord),
      ),
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
    pushSubscriptions: pushSubscriptionsSnapshot.docs.map((snapshot) =>
      sanitizePushSubscription(snapshot.data() as PushSubscriptionRecord),
    ),
  }
}

export async function upsertFirestoreUser(user: User) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'users', user.uid), stripUndefinedDeep(user))
}

export async function ensureFirestoreUser(user: User) {
  const { firestore, doc, getDoc, setDoc } = await getFirestoreContext()
  const reference = doc(firestore, 'users', user.uid)
  const snapshot = await getDoc(reference)

  if (!snapshot.exists()) {
    await setDoc(reference, stripUndefinedDeep(user))
    return user
  }

  const existing = snapshot.data() as User
  const mergedUser: User = {
    ...existing,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    updatedAt: new Date().toISOString(),
  }

  await setDoc(reference, stripUndefinedDeep(mergedUser))
  return mergedUser
}

export async function upsertFirestoreVenture(venture: Venture) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'ventures', venture.id), stripUndefinedDeep(venture))
}

export async function upsertFirestoreFavorite(favorite: Favorite) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'favorites', favorite.id), stripUndefinedDeep(favorite))
}

export async function deleteFirestoreFavorite(favoriteId: string) {
  const { firestore, deleteDoc, doc } = await getFirestoreContext()
  await deleteDoc(doc(firestore, 'favorites', favoriteId))
}

export async function upsertFirestoreFollowAction(action: FollowAction) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'followActions', action.id), stripUndefinedDeep(action))
}

export async function upsertFirestoreNetworkClick(click: NetworkClick) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'networkClicks', click.id), stripUndefinedDeep(click))
}

export async function upsertFirestoreAnalyticsEvent(event: AnalyticsEvent) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'analyticsEvents', event.id), stripUndefinedDeep(event))
}

export async function upsertFirestoreReport(report: Report) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'reports', report.id), stripUndefinedDeep(report))
}

export async function upsertFirestoreFeedback(feedback: Feedback) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'feedback', feedback.id), stripUndefinedDeep(feedback))
}

export async function upsertFirestoreNotification(notification: AppNotification) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'notifications', notification.id), stripUndefinedDeep(notification))
}

export async function upsertFirestorePushSubscription(subscription: PushSubscriptionRecord) {
  const { firestore, doc, setDoc } = await getFirestoreContext()
  await setDoc(doc(firestore, 'pushSubscriptions', subscription.id), stripUndefinedDeep(subscription))
}
