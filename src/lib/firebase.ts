import type { FirebaseApp } from 'firebase/app'
import type { Auth, GoogleAuthProvider } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { Functions } from 'firebase/functions'
import type { FirebaseStorage } from 'firebase/storage'
import { firebaseEnv, hasFirebaseStorageBucket, isFirebaseConfigured } from './env'

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey ?? '',
  authDomain: firebaseEnv.authDomain ?? '',
  projectId: firebaseEnv.projectId ?? '',
  storageBucket: firebaseEnv.storageBucket ?? '',
  messagingSenderId: firebaseEnv.messagingSenderId ?? '',
  appId: firebaseEnv.appId ?? '',
}

let appPromise: Promise<FirebaseApp> | null = null
let authPromise: Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> | null = null
let firestorePromise: Promise<Firestore> | null = null
let functionsPromise: Promise<Functions> | null = null
let storagePromise: Promise<FirebaseStorage | null> | null = null

export const isFirebaseAvailable = isFirebaseConfigured

export async function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no está configurado en este entorno.')
  }

  appPromise ??= (async () => {
    const { getApp, getApps, initializeApp } = await import('firebase/app')
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  })()

  return appPromise
}

export async function getFirebaseAuthContext() {
  authPromise ??= (async () => {
    const app = await getFirebaseApp()
    const { getAuth, GoogleAuthProvider } = await import('firebase/auth')
    return {
      auth: getAuth(app),
      googleProvider: new GoogleAuthProvider(),
    }
  })()

  return authPromise
}

export async function getFirestoreDb() {
  firestorePromise ??= (async () => {
    const app = await getFirebaseApp()
    const { getFirestore } = await import('firebase/firestore')
    return getFirestore(app)
  })()

  return firestorePromise
}

export async function getFirebaseFunctions() {
  functionsPromise ??= (async () => {
    const app = await getFirebaseApp()
    const { getFunctions } = await import('firebase/functions')
    return getFunctions(app)
  })()

  return functionsPromise
}

export async function getFirebaseStorage() {
  if (!hasFirebaseStorageBucket) {
    return null
  }

  storagePromise ??= (async () => {
    const app = await getFirebaseApp()
    const { getStorage } = await import('firebase/storage')
    return getStorage(app)
  })()

  return storagePromise
}
