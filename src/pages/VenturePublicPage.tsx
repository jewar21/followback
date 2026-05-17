import { useEffect, useEffectEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { EmptyState } from '../components/EmptyState'
import { FavoriteButton } from '../components/FavoriteButton'
import { FollowBackButton } from '../components/FollowBackButton'
import { ReportModal } from '../components/ReportModal'
import { VentureSocialLinks } from '../components/VentureSocialLinks'
import { useFavorites } from '../hooks/useFavorites'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../hooks/useToast'
import { useVenture } from '../hooks/useVenture'
import { formatDateLabel, formatLocationLabel, getFollowableNetworks } from '../lib/utils'

export function VenturePublicPage() {
  const venture = useVenture()
  const [showReport, setShowReport] = useState(false)
  const { currentUser, currentVenture, toggleFavorite, createFollowAction, trackProfileView, trackNetworkClick, reportVenture } =
    useAppData()
  const { isFavorite } = useFavorites()
  const { pushToast } = useToast()
  const onTrackProfileView = useEffectEvent((ventureId: string) => {
    trackProfileView(ventureId)
  })
  const ventureId = venture?.id

  useSEO({
    title: venture ? venture.name : 'Emprendimiento',
    description: venture
      ? `${venture.description} — Seguí a ${venture.name} en Voseguime y conectá con su comunidad.`
      : 'Descubrí este emprendimiento en Voseguime.',
    path: venture ? `/v/${venture.slug}` : '/',
    image: venture?.logoURL ?? undefined,
  })

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
            title="Este emprendimiento no existe"
            description="Revisá el slug o volvé al directorio."
            ctaLabel="Volver a explorar"
            ctaTo="/discover"
          />
        </div>
      </div>
    )
  }

  const followableNetworks = getFollowableNetworks(venture.socialLinks)

  return (
    <div className="page">
      <div className="container">
        <section className="profile-hero" style={venture.coverURL ? { backgroundImage: `linear-gradient(140deg, rgba(6, 11, 23, 0.8), rgba(10, 34, 55, 0.72)), url(${venture.coverURL})` } : undefined}>
          <div className="venture-avatar venture-avatar--large">
            {venture.logoURL ? <img src={venture.logoURL} alt={venture.name} /> : venture.name.slice(0, 2)}
          </div>
          <div className="profile-hero__copy">
            <span className="eyebrow">{venture.category}</span>
            <h1>{venture.name}</h1>
            <p>{venture.description}</p>
            <div className="tag-row">
              {venture.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="profile-hero__meta">
            <div className="profile-meta-card">
              <span>Ubicación</span>
              <strong>{formatLocationLabel(venture) || 'Ciudad por definir'}</strong>
            </div>
            <div className="profile-meta-card">
              <span>Miembro desde</span>
              <strong>{formatDateLabel(venture.createdAt)}</strong>
            </div>
            <div className="profile-meta-card">
              <span>Nivel de confianza</span>
              <strong>{venture.reputation.level}</strong>
            </div>
          </div>
        </section>

        <section className="two-column-layout">
          <article className="panel">
            <div className="section-heading">
              <h2>Redes públicas</h2>
              <Link className="button button--ghost" to={`/ventures/${venture.slug}/networks`}>
                Ver todo
              </Link>
            </div>
            <VentureSocialLinks
              socialLinks={venture.socialLinks}
              onNetworkClick={(network, url) => trackNetworkClick(venture.id, network, url)}
            />
          </article>

          <aside className="panel">
            <div className="section-heading">
              <h2>Acciones</h2>
            </div>
            <div className="stack">
              <FavoriteButton
                active={isFavorite(venture.id)}
                disabled={!currentUser}
                onClick={() => {
                  if (!currentUser) {
                    pushToast('Iniciá sesión para guardar este emprendimiento.', 'neutral')
                    return
                  }

                  toggleFavorite(venture.id)
                  pushToast('Favoritos actualizados.', 'success')
                }}
              />
              <FollowBackButton
                networks={followableNetworks}
                disabled={!currentUser || !currentVenture || currentVenture?.id === venture.id}
                onSelect={(network) => {
                  if (!currentUser || !currentVenture) {
                    pushToast('Completá tu perfil para usar Voseguime.', 'neutral')
                    return
                  }

                  try {
                    createFollowAction(venture, network)
                    pushToast('Solicitud enviada.', 'success')
                  } catch (error) {
                    pushToast(error instanceof Error ? error.message : 'No fue posible crear la solicitud.', 'danger')
                  }
                }}
              />
              <button className="button button--ghost" onClick={() => setShowReport(true)}>
                Reportar
              </button>
            </div>
            <div className="meta-grid">
              <div className="metric-card">
                <span>Apoyos recibidos</span>
                <strong>{venture.metrics.followersReceived}</strong>
              </div>
              <div className="metric-card">
                <span>Links abiertos</span>
                <strong>{venture.metrics.linkClicks}</strong>
              </div>
            </div>
          </aside>
        </section>

        {showReport ? (
          <ReportModal
            ventureName={venture.name}
            onClose={() => setShowReport(false)}
            onSubmit={(reason, description) => {
              try {
                reportVenture(venture.id, reason, description)
                pushToast('Reporte enviado.', 'success')
                setShowReport(false)
              } catch (error) {
                pushToast(error instanceof Error ? error.message : 'No fue posible reportar.', 'danger')
              }
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
