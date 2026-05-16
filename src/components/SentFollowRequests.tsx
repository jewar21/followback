import { socialNetworkLabels } from '../lib/constants'
import { formatDateLabel } from '../lib/utils'
import type { FollowAction, Venture } from '../types/models'

type SentFollowRequestsProps = {
  actions: FollowAction[]
  venturesById: Map<string, Venture>
  onCancel: (actionId: string) => void
}

export function SentFollowRequests({ actions, venturesById, onCancel }: SentFollowRequestsProps) {
  if (actions.length === 0) {
    return <p className="muted-text">Todavia no has enviado solicitudes.</p>
  }

  return (
    <div className="request-list">
      {actions.map((action) => (
        <article key={action.id} className="request-card">
          <div>
            <h4>{venturesById.get(action.toVentureId)?.name ?? 'Emprendimiento'}</h4>
            <p>
              {socialNetworkLabels[action.network]} • {action.status} • {formatDateLabel(action.createdAt)}
            </p>
          </div>
          {action.status === 'pending' ? (
            <button className="button button--ghost" onClick={() => onCancel(action.id)}>
              Cancelar
            </button>
          ) : (
            <span className="status-pill">{action.status}</span>
          )}
        </article>
      ))}
    </div>
  )
}
