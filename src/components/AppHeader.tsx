import { NavLink } from 'react-router-dom'

export function AppHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--header-h)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        background: 'rgba(11, 15, 22, 0.85)',
        borderBottom: '1px solid var(--line)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <NavLink
        to="/"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '1.0625rem',
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}
      >
        <span style={{ color: 'var(--accent)' }}>IT</span>Solutions AR
      </NavLink>

      <nav style={{ display: 'flex', gap: '0.25rem' }}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.35rem 0.875rem',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.825rem',
            fontWeight: 600,
            letterSpacing: '0.005em',
            color: isActive ? 'var(--accent)' : 'var(--text-2)',
            background: isActive ? 'rgba(155, 240, 11, 0.08)' : 'transparent',
            border: `1px solid ${isActive ? 'rgba(155, 240, 11, 0.25)' : 'transparent'}`,
            transition: 'all 120ms',
          })}
        >
          Catálogo
        </NavLink>
        <NavLink
          to="/scan"
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.35rem 0.875rem',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.825rem',
            fontWeight: 600,
            letterSpacing: '0.005em',
            color: isActive ? 'var(--accent)' : 'var(--text-2)',
            background: isActive ? 'rgba(155, 240, 11, 0.08)' : 'transparent',
            border: `1px solid ${isActive ? 'rgba(155, 240, 11, 0.25)' : 'transparent'}`,
            transition: 'all 120ms',
          })}
        >
          Escanear
        </NavLink>
      </nav>
    </header>
  )
}
