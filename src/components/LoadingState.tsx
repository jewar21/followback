export function LoadingState({ label = 'Cargando Voseguime...' }: { label?: string }) {
  return (
    <div className="state-card loading-state">
      <div className="loading-orb" />
      <p>{label}</p>
    </div>
  )
}
