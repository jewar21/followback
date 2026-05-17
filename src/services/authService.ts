import type { User as FirebaseUser } from 'firebase/auth'
import { getFirebaseAuthContext, isFirebaseAvailable } from '../lib/firebase'
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
  if (!isFirebaseConfigured || !isFirebaseAvailable) {
    throw new Error('Configurá las variables VITE_FIREBASE_* para usar Google Login real.')
  }

  const [{ signInWithPopup }, { auth, googleProvider }] = await Promise.all([
    import('firebase/auth'),
    getFirebaseAuthContext(),
  ])

  googleProvider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, googleProvider)
  return mapFirebaseUser(result.user)
}

export async function signOutAccount() {
  if (isFirebaseConfigured && isFirebaseAvailable) {
    const [{ signOut }, { auth }] = await Promise.all([import('firebase/auth'), getFirebaseAuthContext()])
    await signOut(auth)
  }
}

export async function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured || !isFirebaseAvailable) {
    callback(null)
    return () => undefined
  }

  const [{ onAuthStateChanged }, { auth }] = await Promise.all([
    import('firebase/auth'),
    getFirebaseAuthContext(),
  ])

  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null)
  })
}
