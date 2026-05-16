import { ventureCategories } from '../lib/constants'

type CategoryFilterProps = {
  value: string
  onChange: (value: string) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <label className="field">
      <span>Categoria</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todas</option>
        {ventureCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  )
}
