import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth'
import { auth, googleProvider, isFirebaseAvailable } from '../lib/firebase'
import { isFirebaseConfigured } from '../lib/env'
import type { User } from '../types/models'

function mapFirebaseUser(user: FirebaseUser): User {
  const now = new Date().toISOString()
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'FollowBack User',
    photoURL: user.photoURL ?? '',
    role: 'user',
    status: 'active',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function createDemoUser(): User {
  const now = new Date().toISOString()
  return {
    uid: 'demo-viewer',
    email: 'demo@followback.app',
    displayName: 'Demo Founder',
    photoURL: '',
    role: 'user',
    status: 'active',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  }
}

export async function signInWithGoogleAccount() {
  if (!isFirebaseConfigured || !isFirebaseAvailable || !auth || !googleProvider) {
    throw new Error('Configurá las variables VITE_FIREBASE_* para usar Google Login real.')
  }

  googleProvider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, googleProvider as GoogleAuthProvider)
  return mapFirebaseUser(result.user)
}

export async function signOutAccount() {
  if (isFirebaseConfigured && isFirebaseAvailable && auth) {
    await signOut(auth)
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured || !isFirebaseAvailable || !auth) {
    callback(null)
    return () => undefined
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null)
  })
}
