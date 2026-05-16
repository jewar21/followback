import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../../components/LoadingState'
import { useAuth } from '../../hooks/useAuth'

export function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
