import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const ok = login(email, password)
    if (ok) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError('Credenciales incorrectas. Revisá el email y la contraseña.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>modelAR Admin</h1>
          <p>Panel de administración — Santillana</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@santillana.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit-btn">
            Ingresar
          </button>
        </form>

        <div className="login-demo-hint">
          <p>Credenciales de demo</p>
          <code>
            admin@santillana.com
            <br />
            demo1234
          </code>
        </div>
      </div>
    </div>
  )
}
