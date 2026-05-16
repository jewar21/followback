import { useEffect, useEffectEvent } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { VentureSocialLinks } from '../components/VentureSocialLinks'
import { useAppData } from '../app/providers/AppDataProvider'
import { useVenture } from '../hooks/useVenture'

export function VentureNetworksPage() {
  const venture = useVenture()
  const { trackNetworkClick, trackProfileView } = useAppData()
  const onTrackProfileView = useEffectEvent((ventureId: string) => {
    trackProfileView(ventureId)
  })
  const ventureId = venture?.id

  useEffect(() => {
    if (ventureId) {
      onTrackProfileView(ventureId)
    }
  }, [ventureId])

  if (!venture) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="No encontramos este emprendimiento"
            description="Puede que el slug haya cambiado o el perfil ya no este publicado."
            ctaLabel="Ir al directorio"
            ctaTo="/discover"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container narrow-layout">
        <div className="page-heading">
          <span className="eyebrow">Networks</span>
          <h1>{venture.name}</h1>
          <p>Una ficha rapida para abrir todas las redes publicas del emprendimiento.</p>
        </div>
        <section className="panel">
          <VentureSocialLinks
            socialLinks={venture.socialLinks}
            onNetworkClick={(network, url) => trackNetworkClick(venture.id, network, url)}
          />
          <div className="button-row">
            <Link className="button button--ghost" to={`/v/${venture.slug}`}>
              Volver al perfil publico
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
