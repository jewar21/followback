import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../../components/LoadingState'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useAuth } from '../../hooks/useAuth'

export function AdminGuard() {
  const { loading, user } = useAuth()
  const currentUser = useCurrentUser()

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
