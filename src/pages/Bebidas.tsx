// src/pages/Bebidas.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";
import { apiCategorias, Categoria } from "../services/apiCategorias";
import { apiBebidas, Bebida } from "../services/apiBebidas";

export default function Bebidas() {
  const gold = "#c3a24a";
  const panel = "rgba(12,12,12,0.35)";
  const softShadow = "rgba(0,0,0,0.35)";

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

      // Asignar objeto completo de categoría
      const categoriaObj = categorias.find(
        c => c._id === (typeof bebidaCreada.categoria === "string" ? bebidaCreada.categoria : bebidaCreada.categoria._id)
      );
      if (categoriaObj) bebidaCreada.categoria = categoriaObj;

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

      // Asignar objeto completo de categoría
      const categoriaObj = categorias.find(
        c => c._id === (typeof actualizada.categoria === "string" ? actualizada.categoria : actualizada.categoria._id)
      );
      if (categoriaObj) actualizada.categoria = categoriaObj;

      setBebidas(prev => prev.map(b => (b._id === actualizada._id ? actualizada : b)).sort((a, b) => a.nombre.localeCompare(b.nombre)));
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

  const groupedBebidas = bebidas.reduce((acc: Record<string, Bebida[]>, bebida) => {
    const cat = bebida.categoria ? bebida.categoria.nombre : "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bebida);
    return acc;
  }, {});

  const styles: { [k: string]: React.CSSProperties } = {
    container: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px", minHeight: "100vh", textAlign: "center", color: gold, fontFamily: "'Orbitron', sans-serif", backgroundColor: "transparent", position: "relative", overflowX: "hidden" },
    bgImage: { position: "fixed", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(3px) brightness(0.75) contrast(0.95)", zIndex: -1 },
    bgOverlay: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.6) 100%)", zIndex: -1 },
    title: { fontSize: "3.2em", fontWeight: "bold", color: "rgba(255, 215, 128, 0.85)", textShadow: "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)", marginBottom: 10, animation: "fadeInUp 0.8s ease-out" },
    subtitle: { fontSize: "1.4em", fontWeight: 400, color: "rgba(255,255,255,0.75)", textShadow: "0 0 5px rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.2)", marginBottom: 28, animation: "fadeInUp 0.8s ease-out", animationDelay: "0.15s" },
    actions: { listStyle: "none", padding: 0, marginTop: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "12px", width: "100%", alignItems: "center" },
    btn: { background: panel, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", color: gold, padding: "12px 24px", border: "1px solid rgba(195,162,74,0.4)", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 16px ${softShadow}`, transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease", width: "80%", maxWidth: 300, textDecoration: "none", textAlign: "center", filter: "saturate(0.9)" },
    input: { padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(195,162,74,0.4)", background: "rgba(20,20,20,0.6)", color: "#fff", fontFamily: "'Orbitron', sans-serif", outline: "none", marginBottom: 12 },
    inputNumber: { padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(195,162,74,0.4)", background: "rgba(20,20,20,0.6)", color: "#fff", fontFamily: "'Orbitron', sans-serif", outline: "none", marginBottom: 12, MozAppearance: "textfield", WebkitAppearance: "none" },
    catItem: { padding: "10px 14px", borderRadius: 10, background: "rgba(20,20,20,0.6)", color: gold, boxShadow: `0 4px 10px ${softShadow}`, width: "80%", maxWidth: 300, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "column", gap: "6px" },
    select: { padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(195,162,74,0.4)", background: "rgba(20,20,20,0.6)", color: "#fff", fontFamily: "'Orbitron', sans-serif", outline: "none", marginBottom: 12 },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 },
    modalContent: { background: "rgba(20,20,20,0.95)", padding: 24, borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, minWidth: 300, color: gold }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div style={styles.bgImage} />
      <div style={styles.bgOverlay} />

      <h1 style={styles.title}>Bebidas</h1>
      <h2 style={styles.subtitle}>Crea, edita y organiza tus bebidas</h2>

      {/* Crear bebida */}
      <input style={styles.input} type="text" placeholder="Nombre bebida" value={nuevaBebida.nombre} onChange={e => setNuevaBebida({ ...nuevaBebida, nombre: e.target.value })} />
      <input
        style={styles.inputNumber}
        type="number"
        placeholder="Precio"
        value={nuevaBebida.precio}
        onChange={e => setNuevaBebida({ ...nuevaBebida, precio: Number(e.target.value) })}
      />
      <select style={styles.select} value={nuevaBebida.categoria} onChange={e => setNuevaBebida({ ...nuevaBebida, categoria: e.target.value })}>
        <option value="">Selecciona categoría</option>
        {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
      </select>
      <button style={styles.btn} onClick={handleCrearBebida}>Agregar bebida</button>

      {/* Lista de bebidas agrupadas */}
      <ul style={styles.actions}>
        {Object.entries(groupedBebidas).map(([catNombre, bebidasCat]) => (
          <li key={catNombre} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ color: gold, marginBottom: 6 }}>{catNombre}</h3>
            {bebidasCat.map(b => (
              <div key={b._id} style={styles.catItem}>
                <div>{b.nombre} - ${b.precio}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.btn} onClick={() => setModalEditar({ visible: true, bebida: b })}>Editar</button>
                  <button style={styles.btn} onClick={() => setModalConfirm({ visible: true, id: b._id })}>Eliminar</button>
                </div>
              </div>
            ))}
          </li>
        ))}
      </ul>

      {/* Volver */}
      <Link to={ROUTES.dashboard}><button style={styles.btn}>Volver al Dashboard</button></Link>

      {/* Modal Editar */}
      {modalEditar.visible && modalEditar.bebida && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span>Editar bebida:</span>
            <input style={styles.input} value={modalEditar.bebida.nombre} onChange={e => setModalEditar({ visible: true, bebida: { ...modalEditar.bebida!, nombre: e.target.value } })} />
            <input style={styles.inputNumber} type="number" value={modalEditar.bebida.precio} onChange={e => setModalEditar({ visible: true, bebida: { ...modalEditar.bebida!, precio: Number(e.target.value) } })} />
            <select
              style={styles.select}
              value={(modalEditar.bebida.categoria as any)?._id || ""}
              onChange={e => {
                const cat = categorias.find(c => c._id === e.target.value);
                if (cat) setModalEditar({ visible: true, bebida: { ...modalEditar.bebida!, categoria: cat } });
              }}
            >
              {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={styles.btn} onClick={handleEditarBebida}>Guardar</button>
              <button style={styles.btn} onClick={() => setModalEditar({ visible: false, bebida: null })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalConfirm.visible && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span>¿Eliminar esta bebida?</span>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={styles.btn} onClick={handleConfirmEliminar}>Sí</button>
              <button style={styles.btn} onClick={() => setModalConfirm({ visible: false, id: "" })}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
