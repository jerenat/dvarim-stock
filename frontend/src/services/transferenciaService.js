// src/services/transferenciaService.js
import api from "../lib/api";

export const transferenciaService = {
  // Realizar una transferencia
  crearTransferencia: async (data) => {
    const { data: response } = await api.post("/transferencias", data);
    return response;
  },

  // Obtener usuarios disponibles para transferencia
  obtenerUsuarios: async () => {
    const { data } = await api.get("/transferencias/usuarios");
    return data;
  },

  // Obtener productos disponibles para transferencia
  obtenerProductos: async () => {
    const { data } = await api.get("/transferencias/productos");
    return data;
  },

  // Obtener historial de transferencias
  obtenerHistorial: async () => {
    const { data } = await api.get("/transferencias");
    return data;
  },
};
