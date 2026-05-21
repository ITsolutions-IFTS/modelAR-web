import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const STEPS = [
  {
    num: '01',
    title: 'Creamos tu campaña',
    desc: 'Seleccionás el modelo 3D, configurás el QR y lo dejamos listo para imprimir en tus materiales.',
  },
  {
    num: '02',
    title: 'Lo publicás donde quieras',
    desc: 'Libros, catálogos físicos, cartelería, packaging o pantallas. El QR funciona en cualquier soporte.',
  },
  {
    num: '03',
    title: 'El usuario escanea y ve el 3D',
    desc: 'Sin apps que instalar. Solo la cámara del celular. La experiencia AR carga en segundos.',
  },
];

const CLIENTS = [
  {
    slug: 'vega',
    sector: 'Inmobiliaria & real estate',
    name: 'Vega Desarrollos',
    desc: 'Compradores de propiedades exploran departamentos y amenities en 3D a escala real desde el brochure o el sitio, antes de la primera visita.',
  },
  {
    slug: 'garbarino',
    sector: 'Retail & ecommerce',
    name: 'Garbarino',
    desc: 'Smart TVs, electrodomésticos y tecnología vistos en escala real desde el catálogo o la ficha del producto.',
  },
  {
    slug: 'museo-mar',
    sector: 'Cultura & turismo',
    name: 'Museo Mar',
    desc: 'Esculturas y obras digitales que cobran vida en las salas del museo, accesibles desde el celular del visitante.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const glow3Ref = useRef<HTMLDivElement>(null);

  // Parallax on hero globs
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (glow1Ref.current)
        glow1Ref.current.style.setProperty('--py', `${y * 0.18}px`);
      if (glow2Ref.current)
        glow2Ref.current.style.setProperty('--py', `${y * 0.26}px`);
      if (glow3Ref.current)
        glow3Ref.current.style.setProperty('--py', `${y * 0.12}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fade-in on scroll for sections
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp">
      <header className="lp-nav">
        <span className="lp-nav-brand">
          <span className="lp-nav-brand-accent">IT</span>Solutions AR
        </span>
        <nav className="lp-nav-links">
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/scan">Escanear QR</Link>
          <Link to="/admin/login" className="lp-nav-btn">
            Backoffice
          </Link>
        </nav>
      </header>

      <section className="lp-hero">
        <div ref={glow1Ref} className="lp-hero-glow lp-hero-glow--1" />
        <div ref={glow2Ref} className="lp-hero-glow lp-hero-glow--2" />
        <div ref={glow3Ref} className="lp-hero-glow lp-hero-glow--3" />
        <div className="lp-hero-content">
          <span className="lp-hero-tag">Realidad Aumentada para empresas</span>
          <h1 className="lp-hero-title">
            Transformá el mundo
            <br />
            físico en una
            <br />
            experiencia 3D
          </h1>
          <p className="lp-hero-sub">
            Integramos realidad aumentada (AR) en tus canales físicos.
            <br />
            Un QR en catálogos, packaging o cartelería permite a tus clientes
            <br />
            ver productos y espacios en 3D a escala real, directo desde
            <br />
            la cámara del celular. Sin apps, sin fricción.
          </p>
          <div className="lp-hero-ctas">
            <button
              className="lp-btn-primary"
              onClick={() => navigate('/catalogo')}
            >
              Ver demos
            </button>
            <button className="lp-btn-ghost" onClick={() => navigate('/scan')}>
              Escanear un QR
            </button>
          </div>
        </div>
      </section>

      <section className="lp-steps">
        <div className="lp-steps-inner lp-reveal">
          <p className="lp-label">Cómo funciona</p>
          <h2 className="lp-section-title">
            Tres pasos para llevar
            <br />
            cualquier producto al mundo 3D
          </h2>
          <div className="lp-steps-grid">
            {STEPS.map((s) => (
              <div key={s.num} className="lp-step">
                <span className="lp-step-num">{s.num}</span>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-clients">
        <div className="lp-clients-inner lp-reveal">
          <p className="lp-label">Clientes</p>
          <h2 className="lp-section-title">Empresas que ya lo usan</h2>
          <div className="lp-clients-grid">
            {CLIENTS.map((c) => (
              <div
                key={c.slug}
                className={`lp-client-card lp-client-card--${c.slug}`}
              >
                <span className="lp-client-sector">{c.sector}</span>
                <h3 className="lp-client-name">{c.name}</h3>
                <p className="lp-client-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <div className="lp-cta-glow-b" />
        <div className="lp-cta-glow-c" />
        <div className="lp-cta-inner lp-reveal">
          <h2 className="lp-cta-title">
            ¿Querés implementar AR
            <br />
            en tu empresa?
          </h2>
          <p className="lp-cta-sub">
            Trabajamos con editoriales, retailers, museos y cualquier industria
            que quiera conectar el mundo físico con experiencias digitales.
          </p>
          <a href="mailto:hola@itsolutions.com.ar" className="lp-btn-primary">
            Contactanos
          </a>
        </div>
      </section>

      <footer className="lp-footer">
        <span className="lp-footer-copy">© 2025 ITSolutions AR</span>
        <Link to="/admin/login" className="lp-footer-admin">
          Acceder al backoffice →
        </Link>
      </footer>
    </div>
  );
}
