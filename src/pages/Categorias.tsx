import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";
import { apiCategorias, Categoria } from "../services/apiCategorias";

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [modalEditar, setModalEditar] = useState<{ visible: boolean; id: string; valor: string }>({ visible: false, id: "", valor: "" });
  const [modalConfirm, setModalConfirm] = useState<{ visible: boolean; id: string }>({ visible: false, id: "" });
  const [urlInputs, setUrlInputs] = useState<{ [key: string]: string }>({}); // URL temporal por tarjeta
  const { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } = apiCategorias;

  const cargarCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (err: unknown) {
      console.error("❌ Error al cargar categorías:", err);
    }
  }, [getCategorias]);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);

  const handleCrear = async () => {
    if (!nuevaCategoria.trim()) return;
    try {
      const nueva = await crearCategoria({ nombre: nuevaCategoria });
      setCategorias((prev) => [...prev, nueva]);
      setNuevaCategoria("");
    } catch (err) { console.error("❌ Error al crear categoría:", err); }
  };

  const handleGuardarEdicion = async () => {
    try {
      const actualizada = await actualizarCategoria(modalEditar.id, { nombre: modalEditar.valor });
      setCategorias((prev) => prev.map(c => (c._id === modalEditar.id ? actualizada : c)));
      setModalEditar({ visible: false, id: "", valor: "" });
    } catch (err) {
      console.error("❌ Error al actualizar categoría:", err);
    }
  };

  const handleConfirmEliminar = async () => {
    try {
      await eliminarCategoria(modalConfirm.id);
      setCategorias((prev) => prev.filter(c => c._id !== modalConfirm.id));
      setModalConfirm({ visible: false, id: "" });
    } catch (err) {
      console.error("❌ Error al eliminar categoría:", err);
    }
  };

  const handleUrlChange = (catId: string, value: string) => {
    setUrlInputs({ ...urlInputs, [catId]: value });
  };

  const handleConfirmUrl = async (catId: string) => {
    const url = urlInputs[catId];
    if (!url || !url.trim()) return;
    try {
      const actualizada = await actualizarCategoria(catId, {
        nombre: categorias.find(c => c._id === catId)?.nombre || "",
        imagen: url
      });
      setCategorias((prev) => prev.map(c => (c._id === catId ? actualizada : c)));
      setUrlInputs((prev) => ({ ...prev, [catId]: "" })); // limpiar input
    } catch (err) {
      console.error("❌ Error al actualizar imagen:", err);
    }
  };

  // ⬇️ NUEVO: quitar imagen existente
  const handleClearImage = async (catId: string) => {
    try {
      const actualizada = await actualizarCategoria(catId, {
        nombre: categorias.find(c => c._id === catId)?.nombre || "",
        imagen: "" // limpiar imagen (también funcionaría null si tu backend lo admite)
      });
      setCategorias((prev) => prev.map(c => (c._id === catId ? actualizada : c)));
      setUrlInputs((prev) => ({ ...prev, [catId]: "" }));
    } catch (err) {
      console.error("❌ Error al quitar imagen:", err);
    }
  };

  return (
    <div className="cats-wrap">
      {/* estilos PC-first, responsive y consistentes con el Dashboard */}
      <style>{`
        :root{
          --gold:#c3a24a;
          --gold-soft: rgba(195,162,74,.35);
          --panel: rgba(12,12,12,.35);
          --text-soft: rgba(255,255,255,.86);
        }
        .cats-wrap{
          min-height:100vh; display:flex; flex-direction:column; align-items:center;
          padding:40px 20px; color:var(--gold); font-family:'Orbitron', sans-serif;
          position:relative; overflow-x:hidden;
        }
        .cats-bg{
          position:fixed; inset:0;
          background-image:url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop');
          background-size:cover; background-position:center;
          filter:blur(2px) brightness(.6) contrast(.95);
          z-index:-2;
        }
        .cats-overlay{
          position:fixed; inset:0;
          background:radial-gradient(ellipse at 50% 30%, rgba(0,0,0,.2) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.7) 100%);
          z-index:-1;
        }

        .cats-header{
          width:min(1100px, 92vw); margin:0 auto 18px;
          display:flex; align-items:flex-end; justify-content:space-between; gap:16px;
          flex-wrap:wrap;
        }
        .cats-titles{
          display:flex; flex-direction:column; gap:6px;
        }
        .cats-title{
          margin:0; font-size:3.0em; font-weight:800; color:rgba(255,215,128,.88);
          text-shadow:0 0 6px rgba(255,215,128,.4), 0 0 12px rgba(255,215,128,.3), 0 0 20px rgba(255,215,128,.2);
        }
        .cats-sub{
          margin:0; font-size:1.15em; color:var(--text-soft);
          text-shadow:0 0 5px rgba(255,255,255,.35), 0 0 12px rgba(255,255,255,.2);
        }

        /* Toolbar crear */
        .cats-toolbar{
          display:flex; align-items:center; gap:10px; flex-wrap:wrap;
        }
        .cats-input{
          padding:12px 14px; min-width:280px; border-radius:12px; border:1px solid var(--gold-soft);
          background:rgba(20,20,20,.6); color:#fff; outline:none; font-size:1rem;
        }
        .btn{
          display:inline-flex; align-items:center; gap:10px;
          background:var(--panel); color:var(--gold); border:1px solid var(--gold-soft);
          border-radius:12px; padding:12px 16px; font-weight:800; cursor:pointer;
          box-shadow:0 6px 16px rgba(0,0,0,.35);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease;
          text-decoration:none;
        }
        .btn:hover{ transform:translateY(-2px); box-shadow:0 12px 26px rgba(0,0,0,.45); border-color: rgba(195,162,74,.6); }
        .btn:focus-visible{ outline:2px solid #ffd780; outline-offset:3px; }
        .btn-icon{
          display:inline-grid; place-items:center; width:38px; height:38px; border-radius:10px;
          border:1px solid var(--gold-soft); background:var(--panel); color:var(--gold); cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .btn-icon:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,.4); border-color: rgba(195,162,74,.6); }

        /* Grid de categorías */
        .cats-grid{
          width:min(1100px, 92vw); margin:18px auto 0;
          display:grid; gap:18px;
          grid-template-columns: repeat(2, minmax(280px, 1fr));
        }
        @media (min-width: 1024px){ .cats-grid{ grid-template-columns: repeat(3, minmax(300px, 1fr)); gap:20px; } }
        @media (min-width: 1400px){ .cats-grid{ grid-template-columns: repeat(4, minmax(280px, 1fr)); gap:22px; } }

        .cat-card{
          display:flex; flex-direction:column; gap:12px;
          border:1px solid var(--gold-soft); border-radius:14px; background:var(--panel);
          padding:16px; box-shadow:0 6px 16px rgba(0,0,0,.35);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          min-height:220px;
        }
        .cat-card:hover{ transform:translateY(-3px); box-shadow:0 12px 26px rgba(0,0,0,.45); border-color: rgba(195,162,74,.6); }
        .cat-top{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .cat-title{
          font-weight:800; font-size:1.05rem; color:rgba(255,215,128,.92);
          text-shadow:0 0 6px rgba(255,215,128,.25);
        }
        .cat-img{
          width:64px; height:64px; border-radius:12px; object-fit:cover; border:1px solid var(--gold-soft);
        }
        .cat-img.ph{
          display:grid; place-items:center; color:var(--text-soft); background:rgba(0,0,0,.35);
          font-size:1.2rem;
        }

        .cat-url-row{ display:flex; gap:10px; align-items:center; }
        .cat-url-input{
          flex:1; min-width:0; padding:10px 12px; border-radius:10px; border:1px solid var(--gold-soft);
          background:rgba(20,20,20,.6); color:#fff; outline:none; font-size:.95rem;
        }

        .cat-actions{ display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; }

        /* Modales */
        .modal{
          position:fixed; inset:0; background:rgba(0,0,0,.65); display:flex; align-items:center; justify-content:center; z-index:10;
        }
        .modal-card{
          width:min(520px, 92vw); background:rgba(20,20,20,.92); border:1px solid var(--gold-soft); border-radius:14px;
          padding:18px; color:var(--gold); display:flex; flex-direction:column; gap:12px;
          box-shadow:0 12px 28px rgba(0,0,0,.55);
        }
        .modal-actions{ display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; }

        /* Barra superior: volver */
        .cats-topbar{
          width:min(1100px, 92vw); margin:0 auto 12px; display:flex; justify-content:flex-start;
        }
      `}</style>

      <div className="cats-bg" aria-hidden="true" />
      <div className="cats-overlay" aria-hidden="true" />

      {/* Topbar: Volver */}
      <div className="cats-topbar">
        <Link to={ROUTES.dashboard} className="btn" aria-label="Volver al Dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline><line x1="9" y1="12" x2="21" y2="12"></line>
          </svg>
          Volver
        </Link>
      </div>

      {/* Header + Toolbar */}
      <div className="cats-header">
        <div className="cats-titles">
          <h1 className="cats-title">Categorías</h1>
          <p className="cats-sub">Crea, edita y organiza tu carta</p>
        </div>

        <div className="cats-toolbar" role="region" aria-label="Crear nueva categoría">
          <input
            className="cats-input"
            type="text"
            placeholder="Nueva categoría"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            aria-label="Nombre de nueva categoría"
          />
          <button className="btn" onClick={handleCrear}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar
          </button>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <section className="cats-grid" aria-live="polite">
        {categorias.map((cat) => {
          const urlTemp = urlInputs[cat._id] || "";
          return (
            <article className="cat-card" key={cat._id}>
              <div className="cat-top">
                <div className="cat-title">{cat.nombre}</div>
                {cat.imagen ? (
                  <img src={cat.imagen} alt={cat.nombre} className="cat-img" />
                ) : (
                  <div className="cat-img ph" aria-label="Sin imagen">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 16l5-5 4 4 5-5 4 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* URL de imagen inline */}
              <div className="cat-url-row">
                <input
                  className="cat-url-input"
                  type="text"
                  placeholder="URL de imagen"
                  value={urlTemp}
                  onChange={(e) => handleUrlChange(cat._id, e.target.value)}
                  aria-label={`URL de imagen para ${cat.nombre}`}
                />
                <button
                  className="btn-icon"
                  title="Confirmar URL de imagen"
                  aria-label={`Confirmar URL de imagen para ${cat.nombre}`}
                  onClick={() => handleConfirmUrl(cat._id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                {/* ⬇️ NUEVO: quitar imagen actual si existe */}
                {cat.imagen && (
                  <button
                    className="btn-icon"
                    title="Quitar imagen de la categoría"
                    aria-label={`Quitar imagen de ${cat.nombre}`}
                    onClick={() => handleClearImage(cat._id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6M14 11v6"></path>
                    </svg>
                  </button>
                )}
              </div>

              {/* Acciones */}
              <div className="cat-actions">
                <button
                  className="btn"
                  onClick={() => setModalEditar({ visible: true, id: cat._id, valor: cat.nombre })}
                  aria-label={`Editar ${cat.nombre}`}
                  title="Editar nombre"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                  </svg>
                  Editar
                </button>

                <button
                  className="btn"
                  onClick={() => setModalConfirm({ visible: true, id: cat._id })}
                  aria-label={`Eliminar ${cat.nombre}`}
                  title="Eliminar categoría"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6M14 11v6"></path>
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Modal Editar */}
      {modalEditar.visible && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Editar categoría">
          <div className="modal-card">
            <strong>Editar categoría</strong>
            <input
              className="cats-input"
              value={modalEditar.valor}
              onChange={(e) => setModalEditar({ ...modalEditar, valor: e.target.value })}
              aria-label="Nuevo nombre de la categoría"
            />
            <div className="modal-actions">
              <button className="btn" onClick={handleGuardarEdicion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Guardar
              </button>
              <button className="btn" onClick={() => setModalEditar({ visible: false, id: "", valor: "" })}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalConfirm.visible && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Eliminar categoría">
          <div className="modal-card">
            <strong>¿Eliminar esta categoría?</strong>
            <div className="modal-actions">
              <button className="btn" onClick={handleConfirmEliminar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Sí, eliminar
              </button>
              <button className="btn" onClick={() => setModalConfirm({ visible: false, id: "" })}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
