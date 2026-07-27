// src/services/productoService.js
import api from '../lib/api';

export const productoService = {
  // Obtener productos con filtros y paginación
  obtenerProductos: async (params = {}) => {
    const { data } = await api.get('/productos', { params });
    return data;
  },

  // Obtener un producto por ID
  obtenerProducto: async (id) => {
    const { data } = await api.get(`/productos/${id}`);
    return data;
  },

  // Obtener categorías
  obtenerCategorias: async () => {
    const { data } = await api.get('/productos/categorias');
    return data;
  },

  // Crear producto
  crearProducto: async (producto) => {
    const { data } = await api.post('/productos', producto);
    return data;
  },

  // Actualizar producto
  actualizarProducto: async (id, producto) => {
    const { data } = await api.put(`/productos/${id}`, producto);
    return data;
  },

  // Eliminar producto
  eliminarProducto: async (id) => {
    const { data } = await api.delete(`/productos/${id}`);
    return data;
  }
};