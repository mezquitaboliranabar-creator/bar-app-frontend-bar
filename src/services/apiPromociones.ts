import { api } from "./api";


export interface Promocion {
  _id: string;
  titulo: string;
  descripcion?: string;
  imagenUrl: string;
  activa: boolean;
  inicia?: string | null;   // ISO string
  termina?: string | null;  // ISO string
  orden: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ListarPromocionesParams {
  activeNow?: boolean;
  activa?: boolean;
  limit?: number; // por defecto backend: 50
  page?: number;  // por defecto backend: 1
}

export interface ListarPromocionesResponse {
  ok: boolean;
  total: number;
  page: number;
  limit: number;
  items: Promocion[];
}

export interface CrearPromocionInput {
  titulo: string;
  imagenUrl: string;
  descripcion?: string;
  activa?: boolean;
  inicia?: string | null;   // ISO string
  termina?: string | null;  // ISO string
  orden?: number;
}

export interface ActualizarPromocionInput {
  titulo?: string;
  imagenUrl?: string;
  descripcion?: string;
  activa?: boolean;
  inicia?: string | null;   // null o ISO string
  termina?: string | null;  // null o ISO string
  orden?: number;
}

// Reemplaza la firma de buildQS por esta:
const buildQS = (params?: Partial<ListarPromocionesParams>): string => {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.append(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

// -------------------- Endpoints --------------------
export const listarPromociones = async (
  params?: ListarPromocionesParams
): Promise<ListarPromocionesResponse> => {
  const qs = buildQS(params);
  return api.get<ListarPromocionesResponse>(`/api/promociones${qs}`);
};

export const obtenerPromocion = async (id: string): Promise<Promocion> => {
  return api.get<Promocion>(`/api/promociones/${id}`);
};

export const crearPromocion = async (data: CrearPromocionInput): Promise<Promocion> => {
  return api.post<Promocion>("/api/promociones", data);
};

export const actualizarPromocion = async (
  id: string,
  data: ActualizarPromocionInput
): Promise<Promocion> => {
  return api.put<Promocion>(`/api/promociones/${id}`, data);
};

export const eliminarPromocion = async (id: string): Promise<{ ok: boolean }> => {
  return api.del<{ ok: boolean }>(`/api/promociones/${id}`);
};

// -------------------- Export agrupado opcional --------------------
export const apiPromociones = {
  listarPromociones,
  obtenerPromocion,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
};
