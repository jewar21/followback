import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createDemoUser, signInWithGoogleAccount, signOutAccount, subscribeToAuthChanges } from '../services/authService'
import { loadSessionUser, saveSessionUser } from '../lib/storage'
import { isFirebaseConfigured } from '../lib/env'
import { isFirebaseAvailable } from '../lib/firebase'
import type { User } from '../types/models'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<User>
  signInDemo: () => Promise<User>
  signOut: () => Promise<void>
  firebaseEnabled: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSessionUser())
  const [loading, setLoading] = useState(isFirebaseConfigured && isFirebaseAvailable)

  useEffect(() => {
    if (!isFirebaseConfigured || !isFirebaseAvailable) {
      return undefined
    }

    let cleanup: () => void = () => {}
    let cancelled = false

    void subscribeToAuthChanges((nextUser) => {
      setUser(nextUser)
      saveSessionUser(nextUser)
      setLoading(false)
    })
      .then((unsubscribe) => {
        if (cancelled) {
          unsubscribe()
          return
        }

        cleanup = unsubscribe
      })
      .catch((error) => {
        console.error('No fue posible iniciar la suscripción de Auth.', error)
        setLoading(false)
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  async function signInWithGoogle() {
    const nextUser = await signInWithGoogleAccount()
    setUser(nextUser)
    saveSessionUser(nextUser)
    return nextUser
  }

  async function signInDemo() {
    const nextUser = createDemoUser()
    setUser(nextUser)
    saveSessionUser(nextUser)
    return nextUser
  }

  async function signOut() {
    await signOutAccount()
    setUser(null)
    saveSessionUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInDemo,
        signOut,
        firebaseEnabled: isFirebaseConfigured && isFirebaseAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}
