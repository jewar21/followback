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

    navigate(currentUser.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true })
  }, [currentUser, navigate])

  async function handleGoogleLogin() {
    setSubmitting(true)
    try {
      await signInWithGoogle()
      pushToast('Sesion iniciada con Google.', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'No fue posible iniciar sesion.', 'danger')
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
          <h1>Conecta tu cuenta y publica tu emprendimiento</h1>
          <p>
            Usa Google para autenticacion real con Firebase o entra en modo demo para recorrer el MVP sin credenciales.
          </p>
          <div className="stack">
            <button className="button button--primary button--block" onClick={() => void handleGoogleLogin()} disabled={!firebaseEnabled || submitting}>
              {firebaseEnabled ? 'Continuar con Google' : 'Google Login requiere VITE_FIREBASE_*'}
            </button>
            <button className="button button--ghost button--block" onClick={() => void handleDemoLogin()} disabled={submitting}>
              Entrar al modo demo
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
