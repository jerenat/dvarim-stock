// middlewares/auth.js
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// Middleware para proteger rutas - Verifica el token JWT
export const protegerRuta = async (req, res, next) => {
  let token;

  // Verificar si existe el token en el header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Si no hay token
  if (!token) {
    return res.status(401).json({
      exito: false,
      error: "No autorizado",
      mensaje: "Debe iniciar sesión para acceder a este recurso",
    });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "stockpro_secret_2024");

    // Buscar el usuario
    req.usuario = await Usuario.findById(decoded.id).select("-password");

    if (!req.usuario) {
      return res.status(401).json({
        exito: false,
        error: "No autorizado",
        mensaje: "Usuario no encontrado",
      });
    }

    // Verificar si el usuario está activo
    if (req.usuario.estado !== "activo") {
      return res.status(401).json({
        exito: false,
        error: "Cuenta desactivada",
        mensaje: "Su cuenta ha sido desactivada. Contacte al administrador",
      });
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        exito: false,
        error: "Token inválido",
        mensaje: "El token proporcionado no es válido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        exito: false,
        error: "Token expirado",
        mensaje: "Su sesión ha expirado, vuelva a iniciar sesión",
      });
    }

    return res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al verificar autenticación",
    });
  }
};

// Middleware para verificar si es administrador
export const esAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === "administrador") {
    next();
  } else {
    return res.status(403).json({
      exito: false,
      error: "Acceso denegado",
      mensaje: "Se requieren permisos de administrador para esta acción",
    });
  }
};

// Middleware opcional: verificar si es el mismo usuario o admin
export const esMismoUsuarioOAdmin = (req, res, next) => {
  if (req.usuario.rol === "administrador" || req.usuario._id.toString() === req.params.id) {
    next();
  } else {
    return res.status(403).json({
      exito: false,
      error: "Acceso denegado",
      mensaje: "No tiene permisos para realizar esta acción",
    });
  }
};
