import { useState } from 'react'
import { Handshake } from 'lucide-react'
import { socialNetworkLabels, type FollowableNetwork } from '../lib/constants'

type FollowBackButtonProps = {
  networks: FollowableNetwork[]
  onSelect: (network: FollowableNetwork) => void
  disabled?: boolean
}

export function FollowBackButton({ networks, onSelect, disabled }: Readonly<FollowBackButtonProps>) {
  const [open, setOpen] = useState(false)

  if (networks.length === 0) {
    return (
      <button type="button" className="button button--ghost" disabled>
        Sin redes para marcar
      </button>
    )
  }

  function handleToggle() {
    setOpen((current) => !current)
  }

  function handleSelect(network: FollowableNetwork) {
    onSelect(network)
    setOpen(false)
  }

  return (
    <div className="dropdown">
      <button type="button" className="button button--secondary" onClick={handleToggle} disabled={disabled}>
        <Handshake size={16} />
        Ya lo seguí
      </button>
      {open ? (
        <div className="dropdown-panel">
          {networks.map((network) => (
            <button type="button" key={network} className="dropdown-item" onClick={() => handleSelect(network)}>
              {socialNetworkLabels[network]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
