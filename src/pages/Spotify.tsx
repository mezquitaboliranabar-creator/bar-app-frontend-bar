// src/pages/Spotify.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { barMusic } from "../services/barMusic";
import { api } from "../services/api";

type Device = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  supports_volume: boolean;
  type: string;
  volume_percent: number;
};

type DevicesResp = { ok: boolean; devices: Device[] };
type StatusResp = { ok: boolean; status: any };
type QueueResp = { ok: boolean; queue: { currently_playing?: any; queue?: any[] } };
type SettingsResp = { ok: boolean; settings?: { preferredDeviceId?: string; preferredDeviceName?: string } };
type RequestsResp = { ok: boolean; items: SongRequest[]; total: number };
type RequestStatus = "queued" | "approved" | "playing" | "rejected" | "done";

/** Mesa puede venir como id (string) o poblada desde el backend */
type MesaPopulada = { _id: string; numero?: number | string; nombre?: string; name?: string };
type MesaRef = string | MesaPopulada;

type SongRequest = {
  _id: string;
  trackUri: string;
  title: string;
  artist: string;
  imageUrl?: string;
  requestedBy: { sessionId: string; mesaId?: MesaRef };
  status: RequestStatus;
  votes: number;
  createdAt: string;
};

const API_URL = process.env.REACT_APP_API_URL || "";

/* ====== Iconos SVG (gold, minimal) ====== */
const iconProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "currentColor" } as const;
const IconPlay = () => <svg {...iconProps}><path d="M8 5v14l11-7-11-7z" /></svg>;
const IconPause = () => (
  <svg {...iconProps}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
const IconNext = () => (
  <svg {...iconProps}>
    <path d="M6 6v12l9-6-9-6z" /><rect x="17" y="5" width="2" height="14" rx="1" />
  </svg>
);
const IconPrev = () => (
  <svg {...iconProps}>
    <path d="M18 6v12l-9-6 9-6z" /><rect x="5" y="5" width="2" height="14" rx="1" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "32px 20px",
    minHeight: "100vh",
    color: "#c3a24a",
    fontFamily: "'Orbitron', sans-aserif",
    position: "relative",
    overflowX: "hidden",
  },
  background: {
    content: "''",
    position: "fixed",
    inset: 0,
    backgroundImage:
      "url('https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=1475&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(1px) brightness(0.75) contrast(1)",
    zIndex: -1,
  },
  overlay: {
    content: "''",
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.7) 100%)",
    zIndex: -1,
  },
  headerWrap: {
    position: "relative",
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    background: "rgba(12,12,12,0.35)",
    color: "#c3a24a",
    padding: "10px 16px",
    border: "1px solid rgba(195,162,74,0.4)",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
    textDecoration: "none",
  },
  title: {
    fontSize: "2.6em",
    fontWeight: 800,
    color: "rgba(255, 215, 128, 0.9)",
    textShadow:
      "0 0 6px rgba(255,215,128,0.4), 0 0 12px rgba(255,215,128,0.3), 0 0 20px rgba(255,215,128,0.2)",
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    fontSize: "1.1em",
    fontWeight: 400,
    color: "rgba(255,255,255,0.8)",
    margin: 0,
    marginBottom: "18px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  card: {
    background: "rgba(12,12,12,0.35)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid rgba(195,162,74,0.35)",
    borderRadius: "14px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    padding: "16px",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 800,
    marginBottom: "12px",
    color: "rgba(255,215,128,0.9)",
  },
  button: {
    background: "rgba(12,12,12,0.35)",
    color: "#c3a24a",
    padding: "10px 16px",
    border: "1px solid rgba(195,162,74,0.4)",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
  },
  iconBtn: {
    background: "rgba(12,12,12,0.35)",
    color: "rgba(255, 215, 128, 0.95)",
    width: 48,
    height: 44,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(195,162,74,0.45)",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
  },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  select: {
    background: "rgba(0,0,0,0.5)",
    color: "#e6d8a8",
    border: "1px solid rgba(195,162,74,0.35)",
    borderRadius: "10px",
    padding: "10px 12px",
    minWidth: "260px",
  },
  small: { fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" },
  th: { textAlign: "left", color: "rgba(255,215,128,0.9)", fontWeight: 800, padding: "0 8px" },
  td: {
    padding: "8px",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(195,162,74,0.25)",
    borderRadius: "10px",
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid rgba(195,162,74,0.25)",
  },
  slider: { width: 180 },
};

function useInterval(callback: () => void, delayMs: number | null) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; }, [callback]);
  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => saved.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

function msToMinSec(ms: number | undefined) {
  if (!ms && ms !== 0) return "--:--";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/* Helpers para matching flexible (por si la URI no coincide) */
const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, " ")
    .trim();

const matchesByText = (req: SongRequest, meta: { name?: string; artist?: string }) => {
  const rt = norm(req.title);
  const ra = norm(req.artist);
  const nt = norm(meta.name);
  const na = norm(meta.artist);
  const titleOk = rt.includes(nt) || nt.includes(rt);
  const artistOk = !na || ra.includes(na) || na.includes(ra);
  return titleOk && artistOk;
};

/** Mostrar etiqueta amable para mesa (poblada o id) */
function mesaLabel(mesa?: MesaRef): string {
  if (!mesa) return "—";
  if (typeof mesa === "string") return mesa; // fallback: ObjectId si no viene poblado
  const { numero, nombre, name, _id } = mesa;
  if (numero !== undefined && numero !== null && `${numero}`.trim() !== "") {
    return `Mesa ${numero}`;
  }
  if (nombre && nombre.trim()) return nombre;
  if (name && name.trim()) return name;
  return _id || "—";
}

const Spotify: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [preferred, setPreferred] = useState<{ id?: string; name?: string }>({});
  const [status, setStatus] = useState<any>(null);
  const [queue, setQueue] = useState<{ currently_playing?: any; queue?: any[] }>({});
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [vol, setVol] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const lastMetaRef = useRef<{ uri?: string; name?: string; artist?: string } | null>(null);

  const activeDeviceId = useMemo(() => {
    const active = devices.find((d) => d.is_active)?.id;
    return preferred.id || active || "";
  }, [devices, preferred]);

  const current = status?.item;
  const isPlaying = !!status?.is_playing;
  const cover =
    current?.album?.images?.[0]?.url ||
    queue?.currently_playing?.album?.images?.[0]?.url ||
    undefined;

  const getNowMeta = (): { uri?: string; name?: string; artist?: string } => {
    const t = current || queue?.currently_playing || null;
    if (!t) return {};
    return {
      uri: t.uri,
      name: t.name,
      artist: (t.artists || []).map((a: any) => a.name).join(", "),
    };
  };

  const loadAll = async () => {
    try {
      setErr(null);
      const [devicesRes, settingsRes, stRes, qRes, reqRes] = await Promise.all([
        barMusic.devices() as Promise<DevicesResp>,
        barMusic.getSettings() as Promise<SettingsResp>,
        barMusic.playerStatus() as Promise<StatusResp>,
        barMusic.playerQueue() as Promise<QueueResp>,
        // Solo pendientes (para que desaparezcan las reproducidas)
        barMusic.requests("queued,approved") as Promise<RequestsResp>,
      ]);
      setDevices(devicesRes.devices || []);
      setPreferred({
        id: settingsRes.settings?.preferredDeviceId,
        name: settingsRes.settings?.preferredDeviceName,
      });
      setStatus(stRes.status || null);
      setQueue(qRes.queue || {});
      if (typeof stRes?.status?.device?.volume_percent === "number") {
        setVol(stRes.status.device.volume_percent);
      }
      setRequests(reqRes.items || []);
    } catch (e: any) {
      setErr(e?.message || "Error cargando datos");
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, []);

  useInterval(loadAll, 4000);

  /** Auto-sync robusto al cambiar Now Playing */
  useEffect(() => {
    const nowMeta = getNowMeta();
    if (!nowMeta.uri && !nowMeta.name) return;

    (async () => {
      try {
        const prevMeta = lastMetaRef.current;

        // Si cambió el tema, cerramos todo lo que coincida con el anterior
        if (prevMeta && (prevMeta.uri !== nowMeta.uri || norm(prevMeta.name) !== norm(nowMeta.name))) {
          const toClose = (await barMusic.requests("queued,approved,playing")) as RequestsResp;
          const victims = (toClose.items || []).filter(
            (x) => x.trackUri === prevMeta.uri || matchesByText(x, prevMeta)
          );
          for (const v of victims) {
            await barMusic.setRequestStatus(v._id, "DONE");
          }
        }

        // Si hay solicitud de la canción actual en pending, márcala PLAYING
        const pending = (await barMusic.requests("queued,approved")) as RequestsResp;
        const candidates = (pending.items || []).filter(
          (x) => x.trackUri === nowMeta.uri || matchesByText(x, nowMeta)
        );
        if (candidates.length) {
          const pick = candidates.reduce((a, b) =>
            new Date(a.createdAt).getTime() <= new Date(b.createdAt).getTime() ? a : b
          );
          await barMusic.setRequestStatus(pick._id, "PLAYING");
        }

        lastMetaRef.current = nowMeta;
        await loadAll();
      } catch {
        /* silencioso */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.item?.uri, queue?.currently_playing?.uri]);

  // acciones UI
  const loginSpotify = () => {
    if (!API_URL) return alert("Falta REACT_APP_API_URL en el frontend");
    window.open(`${API_URL}/api/music/spotify/login`, "_blank");
  };

  const selectAndSaveDevice = async (deviceId: string, deviceName?: string) => {
    if (!deviceId) return;
    setLoading(true);
    setErr(null);
    try {
      await barMusic.selectDevice(deviceId, true);
      await barMusic.setPreferredDevice(deviceId, deviceName);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Error al seleccionar/guardar el dispositivo");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!activeDeviceId) return;
    setErr(null);
    try {
      if (isPlaying) {
        await barMusic.pause(activeDeviceId);
      } else {
        await api.put("/api/music/playback/play", { deviceId: activeDeviceId });
      }
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Error al alternar reproducción");
    }
  };

  const next = async () => {
    if (!activeDeviceId) return;
    try {
      await barMusic.next(activeDeviceId);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Error al pasar a la siguiente");
    }
  };

  const previous = async () => {
    if (!activeDeviceId) return;
    try {
      await barMusic.previous(activeDeviceId);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Error al ir a la anterior");
    }
  };

  const changeVolume = async (value: number) => {
    setVol(value);
    if (!activeDeviceId) return;
    try {
      await barMusic.volume(activeDeviceId, value);
    } catch (e: any) {
      setErr(e?.message || "Error al cambiar volumen");
    }
  };

  // hover helper
  const hoverFx = (el: HTMLElement, on: boolean) => {
    el.style.transform = on ? "translateY(-2px)" : "translateY(0)";
    (el as HTMLButtonElement).style.boxShadow = on
      ? "0 10px 22px rgba(0,0,0,0.35)"
      : "0 6px 16px rgba(0,0,0,0.35)";
    (el as HTMLButtonElement).style.filter = on ? "saturate(1)" : "saturate(0.9)";
  };

  return (
    <div style={styles.container}>
      <div style={styles.background} />
      <div style={styles.overlay} />

      {/* Header */}
      <div style={styles.headerWrap}>
        <Link
          to="/"
          style={styles.backBtn}
          onMouseOver={(e) => hoverFx(e.currentTarget, true)}
          onMouseOut={(e) => hoverFx(e.currentTarget, false)}
        >
          ← Volver al Dashboard
        </Link>
        <h1 style={styles.title}>Spotify</h1>
        <div style={styles.subtitle}>
          Cabina del bar — controla el dispositivo, la reproducción y revisa la cola y solicitudes
        </div>
      </div>

      {err && <div style={{ marginBottom: 12, color: "#ffb3b3" }}>⚠️ {err}</div>}

      <div style={styles.grid}>
        {/* Conexión / Dispositivo */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Conexión & Dispositivo</div>
          <div style={styles.row}>
            <button
              style={styles.button}
              onMouseOver={(e) => hoverFx(e.currentTarget, true)}
              onMouseOut={(e) => hoverFx(e.currentTarget, false)}
              onClick={loginSpotify}
            >
              Conectar/Relogin Spotify
            </button>

            <button
              style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
              onMouseOver={(e) => hoverFx(e.currentTarget, true)}
              onMouseOut={(e) => hoverFx(e.currentTarget, false)}
              onClick={loadAll}
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Estado"}
            </button>
          </div>

          <div style={{ marginTop: 14 }} />
          <div style={styles.row}>
            <select
              style={styles.select}
              value={activeDeviceId}
              onChange={(e) =>
                selectAndSaveDevice(
                  e.target.value,
                  devices.find((d) => d.id === e.target.value)?.name
                )
              }
            >
              <option value="">— Selecciona dispositivo —</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.is_active ? "• activo" : ""}
                </option>
              ))}
            </select>

            <div style={styles.small}>
              Preferido: {preferred.id ? `${preferred.name || preferred.id}` : "— no guardado —"}
            </div>
          </div>
        </div>

        {/* Now Playing */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Now Playing</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {cover ? (
              <img src={cover} alt="cover" style={styles.cover} />
            ) : (
              <div
                style={{
                  ...styles.cover,
                  display: "grid",
                  placeItems: "center",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                ♪
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800 }}>
                {current?.name || queue?.currently_playing?.name || "—"}
              </div>
              <div style={{ opacity: 0.85 }}>
                {(current?.artists?.map((a: any) => a.name).join(", ")) ||
                  (queue?.currently_playing?.artists?.map((a: any) => a.name).join(", ")) ||
                  "—"}
              </div>
              <div style={styles.small}>
                {msToMinSec(status?.progress_ms)} / {msToMinSec(current?.duration_ms)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }} />
          <div style={styles.row}>
            <button
              title="Anterior"
              aria-label="Anterior"
              style={styles.iconBtn}
              onMouseOver={(e) => hoverFx(e.currentTarget, true)}
              onMouseOut={(e) => hoverFx(e.currentTarget, false)}
              onClick={previous}
              disabled={!activeDeviceId}
            >
              <IconPrev />
            </button>

            <button
              title={isPlaying ? "Pausar" : "Reproducir"}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              style={styles.iconBtn}
              onMouseOver={(e) => hoverFx(e.currentTarget, true)}
              onMouseOut={(e) => hoverFx(e.currentTarget, false)}
              onClick={togglePlay}
              disabled={!activeDeviceId}
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>

            <button
              title="Siguiente"
              aria-label="Siguiente"
              style={styles.iconBtn}
              onMouseOver={(e) => hoverFx(e.currentTarget, true)}
              onMouseOut={(e) => hoverFx(e.currentTarget, false)}
              onClick={next}
              disabled={!activeDeviceId}
            >
              <IconNext />
            </button>

            <div style={{ ...styles.small, marginLeft: 8 }}>Volumen</div>
            <input
              type="range"
              min={0}
              max={100}
              value={vol ?? 0}
              onChange={(e) => changeVolume(parseInt(e.target.value, 10))}
              style={styles.slider}
            />
            <div style={styles.small}>{vol ?? 0}%</div>
          </div>
        </div>

        {/* Up Next (Spotify) */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Up Next (Spotify)</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Canción</th>
                <th style={styles.th}>Artista</th>
                <th style={styles.th}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {(queue.queue || []).slice(0, 8).map((t: any, i: number) => (
                <tr key={t.uri || i}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {t?.album?.images?.[0]?.url && (
                        <img
                          src={t.album.images[0].url}
                          alt=""
                          style={{ ...styles.cover, width: 40, height: 40 }}
                        />
                      )}
                      <div>{t?.name || "—"}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {(t?.artists || []).map((a: any) => a.name).join(", ")}
                  </td>
                  <td style={styles.td}>{msToMinSec(t?.duration_ms)}</td>
                </tr>
              ))}
              {(!queue.queue || queue.queue.length === 0) && (
                <tr>
                  <td style={styles.td} colSpan={3}>
                    (sin elementos en cola)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Solicitudes de Clientes (solo pendientes) */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Solicitudes de Clientes</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Canción</th>
                <th style={styles.th}>Artista</th>
                <th style={styles.th}>Mesa</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 15).map((r) => (
                <tr key={r._id}>
                  <td style={styles.td}>{r.title}</td>
                  <td style={styles.td}>{r.artist}</td>
                  {/* ✅ Mostrar número/nombre si viene poblado */}
                  <td style={styles.td}>{mesaLabel(r.requestedBy?.mesaId)}</td>
                  <td style={styles.td}>{r.status}</td>
                  <td style={styles.td}>
                    <div style={styles.row}>
                      <button
                        style={styles.button}
                        onMouseOver={(e) => hoverFx(e.currentTarget, true)}
                        onMouseOut={(e) => hoverFx(e.currentTarget, false)}
                        onClick={async () => {
                          try {
                            await barMusic.setRequestStatus(r._id, "REJECTED");
                            await loadAll();
                          } catch (e: any) {
                            setErr(e?.message || "Error al rechazar");
                          }
                        }}
                      >
                        Rechazar
                      </button>
                      <button
                        style={styles.button}
                        onMouseOver={(e) => hoverFx(e.currentTarget, true)}
                        onMouseOut={(e) => hoverFx(e.currentTarget, false)}
                        onClick={async () => {
                          try {
                            await barMusic.setRequestStatus(r._id, "DONE");
                            await loadAll();
                          } catch (e: any) {
                            setErr(e?.message || "Error al finalizar");
                          }
                        }}
                      >
                        Finalizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={5}>
                    (sin solicitudes)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Spotify;
