// controllers/configuracionController.js
import Empresa from "../models/Empresa.js";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";

export const obtenerEmpresa = async (req, res) => {
  try {
    // Contar documentos en la colección
    const count = await Empresa.countDocuments();

    // Buscar la empresa
    const empresa = await Empresa.findOne();

    if (!empresa) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "No hay configuración de empresa. Por favor, configure la empresa primero.",
      });
    }

    res.json({
      exito: true,
      datos: empresa,
    });
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener datos de la empresa",
    });
  }
};

// @desc    Actualizar datos de la empresa
// @route   PUT /api/configuracion/empresa
// @access  Privado/Admin
export const actualizarEmpresa = async (req, res) => {
  try {
    const { nombre, ruc, direccion, telefono, email, moneda, configuracion } = req.body;

    // Validar campos requeridos
    if (!nombre || !ruc || !direccion || !telefono || !email) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Todos los campos son requeridos",
      });
    }

    // Validar email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        exito: false,
        error: "Email inválido",
        mensaje: "El formato del email no es válido",
      });
    }

    // Buscar empresa existente
    let empresa = await Empresa.findOne();

    if (!empresa) {
      // Si no existe, crear
      empresa = await Empresa.create({
        nombre,
        ruc,
        direccion,
        telefono,
        email,
        moneda: moneda || "PYG",
        configuracion,
      });
    } else {
      // Actualizar campos
      empresa.nombre = nombre;
      empresa.ruc = ruc;
      empresa.direccion = direccion;
      empresa.telefono = telefono;
      empresa.email = email;

      if (moneda) empresa.moneda = moneda;

      if (configuracion) {
        empresa.configuracion = {
          ...empresa.configuracion,
          ...configuracion,
        };
      }

      await empresa.save();
    }

    res.json({
      exito: true,
      mensaje: "Datos de la empresa actualizados exitosamente",
      datos: empresa,
    });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);

    if (error.name === "ValidationError") {
      const mensajes = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        exito: false,
        error: "Error de validación",
        mensajes,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        exito: false,
        error: "RUC duplicado",
        mensaje: "Ya existe una empresa con ese RUC",
      });
    }

    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al actualizar empresa",
    });
  }
};

// @desc    Actualizar logo de la empresa
// @route   PUT /api/configuracion/empresa/logo
// @access  Privado/Admin
export const actualizarLogo = async (req, res) => {
  try {
    // Aquí implementarías la subida de archivos con multer
    // Por ahora, guardamos una URL o base64
    const { logo } = req.body;

    if (!logo) {
      return res.status(400).json({
        exito: false,
        error: "Logo requerido",
        mensaje: "Debe proporcionar una imagen",
      });
    }

    let empresa = await Empresa.findOne();

    if (!empresa) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Primero configure los datos de la empresa",
      });
    }

    empresa.logo = logo;
    await empresa.save();

    res.json({
      exito: true,
      mensaje: "Logo actualizado exitosamente",
      datos: { logo: empresa.logo },
    });
  } catch (error) {
    console.error("Error al actualizar logo:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al actualizar logo",
    });
  }
};

// @desc    Cambiar contraseña del usuario actual
// @route   PUT /api/configuracion/password
// @access  Privado
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva, confirmarPassword } = req.body;

    // Validaciones
    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Todos los campos son requeridos",
      });
    }

    if (passwordNueva !== confirmarPassword) {
      return res.status(400).json({
        exito: false,
        error: "Contraseñas no coinciden",
        mensaje: "La nueva contraseña y su confirmación no coinciden",
      });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({
        exito: false,
        error: "Contraseña débil",
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Buscar usuario con password
    const usuario = await Usuario.findById(req.usuario._id).select("+password");

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: "Usuario no encontrado",
        mensaje: "No se encontró el usuario",
      });
    }

    // Verificar contraseña actual
    const passwordCorrecto = await usuario.compararPassword(passwordActual);

    if (!passwordCorrecto) {
      return res.status(400).json({
        exito: false,
        error: "Contraseña incorrecta",
        mensaje: "La contraseña actual no es correcta",
      });
    }

    // Actualizar contraseña
    usuario.password = passwordNueva;
    await usuario.save();

    res.json({
      exito: true,
      mensaje: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al cambiar contraseña",
    });
  }
};

// @desc    Obtener tema del usuario (para guardar preferencia)
// @route   GET /api/configuracion/tema
// @access  Privado
export const obtenerTema = async (req, res) => {
  try {
    // Por ahora, el tema se maneja en el frontend
    // Podrías guardarlo en el modelo de usuario si quieres persistencia
    res.json({
      exito: true,
      datos: {
        tema: req.usuario.tema || "light",
      },
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener tema",
    });
  }
};
