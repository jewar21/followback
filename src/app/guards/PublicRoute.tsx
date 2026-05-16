import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../../components/LoadingState'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useAuth } from '../../hooks/useAuth'

export function PublicRoute() {
  const { loading, user } = useAuth()
  const currentUser = useCurrentUser()

  if (loading) {
    return <LoadingState />
  }

  if (user && currentUser?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
