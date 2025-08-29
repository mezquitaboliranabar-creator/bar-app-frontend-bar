// src/pages/Mesas.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";
import { apiMesas, Mesa } from "../services/apiMesas";

const REFRESH_MS = Number(process.env.REACT_APP_MESAS_REFRESH_MS || 4000);
type FiltroEstado = "todos" | "libre" | "ocupada" | "reservada";

const Mesas: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [numero, setNumero] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [closingId, setClosingId] = useState<string | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // “Pulse” 15s cuando cambie estado
  const [justChanged, setJustChanged] = useState<Record<string, number>>({});
  const changeTTL = 15000;

  // refs para evitar overlaps y comparar cambios
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const prevByIdRef = useRef<Record<string, Mesa>>({});

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // estilos inline
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 20px",
      minHeight: "100vh",
      textAlign: "center" as const,
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
    title: {
      fontSize: "3em",
      fontWeight: "bold",
      marginBottom: "6px",
      textShadow:
        "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)",
    },
    metrics: {
      marginBottom: 18,
      display: "flex",
      gap: 12,
      flexWrap: "wrap" as const,
      justifyContent: "center",
      fontSize: "1rem",
      color: "rgba(255,255,255,.9)",
    },
    actionsBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "18px",
      flexWrap: "wrap" as const,
      justifyContent: "center",
      alignItems: "center",
    },
    input: {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid rgba(195,162,74,0.4)",
      fontSize: "1rem",
      width: "160px",
      background: "rgba(0,0,0,.35)",
      color: "#e6d8a8",
    },
    button: {
      background: "rgba(12,12,12,0.35)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      color: "#c3a24a",
      padding: "10px 20px",
      border: "1px solid rgba(195,162,74,0.4)",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 700 as const,
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
      transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
    },
    filterBtn: (active: boolean) => ({
      background: active ? "rgba(195,162,74,0.3)" : "rgba(12,12,12,0.35)",
      border: "1px solid rgba(195,162,74,0.4)",
      color: "#c3a24a",
      padding: "8px 12px",
      borderRadius: 10,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      fontWeight: active ? 800 : 700,
    }) as React.CSSProperties,
    cardsContainer: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "20px",
      justifyContent: "center",
      marginTop: "20px",
    },
    card: {
      background: "rgba(12,12,12,0.35)",
      backdropFilter: "blur(6px)",
      borderRadius: "12px",
      padding: "16px",
      textAlign: "center" as const,
      width: "220px",
      position: "relative" as const,
    },
    pulseRing: {
      content: "''",
      position: "absolute" as const,
      inset: -4,
      borderRadius: 16,
      border: "1px solid rgba(195,162,74,.4)",
      pointerEvents: "none" as const,
      animation: "pulseRing 1.2s ease-in-out infinite",
    },
    qr: { width: "150px", height: "150px", marginTop: "10px", cursor: "pointer" },
    qrPlaceholder: {
      width: "150px",
      height: "150px",
      marginTop: "10px",
      borderRadius: "8px",
      border: "1px dashed rgba(195,162,74,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.9rem",
      opacity: 0.85,
      padding: "6px",
    },
    error: { color: "red", marginTop: "10px" },
    estadoBadge: (estado: Mesa["estado"], pulsing: boolean) => {
      let bg = "rgba(255, 215, 128, .15)";
      let color = "#ffd780";
      if (estado === "ocupada") {
        bg = "rgba(255, 99, 99, .15)";
        color = "#ff9c9c";
      } else if (estado === "libre") {
        bg = "rgba(99, 255, 155, .15)";
        color = "#9cffbe";
      }
      return {
        marginLeft: 6,
        fontSize: ".8rem",
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.15)",
        background: bg,
        color,
        boxShadow: pulsing ? "0 0 8px rgba(255,215,128,.45)" : "none",
        transition: "box-shadow .3s ease",
      } as React.CSSProperties;
    },
  };

  // CSS de animación pulse
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulseRing {
        0% { box-shadow: 0 0 0 0 rgba(195,162,74, .45); }
        70% { box-shadow: 0 0 0 12px rgba(195,162,74, 0); }
        100% { box-shadow: 0 0 0 0 rgba(195,162,74, 0); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // fetch con detección de cambios para “pulse”
  const fetchMesasSafe = async (opts?: { silent?: boolean }) => {
    try {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      if (!opts?.silent) setError("");

      const data = await apiMesas.getMesas();
      data.sort((a, b) => a.numero - b.numero);

      const prevById = prevByIdRef.current;
      const changes: string[] = [];
      for (const m of data) {
        const prev = prevById[m._id];
        if (!prev) {
          changes.push(m._id);
        } else if (prev.estado !== m.estado || prev.numero !== m.numero) {
          changes.push(m._id);
        }
      }

      if (changes.length) {
        setJustChanged((jc) => {
          const now = Date.now();
          const copy = { ...jc };
          for (const id of changes) copy[id] = now;
          return copy;
        });
      }

      prevByIdRef.current = Object.fromEntries(data.map((m) => [m._id, m]));
      if (mountedRef.current) setMesas(data);

      setJustChanged((jc) => {
        const now = Date.now();
        const copy: Record<string, number> = {};
        for (const [id, ts] of Object.entries(jc)) {
          if (now - ts < changeTTL * 2) copy[id] = ts;
        }
        return copy;
      });
    } catch (err: any) {
      if (mountedRef.current) setError(err?.message || "Error al obtener mesas");
    } finally {
      fetchingRef.current = false;
    }
  };

  // Cargar al montar
  useEffect(() => { fetchMesasSafe(); }, []);

  // Auto-refresh
  useEffect(() => {
    let interval: number | undefined;
    const tick = () => { if (!document.hidden) fetchMesasSafe({ silent: true }); };
    interval = window.setInterval(tick, REFRESH_MS);

    const onVis = () => { if (!document.hidden) fetchMesasSafe({ silent: true }); };
    const onFocus = () => fetchMesasSafe({ silent: true });
    const onOnline = () => fetchMesasSafe({ silent: true });

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const handleCrearMesa = async () => {
    if (!numero) { setError("El número de mesa es obligatorio"); return; }
    const n = Number(numero);
    if (!Number.isInteger(n) || n <= 0) { setError("Ingrese un número de mesa válido"); return; }

    setLoading(true);
    setError("");
    try {
      const resp = await apiMesas.crearMesa({ numero: n }); // { ok, mensaje, mesa }
      const nuevaMesa = resp.mesa;
      setMesas((prev) => [...prev, nuevaMesa].sort((a, b) => a.numero - b.numero));
      prevByIdRef.current = { ...prevByIdRef.current, [nuevaMesa._id]: nuevaMesa };
      setJustChanged((jc) => ({ ...jc, [nuevaMesa._id]: Date.now() }));
      setNumero("");
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la mesa");
    } finally {
      setLoading(false);
    }
  };

  const handleHover = (e: React.MouseEvent<HTMLButtonElement>, hover: boolean) => {
    e.currentTarget.style.transform = hover ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = hover
      ? "0 10px 22px rgba(0,0,0,0.35)"
      : "0 6px 16px rgba(0,0,0,0.35)";
    e.currentTarget.style.filter = hover ? "saturate(1)" : "saturate(0.9)";
  };

  const handleQrClick = (mesaId: string) => {
    const baseUrl =
      (process.env.REACT_APP_FRONTEND_URL as string) ||
      (process.env.REACT_APP_PUBLIC_URL as string) ||
      window.location.origin;
    window.open(`${baseUrl}/mesa/${mesaId}`, "_blank");
  };

  const handleCerrarMesa = async (mesa: Mesa) => {
    try {
      setClosingId(mesa._id);
      setError("");
      const resp = await apiMesas.cerrarMesa(mesa._id);
      setMesas((prev) =>
        prev.map((m) => (m._id === mesa._id ? { ...m, estado: resp.mesa.estado } : m))
      );
      prevByIdRef.current = {
        ...prevByIdRef.current,
        [mesa._id]: { ...(prevByIdRef.current[mesa._id] || mesa), estado: resp.mesa.estado },
      };
      setJustChanged((jc) => ({ ...jc, [mesa._id]: Date.now() }));
    } catch (err: any) {
      setError(err?.message || "No se pudo cerrar la mesa");
    } finally {
      setClosingId(null);
    }
  };

  // Filtro + búsqueda
  const mesasFiltradas = useMemo(() => {
    const byEstado = (m: Mesa) =>
      filtroEstado === "todos" ? true : m.estado === filtroEstado;
    const byNumero = (m: Mesa) =>
      !busqueda.trim()
        ? true
        : String(m.numero).toLowerCase().includes(busqueda.trim().toLowerCase());
    return mesas.filter((m) => byEstado(m) && byNumero(m));
  }, [mesas, filtroEstado, busqueda]);

  // Métricas
  const totalLibres = useMemo(() => mesas.filter(m => m.estado === "libre").length, [mesas]);
  const totalOcupadas = useMemo(() => mesas.filter(m => m.estado === "ocupada").length, [mesas]);
  const totalReservadas = useMemo(() => mesas.filter(m => m.estado === "reservada").length, [mesas]);

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      <h1 style={styles.title}>Gestión de Mesas</h1>

      <div style={styles.metrics}>
        <span>Libres: <strong>{totalLibres}</strong></span>
        <span>Ocupadas: <strong>{totalOcupadas}</strong></span>
        <span>Reservadas: <strong>{totalReservadas}</strong></span>
        <span>Total: <strong>{mesas.length}</strong></span>
      </div>

      {/* ← Volver + Filtros + Búsqueda + Crear mesa */}
      <div style={styles.actionsBar}>
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

        <button style={styles.filterBtn(filtroEstado === "todos")} onClick={() => setFiltroEstado("todos")}>Todos</button>
        <button style={styles.filterBtn(filtroEstado === "libre")} onClick={() => setFiltroEstado("libre")}>Libres</button>
        <button style={styles.filterBtn(filtroEstado === "ocupada")} onClick={() => setFiltroEstado("ocupada")}>Ocupadas</button>
        <button style={styles.filterBtn(filtroEstado === "reservada")} onClick={() => setFiltroEstado("reservada")}>Reservadas</button>

        <input
          type="text"
          placeholder="Buscar # mesa"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.input}
        />

        {/* === Crear mesa === */}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="Mesa #"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCrearMesa(); }}
          style={styles.input}
          title="Número de la nueva mesa"
        />
        <button
          style={styles.button}
          disabled={loading}
          onClick={handleCrearMesa}
          onMouseOver={(e) => handleHover(e, true)}
          onMouseOut={(e) => handleHover(e, false)}
          title="Crear nueva mesa"
        >
          {loading ? "Creando..." : "Crear mesa"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.cardsContainer}>
        {mesasFiltradas.map((mesa) => {
          const isClosing = closingId === mesa._id;
          const isLibre = mesa.estado === "libre";
          const pulsing = !!(justChanged[mesa._id] && Date.now() - justChanged[mesa._id] < changeTTL);

          return (
            <div key={mesa._id} style={styles.card}>
              {pulsing && <div style={styles.pulseRing as any} />}

              <h3>
                Mesa {mesa.numero}
                <span style={styles.estadoBadge(mesa.estado, pulsing)}>
                  {mesa.estado.toUpperCase()}
                </span>
              </h3>

              {mesa.qrCode ? (
                <img
                  src={mesa.qrCode}
                  alt={`QR Mesa ${mesa.numero}`}
                  style={styles.qr}
                  onClick={() => handleQrClick(mesa._id)}
                  title="Abrir enlace de esta mesa"
                />
              ) : (
                <div style={styles.qrPlaceholder} title="QR no disponible">
                  QR no disponible
                </div>
              )}

              <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
                <button
                  style={{ ...styles.button, opacity: isLibre ? 0.6 : 1 }}
                  disabled={isLibre || isClosing}
                  onClick={() => handleCerrarMesa(mesa)}
                  onMouseOver={(e) => handleHover(e, true)}
                  onMouseOut={(e) => handleHover(e, false)}
                  title="Cerrar mesa manualmente"
                >
                  {isClosing ? "Cerrando..." : "Cerrar mesa"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Mesas;
