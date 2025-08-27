// src/pages/Promociones.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";
import {
  apiPromociones,
  Promocion,
  CrearPromocionInput,
  ActualizarPromocionInput,
  ListarPromocionesResponse,
} from "../services/apiPromociones";

const Promociones: React.FC = () => {
  // -------------------- Estado --------------------
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [activa, setActiva] = useState(true);
  const [inicia, setInicia] = useState<string | null>(null);  // datetime-local
  const [termina, setTermina] = useState<string | null>(null); // datetime-local
  const [orden, setOrden] = useState<number>(0);

  // -------------------- Helpers --------------------
  const isoToLocalInput = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const localInputToISO = (v?: string | null) => {
    if (!v) return undefined;
    const d = new Date(v);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitulo("");
    setDescripcion("");
    setImagenUrl("");
    setActiva(true);
    setInicia(null);
    setTermina(null);
    setOrden(0);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // -------------------- Data --------------------
  const loadPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp: ListarPromocionesResponse = await apiPromociones.listarPromociones({
        limit: 100,
        page: 1,
      });
      setPromos(resp.items || []);
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar promociones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------- Acciones --------------------
  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (p: Promocion) => {
    setEditingId(p._id);
    setTitulo(p.titulo || "");
    setDescripcion(p.descripcion || "");
    setImagenUrl(p.imagenUrl || "");
    setActiva(!!p.activa);
    setInicia(p.inicia ? isoToLocalInput(p.inicia) : null);
    setTermina(p.termina ? isoToLocalInput(p.termina) : null);
    setOrden(typeof p.orden === "number" ? p.orden : 0);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const save = async () => {
    if (!titulo.trim() || !imagenUrl.trim()) {
      setError("‘titulo’ e ‘imagenUrl’ son obligatorios");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payloadBase = {
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || undefined,
        imagenUrl: imagenUrl.trim(),
        activa,
        inicia: localInputToISO(inicia) ?? undefined,
        termina: localInputToISO(termina) ?? undefined,
        orden,
      };

      if (editingId) {
        await apiPromociones.actualizarPromocion(editingId, payloadBase as ActualizarPromocionInput);
        showToast("Promoción actualizada");
      } else {
        await apiPromociones.crearPromocion(payloadBase as CrearPromocionInput);
        showToast("Promoción creada");
      }
      closeModal();
      await loadPromos();
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar la promoción");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    const ok = window.confirm("¿Seguro que deseas eliminar esta promoción?");
    if (!ok) return;
    try {
      await apiPromociones.eliminarPromocion(id);
      showToast("Promoción eliminada");
      await loadPromos();
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar");
    }
  };

  const toggleActiva = async (p: Promocion) => {
    try {
      await apiPromociones.actualizarPromocion(p._id, { activa: !p.activa });
      await loadPromos();
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar el estado");
    }
  };

  const updateOrden = async (p: Promocion, nuevo: number) => {
    try {
      await apiPromociones.actualizarPromocion(p._id, { orden: nuevo });
      await loadPromos();
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar el orden");
    }
  };

  const sorted = useMemo(
    () => [...promos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [promos]
  );

  // -------------------- Render --------------------
  return (
    <div className="promo-wrap">
      <style>{`
        :root{
          --gold:#c3a24a;
          --gold-soft: rgba(195,162,74,.35);
          --panel: rgba(12,12,12,.35);
          --text-soft: rgba(255,255,255,.86);
        }
        .promo-wrap{
          min-height:100vh; display:flex; flex-direction:column; align-items:center;
          padding:40px 20px; color:var(--gold); font-family:'Orbitron', sans-serif;
          position:relative; overflow-x:hidden;
        }
        .promo-bg{
          position:fixed; inset:0;
          background-image:url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop');
          background-size:cover; background-position:center;
          filter:blur(2px) brightness(.6) contrast(.95);
          z-index:-2;
        }
        .promo-overlay{
          position:fixed; inset:0;
          background:radial-gradient(ellipse at 50% 30%, rgba(0,0,0,.2) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.7) 100%);
          z-index:-1;
        }

        /* Topbar volver + Actions */
        .promo-top{
          width:min(1100px, 92vw); margin:0 auto 12px; 
          display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;
        }
        .btn{
          display:inline-flex; align-items:center; gap:10px;
          background:var(--panel); color:var(--gold); border:1px solid var(--gold-soft);
          border-radius:12px; padding:10px 14px; font-weight:800; cursor:pointer;
          box-shadow:0 6px 16px rgba(0,0,0,.35);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease;
          text-decoration:none;
        }
        .btn:hover{ transform:translateY(-2px); box-shadow:0 12px 26px rgba(0,0,0,.45); border-color: rgba(195,162,74,.6); }
        .btn:focus-visible{ outline:2px solid #ffd780; outline-offset:3px; }

        .promo-actions{ display:flex; gap:10px; flex-wrap:wrap; }

        /* Header */
        .promo-header{
          width:min(1100px, 92vw); margin:0 auto 18px;
          display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap;
        }
        .promo-titles{ display:flex; flex-direction:column; gap:6px; }
        .promo-title{
          margin:0; font-size:3.0em; font-weight:800; color:rgba(255,215,128,.88);
          text-shadow:0 0 6px rgba(255,215,128,.4), 0 0 12px rgba(255,215,128,.3), 0 0 20px rgba(255,215,128,.2);
        }
        .promo-sub{ margin:0; font-size:1.1em; color:var(--text-soft); text-shadow:0 0 5px rgba(255,255,255,.35), 0 0 12px rgba(255,255,255,.2); }

        /* Card & Table */
        .card{
          width:min(1100px, 92vw); margin:0 auto;
          background:var(--panel); border:1px solid var(--gold-soft); border-radius:16px;
          box-shadow:0 12px 28px rgba(0,0,0,.35); backdrop-filter:blur(6px);
          padding:16px;
        }
        table{ width:100%; border-collapse:separate; border-spacing:0 10px; }
        thead th{
          color:rgba(255,255,255,.8); text-align:left; padding:8px 10px; font-size:.95rem; font-weight:800;
          border-bottom:1px solid rgba(195,162,74,.25);
        }
        tbody tr{ background:rgba(0,0,0,.25); border:1px solid rgba(195,162,74,.2); }
        td{
          color:rgba(255,255,255,.88); padding:12px 10px; vertical-align:middle; font-size:.95rem;
          border-top:1px solid rgba(195,162,74,.14); border-bottom:1px solid rgba(195,162,74,.14);
        }
        .thumb{
          width:90px; height:54px; object-fit:cover; border-radius:8px;
          border:1px solid var(--gold-soft); box-shadow:0 4px 10px rgba(0,0,0,.35);
        }

        .order-box{ display:inline-flex; align-items:center; gap:8px; }
        .order-input{
          width:68px; padding:6px; border-radius:10px; border:1px solid var(--gold-soft);
          background:rgba(0,0,0,.25); color:rgba(255,255,255,.9);
        }
        .btn-icon{
          display:inline-grid; place-items:center; width:36px; height:36px; border-radius:10px;
          border:1px solid var(--gold-soft); background:var(--panel); color:var(--gold); cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .btn-icon:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,.4); border-color: rgba(195,162,74,.6); }

        /* Modal */
        .modal-wrap{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:50; }
        .modal{
          width:min(680px, 92vw); background:rgba(16,16,16,.6); border:1px solid var(--gold-soft);
          border-radius:16px; box-shadow:0 18px 40px rgba(0,0,0,.55); backdrop-filter:blur(8px);
          color:rgba(255,255,255,.9); padding:18px;
        }
        .modal-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .field{ display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
        .label{ color:rgba(255,255,255,.8); font-size:.95rem; font-weight:800; }
        .inp, .txt{
          padding:10px 12px; border-radius:10px; border:1px solid var(--gold-soft);
          background:rgba(0,0,0,.25); color:rgba(255,255,255,.95); outline:none; font-family:inherit;
        }
        .txt{ min-height:80px; }
        .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .img-prev{
          width:100%; height:180px; object-fit:cover; border-radius:12px;
          border:1px solid var(--gold-soft); box-shadow:0 8px 18px rgba(0,0,0,.35);
        }
        .modal-actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:8px; flex-wrap:wrap; }

        .toast{
          position:fixed; bottom:18px; left:50%; transform:translateX(-50%);
          background:rgba(0,0,0,.65); border:1px solid var(--gold-soft); color:rgba(255,255,255,.92);
          padding:10px 14px; border-radius:10px; box-shadow:0 10px 20px rgba(0,0,0,.35); z-index:60; font-size:.95rem;
        }
      `}</style>

      {/* Fondo */}
      <div className="promo-bg" aria-hidden="true" />
      <div className="promo-overlay" aria-hidden="true" />

      {/* Topbar: Volver + Acciones rápidas */}
      <div className="promo-top">
        <Link to={ROUTES.dashboard} className="btn" aria-label="Volver al Dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline><line x1="9" y1="12" x2="21" y2="12"></line>
          </svg>
          Volver
        </Link>

        <div className="promo-actions">
          <button className="btn" onClick={openCreate} title="Nueva promoción">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva
          </button>
          <button className="btn" onClick={loadPromos} title="Recargar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path>
            </svg>
            Recargar
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="promo-header">
        <div className="promo-titles">
          <h1 className="promo-title">Promociones</h1>
          <p className="promo-sub">Gestiona el banner de promociones del cliente</p>
        </div>
      </div>

      {/* Card con tabla */}
      <section className="card" aria-live="polite">
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.85)" }}>Cargando…</p>
        ) : error ? (
          <p style={{ color: "rgba(255,120,120,0.9)" }}>{error}</p>
        ) : sorted.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.8)" }}>No hay promociones aún.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título</th>
                <th>Activa</th>
                <th>Vigencia</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={p.imagenUrl}
                      alt={p.titulo}
                      className="thumb"
                      onError={(e) => ((e.currentTarget.src = "https://picsum.photos/seed/fallback/300/160"))}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: "rgba(255,215,128,.95)" }}>{p.titulo}</div>
                    {p.descripcion ? (
                      <div style={{ fontSize: ".9rem", color: "rgba(255,255,255,.75)" }}>{p.descripcion}</div>
                    ) : null}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!p.activa}
                      onChange={() => toggleActiva(p)}
                      title={p.activa ? "Desactivar" : "Activar"}
                      aria-label={p.activa ? "Desactivar promoción" : "Activar promoción"}
                    />
                  </td>
                  <td>
                    <div style={{ fontSize: ".9rem" }}>
                      {p.inicia ? new Date(p.inicia).toLocaleString() : "—"} {" → "}
                      {p.termina ? new Date(p.termina).toLocaleString() : "—"}
                    </div>
                  </td>
                  <td>
                    <div className="order-box">
                      <input
                        type="number"
                        defaultValue={p.orden ?? 0}
                        className="order-input"
                        onBlur={(e) => {
                          const val = Number(e.currentTarget.value);
                          if (!Number.isFinite(val)) return;
                          if (val === (p.orden ?? 0)) return;
                          updateOrden(p, val);
                        }}
                        aria-label="Orden de la promoción"
                      />
                      <button className="btn-icon" onClick={() => updateOrden(p, (p.orden ?? 0) - 1)} title="Subir prioridad" aria-label="Subir prioridad">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      </button>
                      <button className="btn-icon" onClick={() => updateOrden(p, (p.orden ?? 0) + 1)} title="Bajar prioridad" aria-label="Bajar prioridad">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-icon" onClick={() => openEdit(p)} title="Editar" aria-label="Editar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>
                      </button>
                      <button className="btn-icon" onClick={() => del(p._id)} title="Eliminar" aria-label="Eliminar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6M14 11v6"></path>
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal Crear/Editar */}
      {isOpen && (
        <div className="modal-wrap" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editingId ? "Editar promoción" : "Nueva promoción"}>
            <div className="modal-head">
              <h3 style={{ margin: 0 }}>{editingId ? "Editar promoción" : "Nueva promoción"}</h3>
              <button className="btn" onClick={closeModal} title="Cerrar" aria-label="Cerrar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Cerrar
              </button>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div className="field">
                <label className="label">Título *</label>
                <input className="inp" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Happy Hour 2x1" />
              </div>

              <div className="field">
                <label className="label">Descripción</label>
                <textarea className="txt" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Texto opcional" maxLength={400} />
              </div>

              <div className="grid2">
                <div className="field">
                  <label className="label">Imagen (URL) *</label>
                  <input className="inp" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="field">
                  <label className="label">Activa</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} />
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>{activa ? "Sí" : "No"}</span>
                  </div>
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label className="label">Inicia</label>
                  <input className="inp" type="datetime-local" value={inicia ?? ""} onChange={(e) => setInicia(e.target.value || null)} />
                </div>
                <div className="field">
                  <label className="label">Termina</label>
                  <input className="inp" type="datetime-local" value={termina ?? ""} onChange={(e) => setTermina(e.target.value || null)} />
                </div>
              </div>

              <div className="field">
                <label className="label">Orden (menor = más arriba)</label>
                <input className="inp" type="number" value={orden} onChange={(e) => setOrden(Number(e.target.value || 0))} />
              </div>

              {imagenUrl ? (
                <img className="img-prev" src={imagenUrl} alt="Preview" onError={(e) => ((e.currentTarget.src = "https://picsum.photos/seed/fallback/600/300"))} />
              ) : null}

              {error ? <div style={{ color: "rgba(255,120,120,0.9)" }}>{error}</div> : null}

              <div className="modal-actions">
                <button className="btn" onClick={closeModal} disabled={saving}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Cancelar
                </button>
                <button className="btn" onClick={save} disabled={saving} title="Guardar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Promociones;
