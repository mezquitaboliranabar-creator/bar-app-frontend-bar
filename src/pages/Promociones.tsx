// Promociones.tsx
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

  // -------------------- Estilos (coincidir con el look & feel) --------------------
  const styles = {
    page: {
      display: "flex",
      flexDirection: "column" as const,
      minHeight: "100vh",
      padding: "40px 20px",
      color: "#c3a24a",
      fontFamily: "'Orbitron', sans-serif",
      position: "relative" as const,
      overflowX: "hidden" as const,
    },
    background: {
      content: "''",
      position: "fixed" as const,
      inset: 0,
      backgroundImage:
        "url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(2px) brightness(0.6) contrast(0.95)",
      zIndex: -1,
    },
    overlay: {
      content: "''",
      position: "fixed" as const,
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.7) 100%)",
      zIndex: -1,
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "24px",
    },
    title: {
      fontSize: "3.0em",
      fontWeight: "bold",
      color: "rgba(255, 215, 128, 0.88)",
      textShadow:
        "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)",
      margin: 0,
    },
    subtitle: {
      fontSize: "1.1em",
      fontWeight: 400,
      color: "rgba(255,255,255,0.75)",
      marginTop: "8px",
    },
    actionsBar: {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap" as const,
    },
    button: {
      background: "rgba(12,12,12,0.35)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      color: "#c3a24a",
      padding: "10px 18px",
      border: "1px solid rgba(195,162,74,0.4)",
      borderRadius: "12px",
      fontSize: "0.95rem",
      fontWeight: 700,
      cursor: "pointer" as const,
      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
      transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
    },
    card: {
      background: "rgba(12,12,12,0.35)",
      border: "1px solid rgba(195,162,74,0.28)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
      borderRadius: "16px",
      padding: "16px",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      maxWidth: "1100px",
      width: "100%",
      margin: "0 auto",
    },
    table: {
      width: "100%",
      borderCollapse: "separate" as const,
      borderSpacing: "0 10px",
    },
    th: {
      color: "rgba(255,255,255,0.8)",
      textAlign: "left" as const,
      padding: "8px 10px",
      fontSize: "0.95rem",
      fontWeight: 700,
      borderBottom: "1px solid rgba(195,162,74,0.25)",
    },
    tr: {
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(195,162,74,0.2)",
    },
    td: {
      color: "rgba(255,255,255,0.85)",
      padding: "12px 10px",
      verticalAlign: "middle" as const,
      borderTop: "1px solid rgba(195,162,74,0.14)",
      borderBottom: "1px solid rgba(195,162,74,0.14)",
      fontSize: "0.95rem",
    },
    thumb: {
      width: "90px",
      height: "54px",
      objectFit: "cover" as const,
      borderRadius: "8px",
      border: "1px solid rgba(195,162,74,0.35)",
      boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
    },
    toggle: {
      cursor: "pointer",
      transform: "scale(1.15)",
    },
    smallBtn: {
      padding: "6px 10px",
      fontSize: "0.88rem",
      borderRadius: "10px",
      border: "1px solid rgba(195,162,74,0.4)",
      background: "rgba(12,12,12,0.35)",
      color: "#c3a24a",
      cursor: "pointer",
      marginRight: "8px",
    },
    orderBox: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    },
    orderInput: {
      width: "64px",
      padding: "6px",
      borderRadius: "8px",
      border: "1px solid rgba(195,162,74,0.35)",
      background: "rgba(0,0,0,0.25)",
      color: "rgba(255,255,255,0.9)",
      fontFamily: "inherit",
    },
    // Modal
    modalBackdrop: {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modal: {
      width: "min(680px, 92vw)",
      background: "rgba(16,16,16,0.6)",
      border: "1px solid rgba(195,162,74,0.35)",
      borderRadius: "16px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      color: "rgba(255,255,255,0.9)",
      padding: "18px",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "12px",
    },
    field: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "6px",
      marginBottom: "12px",
    },
    label: {
      color: "rgba(255,255,255,0.8)",
      fontSize: "0.95rem",
      fontWeight: 700,
    },
    input: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid rgba(195,162,74,0.35)",
      background: "rgba(0,0,0,0.25)",
      color: "rgba(255,255,255,0.95)",
      fontFamily: "inherit",
      outline: "none",
    },
    textarea: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid rgba(195,162,74,0.35)",
      background: "rgba(0,0,0,0.25)",
      color: "rgba(255,255,255,0.95)",
      fontFamily: "inherit",
      minHeight: "80px",
      outline: "none",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    imgPreview: {
      width: "100%",
      height: "180px",
      objectFit: "cover" as const,
      borderRadius: "12px",
      border: "1px solid rgba(195,162,74,0.35)",
      boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "8px",
    },
    danger: {
      borderColor: "rgba(255,80,80,0.55)",
      color: "rgba(255,120,120,0.9)",
    },
    toast: {
      position: "fixed" as const,
      bottom: "18px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.65)",
      border: "1px solid rgba(195,162,74,0.35)",
      color: "rgba(255,255,255,0.9)",
      padding: "10px 14px",
      borderRadius: "10px",
      boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
      zIndex: 60,
      fontSize: "0.95rem",
    },
  };

  // -------------------- Helpers --------------------
  const handleHover = (e: React.MouseEvent<HTMLButtonElement>, hover: boolean) => {
    e.currentTarget.style.transform = hover ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = hover
      ? "0 10px 22px rgba(0,0,0,0.35)"
      : "0 6px 16px rgba(0,0,0,0.35)";
    e.currentTarget.style.filter = hover ? "saturate(1)" : "saturate(0.9)";
  };

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

  const closeModal = () => {
    setIsOpen(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

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
    <div style={styles.page}>
      <div style={styles.background} />
      <div style={styles.overlay} />

      <header style={styles.header}>
        <h1 style={styles.title}>Promociones</h1>
        <p style={styles.subtitle}>Gestiona el banner de promociones del cliente</p>
      </header>

      <div style={styles.actionsBar}>
        {/* ← Volver al Dashboard */}
        <Link to={ROUTES.dashboard}>
          <button
            style={styles.button}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
            title="Volver al Dashboard"
          >
            ← Volver
          </button>
        </Link>

        <button
          style={styles.button}
          onMouseOver={(e) => handleHover(e, true)}
          onMouseOut={(e) => handleHover(e, false)}
          onClick={openCreate}
        >
          + Nueva promoción
        </button>
        <button
          style={styles.button}
          onMouseOver={(e) => handleHover(e, true)}
          onMouseOut={(e) => handleHover(e, false)}
          onClick={loadPromos}
        >
          Recargar
        </button>
      </div>

      <section style={styles.card as React.CSSProperties}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.85)" }}>Cargando…</p>
        ) : error ? (
          <p style={{ color: "rgba(255,120,120,0.9)" }}>{error}</p>
        ) : sorted.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.8)" }}>No hay promociones aún.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Imagen</th>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Activa</th>
                <th style={styles.th}>Vigencia</th>
                <th style={styles.th}>Orden</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p._id} style={styles.tr as React.CSSProperties}>
                  <td style={styles.td}>
                    <img
                      src={p.imagenUrl}
                      alt={p.titulo}
                      style={styles.thumb}
                      onError={(e) => ((e.currentTarget.src = "https://picsum.photos/seed/fallback/300/160"))}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 700 }}>{p.titulo}</div>
                    {p.descripcion ? (
                      <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)" }}>{p.descripcion}</div>
                    ) : null}
                  </td>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={!!p.activa}
                      onChange={() => toggleActiva(p)}
                      style={styles.toggle}
                      title={p.activa ? "Desactivar" : "Activar"}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: "0.9rem" }}>
                      {p.inicia ? new Date(p.inicia).toLocaleString() : "—"} {" → "}
                      {p.termina ? new Date(p.termina).toLocaleString() : "—"}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.orderBox}>
                      <input
                        type="number"
                        defaultValue={p.orden ?? 0}
                        style={styles.orderInput}
                        onBlur={(e) => {
                          const val = Number(e.currentTarget.value);
                          if (!Number.isFinite(val)) return;
                          if (val === (p.orden ?? 0)) return;
                          updateOrden(p, val);
                        }}
                      />
                      <button
                        style={styles.smallBtn}
                        onClick={() => updateOrden(p, (p.orden ?? 0) - 1)}
                        title="Subir prioridad"
                      >
                        ↑
                      </button>
                      <button
                        style={styles.smallBtn}
                        onClick={() => updateOrden(p, (p.orden ?? 0) + 1)}
                        title="Bajar prioridad"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.smallBtn} onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button
                      style={{ ...styles.smallBtn, ...styles.danger }}
                      onClick={() => del(p._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal Crear/Editar */}
      {isOpen && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>
                {editingId ? "Editar promoción" : "Nueva promoción"}
              </h3>
              <button
                style={styles.smallBtn}
                onClick={closeModal}
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div style={styles.field}>
                <label style={styles.label}>Título *</label>
                <input
                  style={styles.input}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Happy Hour 2x1"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  style={styles.textarea}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Texto opcional"
                  maxLength={400}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Imagen (URL) *</label>
                  <input
                    style={styles.input}
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Activa</label>
                  <div>
                    <input
                      type="checkbox"
                      checked={activa}
                      onChange={(e) => setActiva(e.target.checked)}
                      style={styles.toggle}
                    />{" "}
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>
                      {activa ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Inicia</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={inicia ?? ""}
                    onChange={(e) => setInicia(e.target.value || null)}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Termina</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={termina ?? ""}
                    onChange={(e) => setTermina(e.target.value || null)}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Orden (menor = más arriba)</label>
                <input
                  style={styles.input}
                  type="number"
                  value={orden}
                  onChange={(e) => setOrden(Number(e.target.value || 0))}
                />
              </div>

              {imagenUrl ? (
                <img
                  style={styles.imgPreview}
                  src={imagenUrl}
                  alt="Preview"
                  onError={(e) => ((e.currentTarget.src = "https://picsum.photos/seed/fallback/600/300"))}
                />
              ) : null}

              {error ? (
                <div style={{ color: "rgba(255,120,120,0.9)" }}>{error}</div>
              ) : null}

              <div style={styles.footer}>
                <button
                  style={styles.smallBtn}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  style={styles.smallBtn}
                  onClick={save}
                  disabled={saving}
                  onMouseOver={(e) => handleHover(e, true)}
                  onMouseOut={(e) => handleHover(e, false)}
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
};

export default Promociones;
