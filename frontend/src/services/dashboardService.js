// src/services/dashboardService.js
import api from "../lib/api";

export const dashboardService = {
  // Obtener datos completos del dashboard
  obtenerDashboard: async () => {
    const { data } = await api.get("/dashboard");
    return data;
  },

  // Obtener resumen rápido
  obtenerResumen: async () => {
    const { data } = await api.get("/dashboard/resumen");
    return data;
  },
};
