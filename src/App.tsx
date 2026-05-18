import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { ARPage } from './pages/ARPage'
import { ScanPage } from './pages/ScanPage'
import { AuthProvider } from './admin/context/AuthContext'
import { CampaignsProvider } from './admin/context/CampaignsContext'
import { ProtectedRoute } from './admin/components/ProtectedRoute'
import { AdminLayout } from './admin/components/AdminLayout'
import { LoginPage } from './admin/pages/LoginPage'
import { DashboardPage } from './admin/pages/DashboardPage'
import { CampaignFormPage } from './admin/pages/CampaignFormPage'
import { CampaignQRPage } from './admin/pages/CampaignQRPage'

function AppShell() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <AppHeader />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/ar/:uid" element={<ARPage />} />
        <Route path="/scan" element={<ScanPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/campanas/nueva" element={<CampaignFormPage />} />
            <Route path="/admin/campanas/:id/qr" element={<CampaignQRPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CampaignsProvider>
          <AppShell />
        </CampaignsProvider>
      </AuthProvider>
    </HashRouter>
  )
}
