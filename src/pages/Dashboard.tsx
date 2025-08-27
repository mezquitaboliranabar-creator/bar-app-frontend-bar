import React from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";

const Dashboard: React.FC = () => {
  return (
    <div className="dash-wrap">
      {/* estilos específicos (PC-first pero responsive) */}
      <style>{`
        :root{
          --gold:#c3a24a;
          --gold-soft: rgba(195,162,74,.35);
          --text-soft: rgba(255,255,255,.85);
          --panel: rgba(12,12,12,.35);
        }
        .dash-wrap{
          min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:40px 20px; color:var(--gold); font-family:'Orbitron', sans-serif; position:relative; overflow-x:hidden;
        }
        .dash-bg{
          position:fixed; inset:0;
          background-image:url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop');
          background-size:cover; background-position:center;
          filter:blur(2px) brightness(.6) contrast(.95);
          z-index:-2;
        }
        .dash-overlay{
          position:fixed; inset:0;
          background:radial-gradient(ellipse at 50% 30%, rgba(0,0,0,.25) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.7) 100%);
          z-index:-1;
        }
        .dash-title{
          font-size:3.2em; font-weight:800; margin:0 0 .2em; color:rgba(255,215,128,.85);
          text-shadow:0 0 6px rgba(255,215,128,.4), 0 0 12px rgba(255,215,128,.3), 0 0 20px rgba(255,215,128,.2);
          text-align:center;
        }
        .dash-sub{
          font-size:1.2em; color:var(--text-soft); margin:0 0 24px; text-align:center;
          text-shadow:0 0 5px rgba(255,255,255,.35), 0 0 12px rgba(255,255,255,.2);
        }

        /* Grid de accesos */
        .dash-grid{
          display:grid; gap:18px;
          grid-template-columns: repeat(2, minmax(220px, 1fr));
          width:min(1100px, 92vw);
          margin: 0 auto;
        }
        @media (min-width: 920px){
          .dash-grid{ grid-template-columns: repeat(3, minmax(240px, 1fr)); gap:20px; }
        }
        @media (min-width: 1280px){
          .dash-grid{ grid-template-columns: repeat(5, minmax(220px, 1fr)); gap:22px; }
        }

        /* Tarjetas */
        .dash-card{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:14px; padding:20px 18px; text-decoration:none;
          border:1px solid var(--gold-soft); border-radius:14px; background:var(--panel);
          color:var(--gold); box-shadow:0 6px 16px rgba(0,0,0,.35);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease;
          min-height:160px;
        }
        .dash-card:hover{
          transform:translateY(-4px);
          box-shadow:0 12px 26px rgba(0,0,0,.45);
          filter:saturate(1.05);
          border-color: rgba(195,162,74,.6);
        }
        .dash-card:focus-visible{
          outline: 2px solid #ffd780; outline-offset: 3px;
        }
        .dash-icon{
          width:48px; height:48px; display:grid; place-items:center;
          filter: drop-shadow(0 0 10px rgba(255,215,128,.25));
        }
        .dash-label{
          font-weight:800; font-size:1.05rem; letter-spacing:.3px; text-align:center;
          color:rgba(255,215,128,.92);
          text-shadow:0 0 6px rgba(255,215,128,.25);
        }
        .dash-hint{
          font-size:.88rem; color:var(--text-soft); text-align:center; opacity:.9;
        }
      `}</style>

      <div className="dash-bg" aria-hidden="true" />
      <div className="dash-overlay" aria-hidden="true" />

      <h1 className="dash-title">Dashboard</h1>
      <h2 className="dash-sub">Panel de gestión del bar</h2>

      <nav className="dash-grid" aria-label="Accesos rápidos del panel">
        {/* Categorías */}
        <Link to={ROUTES.categorias} className="dash-card" aria-label="Gestionar Categorías">
          <span className="dash-icon" aria-hidden="true">
            {/* Grid / categorías */}
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.8" />
              <rect x="14" y="3" width="7" height="7" rx="1.8" />
              <rect x="3" y="14" width="7" height="7" rx="1.8" />
              <rect x="14" y="14" width="7" height="7" rx="1.8" />
            </svg>
          </span>
          <span className="dash-label">Categorías</span>
          <span className="dash-hint">Organiza el menú</span>
        </Link>

        {/* Bebidas */}
        <Link to={ROUTES.bebidas} className="dash-card" aria-label="Gestionar Bebidas">
          <span className="dash-icon" aria-hidden="true">
            {/* Copa / bebidas */}
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 3h16l-1.8 5.5a6 6 0 0 1-5.7 4H11.5A6 6 0 0 1 5.8 8.5L4 3Z" />
              <path d="M12 12v7" />
              <path d="M8 21h8" />
            </svg>
          </span>
          <span className="dash-label">Bebidas</span>
          <span className="dash-hint">Alta, precios y stock</span>
        </Link>

        {/* Promociones */}
        <Link to={ROUTES.promociones} className="dash-card" aria-label="Gestionar Promociones">
          <span className="dash-icon" aria-hidden="true">
            {/* Tag / promociones */}
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41 12 22l-9-9 8.59-8.59A2 2 0 0 1 13.41 4H20v6.59a2 2 0 0 1-.59 1.41Z" />
              <circle cx="7.5" cy="12.5" r="1.5" />
            </svg>
          </span>
          <span className="dash-label">Promociones</span>
          <span className="dash-hint">Descuentos y combos</span>
        </Link>

        {/* Mesas */}
        <Link to={ROUTES.mesas} className="dash-card" aria-label="Gestionar Mesas">
          <span className="dash-icon" aria-hidden="true">
            {/* Mesa / mesas */}
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="4" rx="1.8"/>
              <path d="M5 10v7M19 10v7M9 10v7M15 10v7" />
            </svg>
          </span>
          <span className="dash-label">Mesas</span>
          <span className="dash-hint">QR, estado y cierre</span>
        </Link>

        {/* Canciones / Spotify */}
        <Link to={ROUTES.spotify} className="dash-card" aria-label="Gestionar Canciones">
          <span className="dash-icon" aria-hidden="true">
            {/* Nota musical */}
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6-12v10" />
              <path d="M15 6 21 4v6l-6 2" />
            </svg>
          </span>
          <span className="dash-label">Canciones</span>
          <span className="dash-hint">Cola y requests</span>
        </Link>
      </nav>
    </div>
  );
};

export default Dashboard;
