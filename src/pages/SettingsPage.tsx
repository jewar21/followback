import { useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { EmptyState } from '../components/EmptyState'
import { VentureForm } from '../components/VentureForm'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useToast } from '../hooks/useToast'
import { ventureToFormValues } from '../services/ventureService'

export function SettingsPage() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const { currentVenture, updateVenture } = useAppData()
  const { pushToast } = useToast()

  if (!currentUser || !currentVenture) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="No hay datos para editar"
            description="Completa el onboarding y vuelve a esta seccion."
            ctaLabel="Ir a onboarding"
            ctaTo="/onboarding"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Settings</span>
          <h1>Editar cuenta y emprendimiento</h1>
          <p>{currentUser.email}. Aqui puedes completar branding, contacto y todas tus redes cuando quieras.</p>
        </div>
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
      </div>
    </div>
  )
}
