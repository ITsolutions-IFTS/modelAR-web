import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { HomePage } from './pages/HomePage'
import { ARPage } from './pages/ARPage'
import { ScanPage } from './pages/ScanPage'

export default function App() {
  return (
    <HashRouter>
      <AppHeader />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/ar/:uid"  element={<ARPage />} />
        <Route path="/scan"     element={<ScanPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
