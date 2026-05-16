import { useState } from 'react'
import { Handshake } from 'lucide-react'
import { socialNetworkLabels } from '../lib/constants'
import type { SocialNetworkName } from '../types/models'

type FollowableNetwork = Extract<
  SocialNetworkName,
  'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'spotify' | 'x' | 'linkedin' | 'website' | 'whatsapp'
>

type FollowBackButtonProps = {
  networks: FollowableNetwork[]
  onSelect: (network: FollowableNetwork) => void
  disabled?: boolean
}

export function FollowBackButton({ networks, onSelect, disabled }: FollowBackButtonProps) {
  const [open, setOpen] = useState(false)

  if (networks.length === 0) {
    return (
      <button className="button button--ghost" disabled>
        Sin redes followback
      </button>
    )
  }

  return (
    <div className="dropdown">
      <button className="button button--secondary" onClick={() => setOpen((current) => !current)} disabled={disabled}>
        <Handshake size={16} />
        Ya lo segui
      </button>
      {open ? (
        <div className="dropdown-panel">
          {networks.map((network) => (
            <button
              key={network}
              className="dropdown-item"
              onClick={() => {
                onSelect(network)
                setOpen(false)
              }}
            >
              {socialNetworkLabels[network]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
