// src/services/categoriaService.js
import api from "../lib/api";

export const categoriaService = {
  // Obtener todas las categorías
  obtenerCategorias: async () => {
    const { data } = await api.get("/categorias");
    return data;
  },

  // Obtener una categoría por ID
  obtenerCategoria: async (id) => {
    const { data } = await api.get(`/categorias/${id}`);
    return data;
  },

  // Crear una nueva categoría
  crearCategoria: async (categoria) => {
    const { data } = await api.post("/categorias", categoria);
    return data;
  },

  // Actualizar una categoría
  actualizarCategoria: async (id, categoria) => {
    const { data } = await api.put(`/categorias/${id}`, categoria);
    return data;
  },

  // Eliminar una categoría
  eliminarCategoria: async (id) => {
    const { data } = await api.delete(`/categorias/${id}`);
    return data;
  },
};
