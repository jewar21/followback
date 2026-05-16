import { socialNetworkLabels } from '../lib/constants'
import type { SocialNetworkName } from '../types/models'

type NetworkFilterProps = {
  value: string
  onChange: (value: string) => void
}

const networks = Object.keys(socialNetworkLabels) as SocialNetworkName[]

export function NetworkFilter({ value, onChange }: NetworkFilterProps) {
  return (
    <label className="field">
      <span>Red social</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todas</option>
        {networks.map((network) => (
          <option key={network} value={network}>
            {socialNetworkLabels[network]}
          </option>
        ))}
      </select>
    </label>
  )
}
