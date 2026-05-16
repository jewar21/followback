export function LoadingState({ label = 'Cargando FollowBack...' }: { label?: string }) {
  return (
    <div className="state-card loading-state">
      <div className="loading-orb" />
      <p>{label}</p>
    </div>
  )
}
