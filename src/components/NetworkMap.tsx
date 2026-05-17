import type { NetworkEdge, NetworkNode } from '../types/models'

type NetworkMapProps = {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

export function NetworkMap({ nodes, edges }: NetworkMapProps) {
  if (nodes.length === 0) {
    return <p className="muted-text">No hay nodos para mostrar con los filtros actuales.</p>
  }

  const width = 920
  const height = 560
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.32
  const positions = new Map(
    nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / nodes.length
      return [
        node.id,
        {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      ]
    }),
  )

  return (
    <div className="network-map-card">
      <svg viewBox={`0 0 ${width} ${height}`} className="network-map">
        {edges.map((edge) => {
          const source = positions.get(edge.source)
          const target = positions.get(edge.target)
          if (!source || !target) {
            return null
          }

          return (
            <line
              key={`${edge.source}-${edge.target}-${edge.network}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edge.status === 'reciprocated' ? 'rgba(255, 173, 96, 0.95)' : 'rgba(91, 228, 183, 0.45)'}
              strokeWidth={edge.status === 'reciprocated' ? 3 : 1.5}
            />
          )
        })}
        {nodes.map((node) => {
          const position = positions.get(node.id)
          if (!position) {
            return null
          }

          return (
            <g key={node.id}>
              <circle cx={position.x} cy={position.y} r="34" fill="rgba(13, 22, 41, 0.88)" stroke="rgba(91, 228, 183, 0.7)" strokeWidth="2" />
              <text x={position.x} y={position.y - 6} textAnchor="middle" className="network-map-label">
                {node.label}
              </text>
              <text x={position.x} y={position.y + 14} textAnchor="middle" className="network-map-meta">
                {node.city}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="network-map-legend">
        <span>
          <i className="legend-dot legend-dot--solid" />
          Seguimiento recíproco
        </span>
        <span>
          <i className="legend-dot" />
          Solicitud pendiente
        </span>
      </div>
    </div>
  )
}
