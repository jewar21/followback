import { useNavigate } from 'react-router-dom'
import { VentureForm } from '../components/VentureForm'
import { defaultVentureFormValues } from '../types/forms'
import { useAppData } from '../app/providers/AppDataProvider'
import { useCurrentVenture } from '../hooks/useCurrentVenture'
import { useToast } from '../hooks/useToast'

export function OnboardingPage() {
  const navigate = useNavigate()
  const currentVenture = useCurrentVenture()
  const { createVenture } = useAppData()
  const { pushToast } = useToast()

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Onboarding</span>
          <h1>{currentVenture ? 'Tu emprendimiento ya existe' : 'Crea el perfil de tu emprendimiento'}</h1>
          <p>Nombre, categoria, ubicacion y al menos una red social para entrar al directorio.</p>
        </div>
        {currentVenture ? (
          <div className="panel">
            <p>Ya tienes un emprendimiento creado en este MVP.</p>
            <button className="button button--primary" onClick={() => navigate('/dashboard')}>
              Ir al dashboard
            </button>
          </div>
        ) : (
          <VentureForm
            initialValues={defaultVentureFormValues}
            submitLabel="Publicar emprendimiento"
            onSubmit={(values) => {
              try {
                const venture = createVenture(values)
                pushToast('Emprendimiento publicado.', 'success')
                navigate(`/v/${venture.slug}`)
              } catch (error) {
                pushToast(error instanceof Error ? error.message : 'No fue posible publicar.', 'danger')
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
