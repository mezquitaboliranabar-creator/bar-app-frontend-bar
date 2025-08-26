import { api } from "./api";

// Tipo de categoría
export interface Categoria {
  _id: string;
  nombre: string;
  imagen?: string;
}

// Endpoints
export const getCategorias = async (): Promise<Categoria[]> => {
  return api.get<Categoria[]>("/api/categorias");
};

export const crearCategoria = async (categoria: { nombre: string; imagen?: string }): Promise<Categoria> => {
  return api.post<Categoria>("/api/categorias", categoria);
};

export const actualizarCategoria = async (id: string, categoria: { nombre: string; imagen?: string }): Promise<Categoria> => {
  return api.put<Categoria>(`/api/categorias/${id}`, categoria);
};

export const eliminarCategoria = async (id: string): Promise<{ message: string }> => {
  return api.del<{ message: string }>(`/api/categorias/${id}`);
};

// Exportar todo como objeto opcional
export const apiCategorias = {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
export {}