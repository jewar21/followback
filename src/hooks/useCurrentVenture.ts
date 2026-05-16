import { useAppData } from '../app/providers/AppDataProvider'

export function useCurrentVenture() {
  return useAppData().currentVenture
}
