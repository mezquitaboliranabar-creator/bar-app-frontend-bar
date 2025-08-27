// src/services/barMusic.ts
import { api } from "./api";

export type RequestStatusUpper = "REJECTED" | "PLAYING" | "DONE";
export type RequestStatusLower = "rejected" | "playing" | "done";
type RequestStatusAny = RequestStatusUpper | RequestStatusLower;

export const barMusic = {
  // ---- Auth / Devices / Settings ----
  status: () => api.get("/api/music/spotify/status"),
  devices: () => api.get("/api/music/playback/devices"),
  selectDevice: (deviceId: string, play = true) =>
    api.put("/api/music/playback/select-device", { deviceId, play }),

  getSettings: () => api.get("/api/settings"),
  setPreferredDevice: (deviceId: string, deviceName?: string) =>
    api.put("/api/settings/device", { deviceId, deviceName }),

  // ---- Player ----
  playerStatus: () => api.get("/api/music/playback/status"),
  playerQueue: () => api.get("/api/music/playback/queue"),

  playContext: (deviceId: string, context_uri: string) =>
    api.put("/api/music/playback/play", { deviceId, context_uri }),
  playUris: (deviceId: string, uris: string[]) =>
    api.put("/api/music/playback/play", { deviceId, uris }),

  pause: (deviceId: string) =>
    api.put("/api/music/playback/pause", { deviceId }),
  next: (deviceId: string) =>
    api.post("/api/music/playback/next", { deviceId }),
  previous: (deviceId: string) =>
    api.post("/api/music/playback/previous", { deviceId }),
  volume: (deviceId: string, volumePercent: number) =>
    api.put("/api/music/playback/volume", { deviceId, volumePercent }),

  // ---- Solicitudes (DB) ----
  requests: (
    statuses = "queued,approved,playing",
    limit = 100,
    sort = "createdAt:asc",
    sessionId?: string,
    mesaId?: string
  ) => {
    const params = new URLSearchParams({
      status: statuses,
      limit: String(limit),
      sort,
    });
    if (sessionId) params.append("sessionId", sessionId);
    if (mesaId) params.append("mesaId", String(mesaId));
    return api.get(`/api/music/requests?${params.toString()}`);
  },

  setRequestStatus: (id: string, status: RequestStatusAny, reason?: string) => {
    // El backend espera minúsculas
    const normalized = (status as string).toLowerCase() as RequestStatusLower;
    return api.put(`/api/music/requests/${id}`, { status: normalized, reason });
  },

  // ---- Búsqueda (opcional staff) ----
  search: (q: string, market = "CO") =>
    api.get(`/api/music/search?q=${encodeURIComponent(q)}&market=${market}`),

  queue: (deviceId: string, uri: string) =>
    api.post("/api/music/playback/queue", { deviceId, uri }),
};
