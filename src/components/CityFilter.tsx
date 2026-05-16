type CityFilterProps = {
  cities: string[]
  value: string
  onChange: (value: string) => void
}

export function CityFilter({ cities, value, onChange }: CityFilterProps) {
  return (
    <label className="field">
      <span>Ciudad</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todas</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </label>
  )
}
