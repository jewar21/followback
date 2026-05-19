import { Bookmark } from 'lucide-react'

type FavoriteButtonProps = {
  active: boolean
  onClick: () => void
  disabled?: boolean
}

export function FavoriteButton({ active, onClick, disabled }: Readonly<FavoriteButtonProps>) {
  return (
    <button
      type="button"
      className={`button button--ghost${active ? ' button--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Bookmark size={16} />
      {active ? 'Guardado' : 'Guardar'}
    </button>
  )
}
