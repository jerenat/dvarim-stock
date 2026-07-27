// src/services/movimientoService.js
import api from "../lib/api";

export const movimientoService = {
  // Obtener movimientos con filtros
  obtenerMovimientos: async (params = {}) => {
    const { data } = await api.get("/movimientos", { params });
    return data;
  },

  // Obtener un movimiento por ID
  obtenerMovimiento: async (id) => {
    const { data } = await api.get(`/movimientos/${id}`);
    return data;
  },

  // Crear un nuevo movimiento (admin)
  crearMovimiento: async (movimiento) => {
    const { data } = await api.post("/movimientos", movimiento);
    return data;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (dias = 30) => {
    const { data } = await api.get("/movimientos/estadisticas", { params: { dias } });
    return data;
  },
};
