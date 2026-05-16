import { EmptyState } from '../components/EmptyState'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="container">
        <EmptyState
          title="Ruta no encontrada"
          description="La pagina que buscas no existe en este despliegue."
          ctaLabel="Volver al inicio"
          ctaTo="/"
        />
      </div>
    </div>
  )
}
