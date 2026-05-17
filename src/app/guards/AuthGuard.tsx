import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../../components/LoadingState'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useAuth } from '../../hooks/useAuth'

export function AuthGuard() {
  const { user, loading } = useAuth()
  const currentUser = useCurrentUser()
  const location = useLocation()

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (currentUser?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
