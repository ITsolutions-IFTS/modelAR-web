import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminUser } from '../types'
export type { UserRole } from '../types'

const SESSION_KEY = 'modelar_admin_session'

const CREDENTIALS: Record<string, { password: string; user: AdminUser }> = {
  'admin@santillana.com': {
    password: 'demo1234',
    user: { email: 'admin@santillana.com', name: 'Santillana Admin', role: 'client', org: 'Santillana' },
  },
  'admin@itsolutions.com': {
    password: 'demo1234',
    user: { email: 'admin@itsolutions.com', name: 'ITSolutions Admin', role: 'superadmin', org: 'ITSolutions' },
  },
}

interface AuthContextValue {
  user: AdminUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // sessionStorage: persiste mientras la pestaña esté abierta, se limpia al cerrarla
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      return stored ? (JSON.parse(stored) as AdminUser) : null
    } catch { return null }
  })

  function login(email: string, password: string): boolean {
    const entry = CREDENTIALS[email]
    if (entry && entry.password === password) {
      setUser(entry.user)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(entry.user))
      return true
    }
    return false
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
