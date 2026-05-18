import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
