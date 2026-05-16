import { Link } from 'react-router-dom'

type EmptyStateProps = {
  title: string
  description: string
  ctaLabel?: string
  ctaTo?: string
}

export function EmptyState({ title, description, ctaLabel, ctaTo }: EmptyStateProps) {
  return (
    <div className="state-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {ctaLabel && ctaTo ? (
        <Link className="button button--primary" to={ctaTo}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  )
}
