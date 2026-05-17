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
        <div className="onboarding-layout">
          <section className="page-heading onboarding-heading">
            <span className="eyebrow">Onboarding</span>
            <h1>{currentVenture ? 'Tu emprendimiento ya existe' : 'Creá tu perfil sin fricción'}</h1>
            <p>Empezá con nombre, categoría, país y una red principal. El resto lo podés completar después desde tu perfil.</p>

            <div className="onboarding-benefits">
                <article className="mini-card">
                <strong>Edición progresiva</strong>
                <p>Logo, portada, contacto y redes extra quedan disponibles después.</p>
              </article>
            </div>
          </section>

          {currentVenture ? (
            <div className="panel">
              <p>Ya tenés un emprendimiento creado.</p>
              <button className="button button--primary button--block" onClick={() => navigate('/dashboard')}>
                Ir al dashboard
              </button>
            </div>
          ) : (
            <VentureForm
              initialValues={defaultVentureFormValues}
              submitLabel="Crear perfil basico"
              mode="onboarding"
              onSubmit={(values) => {
                try {
                  createVenture(values)
                  pushToast('Perfil publicado. Después podés completar más datos.', 'success')
                  navigate('/dashboard')
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : 'No fue posible publicar.', 'danger')
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
