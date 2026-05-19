import { useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import { CategoryFilter } from '../components/CategoryFilter'
import { CityFilter } from '../components/CityFilter'
import { DepartmentFilter } from '../components/DepartmentFilter'
import { NetworkFilter } from '../components/NetworkFilter'
import { NetworkMap } from '../components/NetworkMap'
import { useSEO } from '../hooks/useSEO'
import { PRIMARY_COUNTRY_NAME } from '../lib/geo'
import { formatLocationLabel } from '../lib/utils'

function isNonEmptyString(value: string | undefined): value is string {
  return Boolean(value)
}

export function NetworkMapPage() {
  const { database, publishedVentures } = useAppData()
  useSEO({
    title: 'Mapa de comunidad',
    description: 'Visualizá las conexiones entre emprendimientos de Colombia. Explorá nodos, redes y señales de reciprocidad en el ecosistema Voseguime.',
    path: '/network-map',
  })
  const [category, setCategory] = useState('')
  const [department, setDepartment] = useState('')
  const [city, setCity] = useState('')
  const [network, setNetwork] = useState('')

  const colombiaVentures = publishedVentures.filter((venture) => venture.country === PRIMARY_COUNTRY_NAME)
  const departments = Array.from(
    new Set(colombiaVentures.map((venture) => venture.department).filter(isNonEmptyString)),
  ).sort((a, b) => a.localeCompare(b))
  const cities = Array.from(
    new Set(
      colombiaVentures
        .filter((venture) => !department || venture.department === department)
        .map((venture) => venture.city)
        .filter(isNonEmptyString),
    ),
  ).sort((a, b) => a.localeCompare(b))
  const nodes = colombiaVentures
    .filter((venture) => !category || venture.category === category)
    .filter((venture) => !department || venture.department === department)
    .filter((venture) => !city || venture.city === city)
    .filter((venture) => !network || Boolean(venture.socialLinks[network as keyof typeof venture.socialLinks]))
    .map((venture) => ({
      id: venture.id,
      label: venture.name,
      category: venture.category,
      city: formatLocationLabel({
        city: venture.city,
        department: venture.department,
        country: venture.country,
      }),
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
          <h1>Visualizá la red de apoyo</h1>
          <p>Nodos para emprendimientos de Colombia. Líneas para solicitudes y seguimientos recíprocos completados.</p>
        </div>
        <section className="panel filter-panel">
          <div className="form-grid">
            <CategoryFilter value={category} onChange={setCategory} />
            <DepartmentFilter departments={departments} value={department} onChange={setDepartment} />
            <CityFilter cities={cities} value={city} onChange={setCity} />
            <NetworkFilter value={network} onChange={setNetwork} />
          </div>
        </section>
        <NetworkMap nodes={nodes} edges={edges} />
      </div>
    </div>
  )
}
