const env = import.meta.env

export const firebaseEnv = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  vapidKey: env.VITE_FIREBASE_VAPID_KEY,
}

export const requiredFirebaseEnv = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
}

export const isFirebaseConfigured = Object.values(requiredFirebaseEnv).every(Boolean)
export const hasFirebaseStorageBucket = Boolean(firebaseEnv.storageBucket)
