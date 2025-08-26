// src/services/apiMesas.ts
import { api } from "./api";

export interface Mesa {
  _id: string;
  numero: number;
  qrCode?: string | null;
  estado: "libre" | "ocupada" | "reservada";
  createdAt: string;
  updatedAt: string;
}

// Obtener todas las mesas
export const getMesas = (): Promise<Mesa[]> => {
  return api.get<Mesa[]>("/api/mesas");
};

// Obtener una mesa por ID
export const getMesaById = (id: string): Promise<Mesa> => {
  return api.get<Mesa>(`/api/mesas/${id}`);
};

// Crear una nueva mesa
export const crearMesa = (mesa: { numero: number }): Promise<{ ok: boolean; mensaje: string; mesa: Mesa }> => {
  return api.post<{ ok: boolean; mensaje: string; mesa: Mesa }>("/api/mesas", mesa);
};

// Actualizar mesa
export const actualizarMesa = (
  id: string,
  mesa: Partial<{ numero: number; estado: string }>
): Promise<Mesa> => {
  return api.put<Mesa>(`/api/mesas/${id}`, mesa);
};

// Eliminar mesa
export const eliminarMesa = (id: string): Promise<{ mensaje: string }> => {
  return api.del<{ mensaje: string }>(`/api/mesas/${id}`);
};

export const apiMesas = {
  getMesas,
  getMesaById,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
};
