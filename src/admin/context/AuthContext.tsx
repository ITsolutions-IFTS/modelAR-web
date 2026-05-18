import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminUser } from '../types'

const SESSION_KEY = SESSION_KEY
const MOCK_EMAIL = 'admin@santillana.com'
const MOCK_PASSWORD = 'demo1234'
const MOCK_USER: AdminUser = {
  email: 'admin@santillana.com',
  name: 'Administrador Santillana',
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
    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setUser(MOCK_USER)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(MOCK_USER))
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
