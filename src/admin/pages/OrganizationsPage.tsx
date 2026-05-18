import { NavLink } from 'react-router-dom'
import './OrganizationsPage.css'

const ORGS = [
  {
    slug: 'santillana',
    name: 'Santillana',
    description: 'Editorial educativa líder en Argentina. Campañas de AR para libros escolares.',
    campaigns: 4,
    views: 5464,
    color: 'org-santillana',
  },
  {
    slug: 'garbarino',
    name: 'Garbarino',
    description: 'Retail de electrónica y electrodomésticos. Experiencias AR para catálogo de productos.',
    campaigns: 0,
    views: 0,
    color: 'org-garbarino',
  },
  {
    slug: 'museo-mar',
    name: 'Museo Mar',
    description: 'Museo de Arte de Mar del Plata. Exhibiciones interactivas con modelos 3D en AR.',
    campaigns: 0,
    views: 0,
    color: 'org-museo-mar',
  },
]

interface OrgCardProps {
  org: typeof ORGS[0]
}

function OrgCard({ org }: OrgCardProps) {
  return (
    <div className={`org-card ${org.color}`}>
      <div className="org-card-header">
        <div className="org-avatar">{org.name[0]}</div>
        <div>
          <h3 className="org-name">{org.name}</h3>
          {org.campaigns > 0
            ? <span className="org-status org-status--active">Activa</span>
            : <span className="org-status org-status--pending">Pendiente</span>
          }
        </div>
      </div>
      <p className="org-description">{org.description}</p>
      <div className="org-stats">
        <div className="org-stat">
          <span className="org-stat-value">{org.campaigns}</span>
          <span className="org-stat-label">Campañas</span>
        </div>
        <div className="org-stat">
          <span className="org-stat-value">{org.views.toLocaleString('es-AR')}</span>
          <span className="org-stat-label">Vistas</span>
        </div>
      </div>
      {org.campaigns > 0
        ? <NavLink to={`/admin/organizaciones/${org.slug}`} className="org-btn org-btn--primary">Ver dashboard</NavLink>
        : <span className="org-btn org-btn--disabled">Próximamente</span>
      }
    </div>
  )
}

export function OrganizationsPage() {
  return (
    <div className="orgs-page">
      <div className="orgs-header">
        <h1>Organizaciones</h1>
        <p>Clientes activos y pendientes en la plataforma modelAR.</p>
      </div>
      <div className="orgs-grid">
        {ORGS.map(org => <OrgCard key={org.slug} org={org} />)}
      </div>
    </div>
  )
}
