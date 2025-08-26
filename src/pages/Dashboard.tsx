import React from "react";
import { Link } from "react-router-dom";
import ROUTES from "../routes";

const Dashboard: React.FC = () => {
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
      backgroundColor: "transparent",
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
      fontSize: "3.2em",
      fontWeight: "bold",
      color: "rgba(255, 215, 128, 0.85)",
      textShadow:
        "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)",
      marginBottom: "20px",
    },
    subtitle: {
      fontSize: "1.4em",
      fontWeight: 400,
      color: "rgba(255,255,255,0.75)",
      textShadow:
        "0 0 5px rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.2)",
      marginBottom: "28px",
    },
    list: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
    },
    button: {
      background: "rgba(12,12,12,0.35)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      color: "#c3a24a",
      padding: "12px 24px",
      border: "1px solid rgba(195,162,74,0.4)",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
      transition:
        "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
      width: "220px",
      textAlign: "center" as const,
      margin: "0 auto",
    },
  };

  const handleHover = (e: React.MouseEvent<HTMLButtonElement>, hover: boolean) => {
    e.currentTarget.style.transform = hover ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = hover
      ? "0 10px 22px rgba(0,0,0,0.35)"
      : "0 6px 16px rgba(0,0,0,0.35)";
    e.currentTarget.style.filter = hover ? "saturate(1)" : "saturate(0.9)";
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      <h1 style={styles.title}>Dashboard</h1>
      <h2 style={styles.subtitle}>Panel de gestión del bar</h2>

      <ul style={styles.list}>
        <li>
          <Link to={ROUTES.categorias}>
            <button
              style={styles.button}
              onMouseOver={(e) => handleHover(e, true)}
              onMouseOut={(e) => handleHover(e, false)}
            >
              Gestionar Categorías
            </button>
          </Link>
        </li>
        <li>
          <Link to={ROUTES.bebidas}>
            <button
              style={styles.button}
              onMouseOver={(e) => handleHover(e, true)}
              onMouseOut={(e) => handleHover(e, false)}
            >
              Gestionar Bebidas
            </button>
          </Link>
        </li>
        <li>
          <Link to={ROUTES.promociones}>
            <button
              style={styles.button}
              onMouseOver={(e) => handleHover(e, true)}
              onMouseOut={(e) => handleHover(e, false)}
            >
              Gestionar Promociones
            </button>
          </Link>
        </li>
        <li>
          <Link to={ROUTES.mesas}>
            <button
              style={styles.button}
              onMouseOver={(e) => handleHover(e, true)}
              onMouseOut={(e) => handleHover(e, false)}
            >
              Gestionar Mesas
            </button>
          </Link>
        </li>
        <li>
          <Link to={ROUTES.spotify}>
            <button
              style={styles.button}
              onMouseOver={(e) => handleHover(e, true)}
              onMouseOut={(e) => handleHover(e, false)}
            >
              Gestionar Canciones
            </button>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Dashboard;
