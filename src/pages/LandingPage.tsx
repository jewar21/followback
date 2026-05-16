import { ArrowRight, Globe2, HeartHandshake, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useVentures } from '../hooks/useVentures'

export function LandingPage() {
  const ventures = useVentures()

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero__content">
          <div className="hero-copy">
            <span className="eyebrow">Directorio inteligente de emprendimientos</span>
            <h1>Descubre emprendimientos, conecta con sus redes y crece en comunidad.</h1>
            <p>
              FollowBack es una red de apoyo visible donde marcas, artistas, creadores y negocios emergentes comparten sus
              perfiles sociales para ser encontrados, seguidos y contactados sin automatizar nada.
            </p>
            <div className="button-row">
              <Link className="button button--primary" to="/discover">
                Explorar emprendimientos
                <ArrowRight size={16} />
              </Link>
              <Link className="button button--ghost" to="/login">
                Crear mi perfil
              </Link>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-metric">
              <span>Emprendimientos visibles</span>
              <strong>{ventures.length}</strong>
            </div>
            <div className="hero-metric">
              <span>Redes listas para explorar</span>
              <strong>{ventures.reduce((count, venture) => count + Object.values(venture.socialLinks).filter(Boolean).length, 0)}</strong>
            </div>
            <div className="hero-metric">
              <span>Filosofia</span>
              <strong>Follow me and I will follow you.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="container highlight-grid">
        <article className="highlight-card">
          <HeartHandshake size={22} />
          <h3>Apoyo manual y transparente</h3>
          <p>No automatizamos follows. La plataforma organiza relaciones reales entre emprendimientos.</p>
        </article>
        <article className="highlight-card">
          <Globe2 size={22} />
          <h3>Redes en un solo lugar</h3>
          <p>Instagram, TikTok, sitios web, WhatsApp y mas en una ficha clara para descubrir y contactar.</p>
        </article>
        <article className="highlight-card">
          <Network size={22} />
          <h3>Mapa de comunidad</h3>
          <p>Visualiza nodos, conexiones y señales de reciprocidad para entender mejor tu ecosistema.</p>
        </article>
      </section>
    </div>
  )
}
