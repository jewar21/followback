import { Link } from 'react-router-dom'
import { socialNetworkLabels } from '../lib/constants'
import { formatDateLabel } from '../lib/utils'
import type { FollowAction, Venture } from '../types/models'

type ReceivedFollowRequestsProps = {
  actions: FollowAction[]
  venturesById: Map<string, Venture>
  onReciprocate: (actionId: string) => void
  onReject: (actionId: string) => void
}

export function ReceivedFollowRequests({
  actions,
  venturesById,
  onReciprocate,
  onReject,
}: ReceivedFollowRequestsProps) {
  if (actions.length === 0) {
    return <p className="muted-text">Aun no has recibido solicitudes.</p>
  }

  return (
    <div className="request-list">
      {actions.map((action) => {
        const venture = venturesById.get(action.fromVentureId)
        return (
          <article key={action.id} className="request-card">
            <div>
              <h4>{venture?.name ?? 'Emprendimiento'}</h4>
              <p>
                Dice que te siguio por {socialNetworkLabels[action.network]} el {formatDateLabel(action.createdAt)}.
              </p>
            </div>
            <div className="button-row">
              {venture ? (
                <Link className="button button--ghost" to={`/ventures/${venture.slug}/networks`}>
                  Ver redes
                </Link>
              ) : null}
              {action.status === 'pending' ? (
                <>
                  <button className="button button--primary" onClick={() => onReciprocate(action.id)}>
                    Lo segui de vuelta
                  </button>
                  <button className="button button--ghost" onClick={() => onReject(action.id)}>
                    Rechazar
                  </button>
                </>
              ) : (
                <span className="status-pill">{action.status}</span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
