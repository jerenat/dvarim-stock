// src/services/configuracionService.js
import api from "../lib/api";

export const configuracionService = {
  // Obtener datos de la empresa
  obtenerEmpresa: async () => {
    const { data } = await api.get("/configuracion/empresa");
    return data;
  },

  // Actualizar datos de la empresa (admin)
  actualizarEmpresa: async (datos) => {
    const { data } = await api.put("/configuracion/empresa", datos);
    return data;
  },

  // Actualizar logo (admin)
  actualizarLogo: async (logo) => {
    const { data } = await api.put("/configuracion/empresa/logo", { logo });
    return data;
  },

  // Cambiar contraseña
  cambiarPassword: async (passwords) => {
    const { data } = await api.put("/configuracion/password", passwords);
    return data;
  },
};
