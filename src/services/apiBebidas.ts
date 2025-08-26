// src/services/apiBebidas.ts
import { api } from "./api";

// Tipo de bebida
export interface Bebida {
  _id: string;
  nombre: string;
  precio: number;
  categoria: {
    _id: string;
    nombre: string;
  };
}

// Endpoints
export const getBebidas = async (): Promise<Bebida[]> => {
  // Devuelve todas las bebidas con la categoría poblada
  return api.get<Bebida[]>("/api/bebidas");
};

export const crearBebida = async (bebida: {
  nombre: string;
  precio: number;
  categoria: string; // Se envía el _id de la categoría
}): Promise<Bebida> => {
  return api.post<Bebida>("/api/bebidas", bebida);
};

export const actualizarBebida = async (
  id: string,
  bebida: {
    nombre?: string;
    precio?: number;
    categoria?: string; // Se puede actualizar la categoría enviando su _id
  }
): Promise<Bebida> => {
  return api.put<Bebida>(`/api/bebidas/${id}`, bebida);
};

export const eliminarBebida = async (id: string): Promise<{ mensaje: string }> => {
  return api.del<{ mensaje: string }>(`/api/bebidas/${id}`);
};

// Exportar todo como objeto opcional
export const apiBebidas = {
  getBebidas,
  crearBebida,
  actualizarBebida,
  eliminarBebida,
};

export {};
