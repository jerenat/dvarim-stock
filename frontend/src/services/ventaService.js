// src/services/ventaService.js
import api from "../lib/api";

export const ventaService = {
  // Obtener productos disponibles para vender (stock del usuario)
  obtenerProductosDisponibles: async () => {
    const { data } = await api.get("/ventas/productos-disponibles");
    return data;
  },

  // Registrar una venta
  registrarVenta: async (venta) => {
    const { data } = await api.post("/ventas", venta);
    return data;
  },

  // Obtener historial de ventas
  obtenerVentas: async (params = {}) => {
    const { data } = await api.get("/ventas", { params });
    return data;
  },

  // Obtener detalle de una venta
  obtenerVenta: async (id) => {
    const { data } = await api.get(`/ventas/${id}`);
    return data;
  },
};
