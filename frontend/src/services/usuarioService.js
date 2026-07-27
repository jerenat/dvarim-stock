// src/services/usuarioService.js
import api from "../lib/api";

export const usuarioService = {
  // Obtener todos los usuarios (admin)
  obtenerUsuarios: async () => {
    const { data } = await api.get("/usuarios");
    return data;
  },

  // Obtener un usuario por ID
  obtenerUsuario: async (id) => {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  // ✅ Obtener perfil del usuario autenticado
  obtenerPerfil: async () => {
    const { data } = await api.get("/usuarios/perfil");
    return data;
  },

  // ✅ Actualizar perfil del usuario autenticado
  actualizarPerfil: async (datos) => {
    const { data } = await api.put("/usuarios/perfil", datos);
    return data;
  },

  // Crear nuevo usuario (admin)
  crearUsuario: async (usuario) => {
    const { data } = await api.post("/usuarios", usuario);
    return data;
  },

  // Actualizar usuario (admin)
  actualizarUsuario: async (id, usuario) => {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data;
  },

  // Eliminar usuario (admin)
  eliminarUsuario: async (id) => {
    const { data } = await api.delete(`/usuarios/${id}`);
    return data;
  },

  // Cambiar estado de usuario (admin)
  cambiarEstadoUsuario: async (id, estado) => {
    const { data } = await api.patch(`/usuarios/${id}/estado`, { estado });
    return data;
  },
};
