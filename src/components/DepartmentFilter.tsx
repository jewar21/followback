type DepartmentFilterProps = {
  departments: string[]
  value: string
  onChange: (value: string) => void
}

export function DepartmentFilter({ departments, value, onChange }: DepartmentFilterProps) {
  return (
    <label className="field">
      <span>Departamento</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
    </label>
  )
}
