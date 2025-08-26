import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ← nuevo
import ROUTES from "../routes"; // ← nuevo
import { apiMesas, Mesa } from "../services/apiMesas";

const Mesas: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [numero, setNumero] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Cargar mesas existentes
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const data = await apiMesas.getMesas();
        data.sort((a, b) => a.numero - b.numero);
        setMesas(data);
      } catch (err: any) {
        setError(err?.message || "Error al obtener mesas");
      }
    };
    fetchMesas();
  }, []);

  const handleCrearMesa = async () => {
    if (!numero) {
      setError("El número de mesa es obligatorio");
      return;
    }
    const n = Number(numero);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Ingrese un número de mesa válido");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const resp = await apiMesas.crearMesa({ numero: n }); // { ok, mensaje, mesa }
      const nuevaMesa = resp.mesa;
      setMesas((prev) => [...prev, nuevaMesa].sort((a, b) => a.numero - b.numero));
      setNumero("");
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la mesa");
    } finally {
      setLoading(false);
    }
  };

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
      marginBottom: "20px",
      textShadow:
        "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)",
    },
    actionsBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "18px",
      flexWrap: "wrap" as const,
      justifyContent: "center",
    },
    input: {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid rgba(195,162,74,0.4)",
      marginRight: "10px",
      fontSize: "1rem",
      width: "160px",
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
    cardsContainer: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "20px",
      justifyContent: "center",
      marginTop: "30px",
    },
    card: {
      background: "rgba(12,12,12,0.35)",
      backdropFilter: "blur(6px)",
      borderRadius: "12px",
      padding: "16px",
      textAlign: "center" as const,
      width: "200px",
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
  };

  const handleHover = (e: React.MouseEvent<HTMLButtonElement>, hover: boolean) => {
    e.currentTarget.style.transform = hover ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = hover
      ? "0 10px 22px rgba(0,0,0,0.35)"
      : "0 6px 16px rgba(0,0,0,0.35)";
    e.currentTarget.style.filter = hover ? "saturate(1)" : "saturate(0.9)";
  };

  // Si tienes una ruta de detalle /mesa/:id en el front, puedes abrirla aquí
  const handleQrClick = (mesaId: string) => {
    const baseUrl =
      process.env.REACT_APP_FRONTEND_URL ||
      process.env.REACT_APP_PUBLIC_URL ||
      window.location.origin;
    window.open(`${baseUrl}/mesa/${mesaId}`, "_blank");
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      <h1 style={styles.title}>Gestión de Mesas</h1>

      {/* ← Volver al Dashboard */}
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
      </div>

      <div>
        <input
          type="number"
          placeholder="Número de mesa"
          value={numero}
          onChange={(e) => {
            setNumero(e.target.value);
            if (error) setError(""); // limpia error al escribir
          }}
          style={styles.input}
          min={1}
        />
        <button
          style={styles.button}
          onClick={handleCrearMesa}
          disabled={loading}
          onMouseOver={(e) => handleHover(e, true)}
          onMouseOut={(e) => handleHover(e, false)}
        >
          {loading ? "Creando..." : "Crear Mesa"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.cardsContainer}>
        {mesas.map((mesa) => (
          <div key={mesa._id} style={styles.card}>
            <h3>Mesa {mesa.numero}</h3>

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

            <p>{mesa.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mesas;
