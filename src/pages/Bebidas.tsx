import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";
import { apiCategorias, Categoria } from "../services/apiCategorias";
import { apiBebidas, Bebida } from "../services/apiBebidas";

export default function Bebidas() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [nuevaBebida, setNuevaBebida] = useState({ nombre: "", precio: 0, categoria: "" });

  const [modalEditar, setModalEditar] = useState<{ visible: boolean; bebida: Bebida | null }>({ visible: false, bebida: null });
  const [modalConfirm, setModalConfirm] = useState<{ visible: boolean; id: string }>({ visible: false, id: "" });

  const cargarCategorias = useCallback(async () => {
    try {
      const data = await apiCategorias.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("❌ Error al cargar categorías:", err);
    }
  }, []);

  const cargarBebidas = useCallback(async () => {
    try {
      const data = await apiBebidas.getBebidas();
      setBebidas(data);
    } catch (err) {
      console.error("❌ Error al cargar bebidas:", err);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
    cargarBebidas();
  }, [cargarCategorias, cargarBebidas]);

  const handleCrearBebida = async () => {
    if (!nuevaBebida.nombre.trim() || !nuevaBebida.categoria) return;
    try {
      const bebidaCreada = await apiBebidas.crearBebida(nuevaBebida);

      // Asignar objeto de categoría completo para render consistente
      const categoriaObj = categorias.find(
        c => c._id === (typeof bebidaCreada.categoria === "string" ? bebidaCreada.categoria : (bebidaCreada.categoria as any)._id)
      );
      if (categoriaObj) (bebidaCreada as any).categoria = categoriaObj;

      setBebidas(prev => [...prev, bebidaCreada].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNuevaBebida({ nombre: "", precio: 0, categoria: "" });
    } catch (err) {
      console.error("❌ Error al crear bebida:", err);
    }
  };

  const handleEditarBebida = async () => {
    if (!modalEditar.bebida) return;
    try {
      const actualizada = await apiBebidas.actualizarBebida(modalEditar.bebida._id, {
        nombre: modalEditar.bebida.nombre,
        precio: modalEditar.bebida.precio,
        categoria: (modalEditar.bebida.categoria as any)?._id || modalEditar.bebida.categoria,
      });

      const categoriaObj = categorias.find(
        c => c._id === (typeof actualizada.categoria === "string" ? actualizada.categoria : (actualizada.categoria as any)._id)
      );
      if (categoriaObj) (actualizada as any).categoria = categoriaObj;

      setBebidas(prev =>
        prev.map(b => (b._id === actualizada._id ? actualizada : b)).sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      setModalEditar({ visible: false, bebida: null });
    } catch (err) {
      console.error("❌ Error al actualizar bebida:", err);
    }
  };

  const handleConfirmEliminar = async () => {
    try {
      await apiBebidas.eliminarBebida(modalConfirm.id);
      setBebidas(prev => prev.filter(b => b._id !== modalConfirm.id));
      setModalConfirm({ visible: false, id: "" });
    } catch (err) {
      console.error("❌ Error al eliminar bebida:", err);
    }
  };

  // Agrupar por categoría para la grilla
  const groupedBebidas = bebidas.reduce((acc: Record<string, Bebida[]>, bebida) => {
    const cat = (bebida.categoria && (bebida.categoria as any).nombre) || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bebida);
    return acc;
  }, {});

  return (
    <div className="bed-wrap">
      <style>{`
        :root{
          --gold:#c3a24a;
          --gold-soft: rgba(195,162,74,.35);
          --panel: rgba(12,12,12,.35);
          --text-soft: rgba(255,255,255,.86);
        }
        .bed-wrap{
          min-height:100vh; display:flex; flex-direction:column; align-items:center;
          padding:40px 20px; color:var(--gold); font-family:'Orbitron', sans-serif;
          position:relative; overflow-x:hidden;
        }
        .bed-bg{
          position:fixed; inset:0;
          background-image:url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop');
          background-size:cover; background-position:center;
          filter:blur(2px) brightness(.6) contrast(.95);
          z-index:-2;
        }
        .bed-overlay{
          position:fixed; inset:0;
          background:radial-gradient(ellipse at 50% 30%, rgba(0,0,0,.2) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.7) 100%);
          z-index:-1;
        }

        /* Topbar volver */
        .bed-topbar{
          width:min(1100px, 92vw); margin:0 auto 12px; display:flex; justify-content:flex-start;
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

        /* Header + toolbar de creación */
        .bed-header{
          width:min(1100px, 92vw); margin:0 auto 18px;
          display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap;
        }
        .bed-titles{ display:flex; flex-direction:column; gap:6px; }
        .bed-title{
          margin:0; font-size:3.0em; font-weight:800; color:rgba(255,215,128,.88);
          text-shadow:0 0 6px rgba(255,215,128,.4), 0 0 12px rgba(255,215,128,.3), 0 0 20px rgba(255,215,128,.2);
        }
        .bed-sub{ margin:0; font-size:1.15em; color:var(--text-soft); text-shadow:0 0 5px rgba(255,255,255,.35), 0 0 12px rgba(255,255,255,.2); }

        .bed-toolbar{
          display:flex; align-items:center; gap:10px; flex-wrap:wrap;
        }
        .inp{
          padding:12px 14px; border-radius:12px; border:1px solid var(--gold-soft);
          background:rgba(20,20,20,.6); color:#fff; outline:none; font-size:1rem;
        }
        .inp-num{
          padding:12px 14px; border-radius:12px; border:1px solid var(--gold-soft);
          background:rgba(20,20,20,.6); color:#fff; outline:none; font-size:1rem;
          -moz-appearance: textfield;
        }
        .inp-num::-webkit-inner-spin-button, .inp-num::-webkit-outer-spin-button{
          -webkit-appearance: none; margin:0;
        }
        .sel{
          padding:12px 14px; border-radius:12px; border:1px solid var(--gold-soft);
          background:rgba(20,20,20,.6); color:#fff; outline:none; font-size:1rem;
        }

        /* Grid de categorías */
        .bed-grid{
          width:min(1100px, 92vw); margin:18px auto 0;
          display:grid; gap:18px;
          grid-template-columns: repeat(2, minmax(280px, 1fr));
        }
        @media (min-width: 1024px){ .bed-grid{ grid-template-columns: repeat(3, minmax(300px, 1fr)); gap:20px; } }
        @media (min-width: 1400px){ .bed-grid{ grid-template-columns: repeat(4, minmax(280px, 1fr)); gap:22px; } }

        .cat-card{
          display:flex; flex-direction:column; gap:12px;
          border:1px solid var(--gold-soft); border-radius:14px; background:var(--panel);
          padding:16px; box-shadow:0 6px 16px rgba(0,0,0,.35);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          min-height:220px;
        }
        .cat-card:hover{ transform:translateY(-3px); box-shadow:0 12px 26px rgba(0,0,0,.45); border-color: rgba(195,162,74,.6); }
        .cat-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .cat-name{
          font-weight:800; font-size:1.05rem; color:rgba(255,215,128,.92);
          text-shadow:0 0 6px rgba(255,215,128,.25);
        }

        /* Lista de bebidas dentro de la tarjeta de categoría */
        .items{
          display:grid; gap:10px;
          grid-template-columns: 1fr;
        }
        .item{
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          border:1px solid var(--gold-soft); border-radius:12px; background:rgba(0,0,0,.35);
          padding:10px 12px;
        }
        .item-name{ color:rgba(255,215,128,.95); font-weight:800; }
        .item-price{ color:var(--text-soft); font-size:.95rem; }
        .item-actions{ display:flex; gap:8px; }
        .btn-icon{
          display:inline-grid; place-items:center; width:38px; height:38px; border-radius:10px;
          border:1px solid var(--gold-soft); background:var(--panel); color:var(--gold); cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .btn-icon:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,.4); border-color: rgba(195,162,74,.6); }

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
      `}</style>

      <div className="bed-bg" aria-hidden="true" />
      <div className="bed-overlay" aria-hidden="true" />

      {/* Topbar: Volver */}
      <div className="bed-topbar">
        <Link to={ROUTES.dashboard} className="btn" aria-label="Volver al Dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline><line x1="9" y1="12" x2="21" y2="12"></line>
          </svg>
          Volver
        </Link>
      </div>

      {/* Header + Toolbar */}
      <div className="bed-header">
        <div className="bed-titles">
          <h1 className="bed-title">Bebidas</h1>
          <p className="bed-sub">Crea, edita y organiza tus bebidas</p>
        </div>

        <div className="bed-toolbar" role="region" aria-label="Crear nueva bebida">
          <input
            className="inp"
            type="text"
            placeholder="Nombre bebida"
            value={nuevaBebida.nombre}
            onChange={e => setNuevaBebida({ ...nuevaBebida, nombre: e.target.value })}
            aria-label="Nombre de la bebida"
          />
          <input
            className="inp-num"
            type="number"
            placeholder="Precio"
            value={nuevaBebida.precio}
            onChange={e => setNuevaBebida({ ...nuevaBebida, precio: Number(e.target.value) })}
            aria-label="Precio de la bebida"
          />
          <select
            className="sel"
            value={nuevaBebida.categoria}
            onChange={e => setNuevaBebida({ ...nuevaBebida, categoria: e.target.value })}
            aria-label="Categoría de la bebida"
          >
            <option value="">Selecciona categoría</option>
            {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </select>
          <button className="btn" onClick={handleCrearBebida} aria-label="Agregar bebida">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar
          </button>
        </div>
      </div>

      {/* Grid por categoría */}
      <section className="bed-grid" aria-live="polite">
        {Object.entries(groupedBebidas).map(([catNombre, bebidasCat]) => (
          <article className="cat-card" key={catNombre}>
            <div className="cat-head">
              <div className="cat-name">{catNombre}</div>
              <span aria-hidden="true">
                {/* Ícono de copa */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 3h16l-1.8 5.5a6 6 0 0 1-5.7 4H11.5A6 6 0 0 1 5.8 8.5L4 3Z" />
                  <path d="M12 12v7" />
                  <path d="M8 21h8" />
                </svg>
              </span>
            </div>

            <div className="items">
              {bebidasCat.map(b => (
                <div className="item" key={b._id}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-name">{b.nombre}</span>
                    <span className="item-price">${b.precio}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn-icon"
                      title="Editar bebida"
                      aria-label={`Editar ${b.nombre}`}
                      onClick={() => setModalEditar({ visible: true, bebida: b })}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                      </svg>
                    </button>

                    <button
                      className="btn-icon"
                      title="Eliminar bebida"
                      aria-label={`Eliminar ${b.nombre}`}
                      onClick={() => setModalConfirm({ visible: true, id: b._id })}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                        <path d="M10 11v6M14 11v6"></path>
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* Modal Editar */}
      {modalEditar.visible && modalEditar.bebida && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Editar bebida">
          <div className="modal-card">
            <strong>Editar bebida</strong>

            <input
              className="inp"
              value={modalEditar.bebida.nombre}
              onChange={e => setModalEditar({ visible: true, bebida: { ...modalEditar.bebida!, nombre: e.target.value } })}
              aria-label="Nombre de la bebida"
            />

            <input
              className="inp-num"
              type="number"
              value={modalEditar.bebida.precio}
              onChange={e => setModalEditar({ visible: true, bebida: { ...modalEditar.bebida!, precio: Number(e.target.value) } })}
              aria-label="Precio de la bebida"
            />

            <select
              className="sel"
              value={(modalEditar.bebida.categoria as any)?._id || ""}
              onChange={e => {
                const cat = categorias.find(c => c._id === e.target.value);
                if (cat) setModalEditar({ visible: true, bebida: { ...modalEditar.bebida!, categoria: cat } });
              }}
              aria-label="Categoría de la bebida"
            >
              {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>

            <div className="modal-actions">
              <button className="btn" onClick={handleEditarBebida}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Guardar
              </button>
              <button className="btn" onClick={() => setModalEditar({ visible: false, bebida: null })}>
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
        <div className="modal" role="dialog" aria-modal="true" aria-label="Eliminar bebida">
          <div className="modal-card">
            <strong>¿Eliminar esta bebida?</strong>
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

      {/* Fondo */}
      <div className="bed-bg" aria-hidden="true" />
      <div className="bed-overlay" aria-hidden="true" />
    </div>
  );
}
