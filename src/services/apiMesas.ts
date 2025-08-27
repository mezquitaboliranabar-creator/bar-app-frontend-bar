import { api } from "./api";

export interface Mesa {
  _id: string;
  numero: number;
  qrCode?: string | null;
  estado: "libre" | "ocupada" | "reservada";
  createdAt: string;
  updatedAt: string;
}

export const getMesas = (): Promise<Mesa[]> => api.get<Mesa[]>("/api/mesas");
export const getMesaById = (id: string): Promise<Mesa> => api.get<Mesa>(`/api/mesas/${id}`);
export const crearMesa = (mesa: { numero: number }) =>
  api.post<{ ok: boolean; mensaje: string; mesa: Mesa }>("/api/mesas", mesa);
export const actualizarMesa = (id: string, mesa: Partial<{ numero: number; estado: string }>) =>
  api.put<Mesa>(`/api/mesas/${id}`, mesa);
export const eliminarMesa = (id: string) => api.del<{ mensaje: string }>(`/api/mesas/${id}`);

// ⬇️ NUEVO
export const cerrarMesa = (id: string): Promise<{ ok: boolean; closedCount: number; mesa: Mesa }> =>
  api.post(`/api/mesas/${id}/close`, {});

export const apiMesas = {
  getMesas,
  getMesaById,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
  cerrarMesa, // 
};
