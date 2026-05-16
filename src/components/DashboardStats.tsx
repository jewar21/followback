import { dashboardMetricLabels } from '../lib/constants'
import { formatCompactMetric } from '../lib/utils'
import type { Venture } from '../types/models'

export function DashboardStats({ venture }: { venture: Venture }) {
  return (
    <div className="stats-grid">
      {Object.entries(venture.metrics).map(([key, value]) => (
        <article key={key} className="metric-card">
          <span>{dashboardMetricLabels[key as keyof typeof dashboardMetricLabels]}</span>
          <strong>{formatCompactMetric(value)}</strong>
        </article>
      ))}
    </div>
  )
}
