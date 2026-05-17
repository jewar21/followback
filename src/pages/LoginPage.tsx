import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export function LoginPage() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const { signInWithGoogle, signInDemo, firebaseEnabled } = useAuth()
  const { pushToast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      return
    }

    navigate(currentUser.role === 'admin' ? '/admin' : currentUser.onboardingCompleted ? '/dashboard' : '/onboarding', {
      replace: true,
    })
  }, [currentUser, navigate])

  async function handleGoogleLogin() {
    setSubmitting(true)
    try {
      await signInWithGoogle()
      pushToast('Sesión iniciada con Google.', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'No fue posible iniciar sesión.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDemoLogin() {
    setSubmitting(true)
    try {
      await signInDemo()
      pushToast('Entraste al modo demo.', 'success')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container narrow-layout">
        <section className="panel auth-panel">
          <span className="eyebrow">Acceso</span>
          <h1>Conectá tu cuenta y publicá tu emprendimiento</h1>
          <p>
            Usá Google para autenticación real con Firebase o entrá en modo demo para recorrer el MVP sin credenciales.
          </p>
          <div className="stack">
            <button className="button button--primary button--block" onClick={() => void handleGoogleLogin()} disabled={!firebaseEnabled || submitting}>
              {firebaseEnabled ? 'Continuar con Google' : 'Google Login requiere VITE_FIREBASE_*'}
            </button>
            <button className="button button--ghost button--block" onClick={() => void handleDemoLogin()} disabled={submitting}>
              Entrá al modo demo
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
