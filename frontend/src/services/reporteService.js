// src/services/reporteService.js
import api from "../lib/api";

export const reporteService = {
  // Obtener todos los datos para reportes
  obtenerReportes: async () => {
    const { data } = await api.get("/reportes");
    return data;
  },

  // Obtener productos más vendidos
  obtenerMasVendidos: async () => {
    const { data } = await api.get("/reportes/mas-vendidos");
    return data;
  },

  // Obtener stock bajo
  obtenerStockBajo: async () => {
    const { data } = await api.get("/reportes/stock-bajo");
    return data;
  },

  // Obtener movimientos por fecha
  obtenerMovimientos: async (params = {}) => {
    const { data } = await api.get("/reportes/movimientos", { params });
    return data;
  },
};
