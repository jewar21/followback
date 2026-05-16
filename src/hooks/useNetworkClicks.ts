import { useAppData } from '../app/providers/AppDataProvider'

export function useNetworkClicks(ventureId?: string) {
  const { database, currentVenture } = useAppData()
  const targetId = ventureId ?? currentVenture?.id

  return database.networkClicks.filter((click) => click.ventureId === targetId)
}
