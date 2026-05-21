import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { STORAGE_KEYS } from '../constants/storageKeys';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const dark = localStorage.getItem(STORAGE_KEYS.DARK_MODE) === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const ok = login(email, password);
    if (ok) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Credenciales incorrectas. Revisá el email y la contraseña.');
    }
  }

  return (
    <div className={`login-page${dark ? ' dark' : ''}`}>
      <div className="login-card">
        <div className="login-brand">
          <h1>model.ar</h1>
          <p>Plataforma AR para educación</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@itsolutions.com"
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
            admin@itsolutions.com / demo1234
            <br />
            (Superadmin — todas las orgs)
            <br />
            <br />
            admin@santillana.com / demo1234
            <br />
            (Cliente — Santillana)
            <br />
            <br />
            admin@vegadesarrollos.com / demo1234
            <br />
            (Cliente — Vega Desarrollos)
          </code>
        </div>
      </div>
    </div>
  );
}
