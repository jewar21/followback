import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { EmptyState } from '../components/EmptyState'
import { VentureForm } from '../components/VentureForm'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { pushSubscriptionStatusLabels } from '../lib/constants'
import { syncPushSubscription } from '../services/pushMessagingService'
import { ventureToFormValues } from '../services/ventureService'
import { useToast } from '../hooks/useToast'

export function SettingsPage() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const { currentVenture, database, updateVenture, savePushSubscription } = useAppData()
  const { pushToast } = useToast()
  const [syncingPush, setSyncingPush] = useState(false)

  const currentSubscription = useMemo(
    () =>
      currentUser
        ? database.pushSubscriptions.find((subscription) => subscription.userId === currentUser.uid && subscription.platform === 'web')
        : null,
    [currentUser, database.pushSubscriptions],
  )

  if (!currentUser) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Debes iniciar sesion"
            description="Accede a tu cuenta para editar datos, revisar notificaciones y configurar permisos del navegador."
            ctaLabel="Ir a login"
            ctaTo="/login"
          />
        </div>
      </div>
    )
  }

  const currentUserId = currentUser.uid

  async function handleEnablePush() {
    setSyncingPush(true)

    try {
      const subscription = await syncPushSubscription(currentUserId)
      savePushSubscription(subscription)

      if (subscription.status === 'enabled') {
        pushToast('Push web configurado en este navegador.', 'success')
      } else if (subscription.lastError) {
        pushToast(subscription.lastError, 'danger')
      } else {
        pushToast('No fue posible activar las notificaciones push todavia.', 'danger')
      }
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'No fue posible configurar push.', 'danger')
    } finally {
      setSyncingPush(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Settings</span>
          <h1>Cuenta, emprendimiento y notificaciones</h1>
          <p>{currentUser.email}. Aqui puedes completar tu perfil, dejar feedback y preparar tu navegador para recibir avisos futuros.</p>
        </div>

        <section className="panel settings-callout">
          <div>
            <strong>¿Encontraste algo para mejorar?</strong>
            <p className="muted-text">Estamos aplicando cambios en la app y nos sirve mucho saber si ya actualizaste tus datos o si algo te esta frenando.</p>
          </div>
          <Link className="button button--ghost" to="/feedback">
            Dejar feedback
          </Link>
        </section>

        <section className="panel settings-callout">
          <div>
            <strong>Notificaciones del navegador</strong>
            <p className="muted-text">
              Estado actual: {pushSubscriptionStatusLabels[currentSubscription?.status ?? 'pending']}. Si autorizas este navegador, quedara listo para recibir push cuando habilitemos el envio desde backend.
            </p>
            {currentSubscription?.lastError ? <p className="muted-text">{currentSubscription.lastError}</p> : null}
          </div>
          <button className="button button--primary" onClick={() => void handleEnablePush()} disabled={syncingPush}>
            {syncingPush ? 'Configurando...' : currentSubscription?.status === 'enabled' ? 'Refrescar push' : 'Activar push'}
          </button>
        </section>

        {currentVenture ? (
          <VentureForm
            initialValues={ventureToFormValues(currentVenture)}
            submitLabel="Guardar cambios"
            mode="full"
            onSubmit={(values) => {
              try {
                const venture = updateVenture(currentVenture.id, values)
                pushToast('Emprendimiento actualizado.', 'success')
                navigate(`/v/${venture.slug}`)
              } catch (error) {
                pushToast(error instanceof Error ? error.message : 'No fue posible guardar.', 'danger')
              }
            }}
          />
        ) : (
          <EmptyState
            title="Aun no tienes emprendimiento"
            description="Puedes dejar las notificaciones listas desde ahora y completar luego el onboarding para publicar tu perfil."
            ctaLabel="Ir a onboarding"
            ctaTo="/onboarding"
          />
        )}
      </div>
    </div>
  )
}
