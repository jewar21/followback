import { useAppData } from '../app/providers/AppDataProvider'

export function useCurrentUser() {
  return useAppData().currentUser
}
