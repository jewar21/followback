import { useAppData } from '../app/providers/AppDataProvider'

export function useVentures() {
  return useAppData().publishedVentures
}
