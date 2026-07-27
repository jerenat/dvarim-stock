// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem("stockpro-token");
      const savedUser = localStorage.getItem("stockpro-user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Verificar que el token siga siendo válido
        try {
          const { data } = await api.get("/usuarios/perfil");
          setUser(data.datos);
          localStorage.setItem("stockpro-user", JSON.stringify(data.datos));
        } catch (error) {
          // Si el token expiró, limpiar sesión
          if (error.response?.status === 401) {
            localStorage.removeItem("stockpro-token");
            localStorage.removeItem("stockpro-user");
            setToken(null);
            setUser(null);
          }
        }
      }

      setLoading(false);
    };

    verificarSesion();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await api.post("/usuarios/login", { email, password });

      const { token: jwtToken, usuario } = data;

      // Guardar en localStorage
      localStorage.setItem("stockpro-token", jwtToken);
      localStorage.setItem("stockpro-user", JSON.stringify(usuario));

      // Actualizar estado
      setToken(jwtToken);
      setUser(usuario);

      return usuario;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || "Error al iniciar sesión";
      setError(mensaje);
      throw new Error(mensaje);
    }
  };

  const registro = async (userData) => {
    try {
      setError(null);
      const { data } = await api.post("/usuarios/registro", userData);

      const { token: jwtToken, usuario } = data;

      // Guardar en localStorage
      localStorage.setItem("stockpro-token", jwtToken);
      localStorage.setItem("stockpro-user", JSON.stringify(usuario));

      // Actualizar estado
      setToken(jwtToken);
      setUser(usuario);

      return usuario;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || "Error al registrarse";
      setError(mensaje);
      throw new Error(mensaje);
    }
  };

  const logout = () => {
    localStorage.removeItem("stockpro-token");
    localStorage.removeItem("stockpro-user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const actualizarPerfil = async (userData) => {
    try {
      setError(null);
      const { data } = await api.put("/usuarios/perfil", userData);

      const usuarioActualizado = data.datos;
      localStorage.setItem("stockpro-user", JSON.stringify(usuarioActualizado));
      setUser(usuarioActualizado);

      return usuarioActualizado;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || "Error al actualizar perfil";
      setError(mensaje);
      throw new Error(mensaje);
    }
  };

  const cambiarPassword = async (passwords) => {
    try {
      setError(null);
      await api.put("/usuarios/password", passwords);
      return true;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || "Error al cambiar contraseña";
      setError(mensaje);
      throw new Error(mensaje);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    registro,
    logout,
    actualizarPerfil,
    cambiarPassword,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.rol === "administrador",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};