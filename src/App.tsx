import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { ARPage } from './pages/ARPage';
import { ScanPage } from './pages/ScanPage';
import { AuthProvider } from './admin/context/AuthContext';
import { CampaignsProvider } from './admin/context/CampaignsContext';
import { CollectionsProvider } from './admin/context/CollectionsContext';
import { OrganizationsProvider } from './admin/context/OrganizationsContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { AdminLayout } from './admin/components/AdminLayout';
import { ConfirmProvider } from './components/ConfirmDialog';
import { LoginPage } from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { CampaignsPage } from './admin/pages/CampaignsPage';
import { CampaignFormPage } from './admin/pages/CampaignFormPage';
import { CampaignQRPage } from './admin/pages/CampaignQRPage';
import { MetricsPage } from './admin/pages/MetricsPage';
import { OrganizationsPage } from './admin/pages/OrganizationsPage';
import { CollectionsPage } from './admin/pages/CollectionsPage';

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLanding = location.pathname === '/';

  return (
    <div className={isAdmin ? undefined : 'public-site'}>
      {!isAdmin && !isLanding && <AppHeader />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalogo" element={<HomePage />} />
        <Route path="/ar/:uid" element={<ARPage />} />
        <Route path="/scan" element={<ScanPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/organizaciones" replace />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/organizaciones"
              element={<OrganizationsPage />}
            />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/metricas" element={<MetricsPage />} />
            <Route path="/admin/campanas" element={<CampaignsPage />} />
            <Route
              path="/admin/campanas/nueva"
              element={<CampaignFormPage />}
            />
            <Route path="/admin/campanas/:id/qr" element={<CampaignQRPage />} />
            <Route path="/admin/colecciones" element={<CollectionsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ConfirmProvider>
        <AuthProvider>
          <OrganizationsProvider>
            <CampaignsProvider>
              <CollectionsProvider>
                <AppShell />
              </CollectionsProvider>
            </CampaignsProvider>
          </OrganizationsProvider>
        </AuthProvider>
      </ConfirmProvider>
    </HashRouter>
  );
}
