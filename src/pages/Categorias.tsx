// src/pages/Categorias.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";
import { apiCategorias, Categoria } from "../services/apiCategorias";

export default function Categorias() {
  const gold = "#c3a24a";
  const panel = "rgba(12,12,12,0.35)";
  const softShadow = "rgba(0,0,0,0.35)";

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [modalEditar, setModalEditar] = useState<{ visible: boolean; id: string; valor: string }>({ visible: false, id: "", valor: "" });
  const [modalConfirm, setModalConfirm] = useState<{ visible: boolean; id: string }>({ visible: false, id: "" });
  const [urlInputs, setUrlInputs] = useState<{ [key: string]: string }>({}); // para guardar URL temporal

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
      setCategorias([...categorias, nueva]);
      setNuevaCategoria("");
    } catch (err) { console.error("❌ Error al crear categoría:", err); }
  };

  const handleGuardarEdicion = async () => {
    try {
      const actualizada = await actualizarCategoria(modalEditar.id, { nombre: modalEditar.valor });
      setCategorias(categorias.map(c => (c._id === modalEditar.id ? actualizada : c)));
      setModalEditar({ visible: false, id: "", valor: "" });
    } catch (err) {
      console.error("❌ Error al actualizar categoría:", err);
    }
  };

  const handleConfirmEliminar = async () => {
    try {
      await eliminarCategoria(modalConfirm.id);
      setCategorias(categorias.filter(c => c._id !== modalConfirm.id));
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
      setCategorias(categorias.map(c => (c._id === catId ? actualizada : c)));
      setUrlInputs({ ...urlInputs, [catId]: "" }); // limpiar input
    } catch (err) {
      console.error("❌ Error al actualizar imagen:", err);
    }
  };

  const styles: { [k: string]: React.CSSProperties } = {
    container: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px", minHeight: "100vh", textAlign: "center", color: gold, fontFamily: "'Orbitron', sans-serif", backgroundColor: "transparent", position: "relative", overflowX: "hidden" },
    bgImage: { position: "fixed", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(3px) brightness(0.75) contrast(0.95)", zIndex: -1 },
    bgOverlay: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.6) 100%)", zIndex: -1 },
    title: { fontSize: "3.2em", fontWeight: "bold", color: "rgba(255, 215, 128, 0.85)", textShadow: "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)", marginBottom: 10, animation: "fadeInUp 0.8s ease-out" },
    subtitle: { fontSize: "1.4em", fontWeight: 400, color: "rgba(255,255,255,0.75)", textShadow: "0 0 5px rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.2)", marginBottom: 28, animation: "fadeInUp 0.8s ease-out", animationDelay: "0.15s" },
    actions: { listStyle: "none", padding: 0, marginTop: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "12px", width: "100%", alignItems: "center" },
    btn: { background: panel, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", color: gold, padding: "12px 24px", border: "1px solid rgba(195,162,74,0.4)", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 16px ${softShadow}`, transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease", width: "80%", maxWidth: 300, textDecoration: "none", textAlign: "center", filter: "saturate(0.9)" },
    input: { padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(195,162,74,0.4)", background: "rgba(20,20,20,0.6)", color: "#fff", fontFamily: "'Orbitron', sans-serif", outline: "none", marginBottom: 12 },
    catItem: { padding: "14px 16px", borderRadius: 10, background: "rgba(20,20,20,0.6)", color: gold, boxShadow: `0 4px 10px ${softShadow}`, width: "80%", maxWidth: 300, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "column", gap: "8px" },
    imgPreview: { maxWidth: "120px", borderRadius: 6, marginTop: 4 },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 },
    modalContent: { background: "rgba(20,20,20,0.95)", padding: 24, borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, minWidth: 300, color: gold }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={styles.bgImage} />
      <div style={styles.bgOverlay} />

      <h1 style={styles.title}>Categorías</h1>
      <h2 style={styles.subtitle}>Crea, edita y organiza tu carta</h2>

      {/* Crear categoría */}
      <input style={styles.input} type="text" placeholder="Nueva categoría" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
      <button style={styles.btn} onClick={handleCrear}>Agregar categoría</button>

      {/* Lista de categorías */}
      <ul style={styles.actions}>
        {categorias.map((cat) => (
          <li key={cat._id} style={styles.catItem}>
            <div>{cat.nombre}</div>
            {cat.imagen && <img src={cat.imagen} alt={cat.nombre} style={styles.imgPreview} />}
            <input
              style={{ ...styles.input, marginTop: "8px" }}
              type="text"
              placeholder="URL de imagen"
              value={urlInputs[cat._id] || ""}
              onChange={(e) => handleUrlChange(cat._id, e.target.value)}
            />
            <button style={styles.btn} onClick={() => handleConfirmUrl(cat._id)}>Confirmar URL</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.btn} onClick={() => setModalEditar({ visible: true, id: cat._id, valor: cat.nombre })}>Editar</button>
              <button style={styles.btn} onClick={() => setModalConfirm({ visible: true, id: cat._id })}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Volver */}
      <Link to={ROUTES.dashboard}><button style={styles.btn}>Volver al Dashboard</button></Link>

      {/* Modal Editar */}
      {modalEditar.visible && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span>Editar categoría:</span>
            <input style={styles.input} value={modalEditar.valor} onChange={(e) => setModalEditar({ ...modalEditar, valor: e.target.value })} />
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={styles.btn} onClick={handleGuardarEdicion}>Guardar</button>
              <button style={styles.btn} onClick={() => setModalEditar({ visible: false, id: "", valor: "" })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalConfirm.visible && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span>¿Eliminar esta categoría?</span>
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
