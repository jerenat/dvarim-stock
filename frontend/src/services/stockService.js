// src/services/stockService.js
import api from '../lib/api';

export const stockService = {
  // Obtener stock general
  obtenerStockGeneral: async (params = {}) => {
    const { data } = await api.get('/stock/general', { params });
    return data;
  },

  // Obtener stock por usuarios
  obtenerStockPorUsuarios: async (params = {}) => {
    const { data } = await api.get('/stock/usuarios', { params });
    return data;
  },

  // Obtener stock de un usuario específico
  obtenerStockUsuario: async (id) => {
    const { data } = await api.get(`/stock/usuarios/${id}`);
    return data;
  },

  // Transferir stock (admin)
  transferirStock: async (transferencia) => {
    const { data } = await api.post('/stock/transferir', transferencia);
    return data;
  },

  // Obtener alertas de stock bajo (admin)
  obtenerAlertasStock: async () => {
    const { data } = await api.get('/stock/alertas');
    return data;
  }
};