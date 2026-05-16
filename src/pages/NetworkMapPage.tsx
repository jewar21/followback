import { useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import { CategoryFilter } from '../components/CategoryFilter'
import { CityFilter } from '../components/CityFilter'
import { NetworkFilter } from '../components/NetworkFilter'
import { NetworkMap } from '../components/NetworkMap'

export function NetworkMapPage() {
  const { database, publishedVentures } = useAppData()
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [network, setNetwork] = useState('')

  const cities = Array.from(new Set(publishedVentures.map((venture) => venture.city).filter(Boolean))).sort()
  const nodes = publishedVentures
    .filter((venture) => !category || venture.category === category)
    .filter((venture) => !city || venture.city === city)
    .filter((venture) => !network || Boolean(venture.socialLinks[network as keyof typeof venture.socialLinks]))
    .map((venture) => ({
      id: venture.id,
      label: venture.name,
      category: venture.category,
      city: venture.city,
      logoURL: venture.logoURL,
    }))

  const allowedNodeIds = new Set(nodes.map((node) => node.id))
  const edges = database.followActions
    .filter(
      (
        action,
      ): action is typeof action & {
        status: 'pending' | 'reciprocated'
      } => action.status === 'pending' || action.status === 'reciprocated',
    )
    .filter((action) => allowedNodeIds.has(action.fromVentureId) && allowedNodeIds.has(action.toVentureId))
    .filter((action) => !network || action.network === network)
    .map((action) => ({
      source: action.fromVentureId,
      target: action.toVentureId,
      network: action.network,
      status: action.status,
    }))

  return (
    <div className="page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">Network map</span>
          <h1>Visualiza la red de apoyo</h1>
          <p>Nodos para emprendimientos. Lineas para solicitudes y followbacks completados.</p>
        </div>
        <section className="panel filter-panel">
          <div className="form-grid">
            <CategoryFilter value={category} onChange={setCategory} />
            <CityFilter cities={cities} value={city} onChange={setCity} />
            <NetworkFilter value={network} onChange={setNetwork} />
          </div>
        </section>
        <NetworkMap nodes={nodes} edges={edges} />
      </div>
    </div>
  )
}
