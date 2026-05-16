import { useAppData } from '../app/providers/AppDataProvider'

export function useFollowActions() {
  const { currentUser, database } = useAppData()

  return {
    sent: currentUser
      ? database.followActions.filter((item) => item.fromUserId === currentUser.uid)
      : [],
    received: currentUser
      ? database.followActions.filter((item) => item.toUserId === currentUser.uid)
      : [],
  }
}
