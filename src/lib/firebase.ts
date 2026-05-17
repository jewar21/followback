import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getFunctions, type Functions } from 'firebase/functions'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { firebaseEnv, hasFirebaseStorageBucket, isFirebaseConfigured } from './env'

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey ?? '',
  authDomain: firebaseEnv.authDomain ?? '',
  projectId: firebaseEnv.projectId ?? '',
  storageBucket: firebaseEnv.storageBucket ?? '',
  messagingSenderId: firebaseEnv.messagingSenderId ?? '',
  appId: firebaseEnv.appId ?? '',
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let functions: Functions | null = null
let storage: FirebaseStorage | null = null
let googleProvider: GoogleAuthProvider | null = null
let firebaseInitError: Error | null = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    functions = getFunctions(app)
    googleProvider = new GoogleAuthProvider()

    if (hasFirebaseStorageBucket) {
      storage = getStorage(app)
    }
  } catch (error) {
    firebaseInitError = error instanceof Error ? error : new Error('No fue posible inicializar Firebase.')
  }
}

export { app, auth, db, functions, storage, googleProvider, firebaseInitError }
export const isFirebaseAvailable = Boolean(app && auth && db && googleProvider)
