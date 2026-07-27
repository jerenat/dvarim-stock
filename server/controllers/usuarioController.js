// controllers/usuarioController.js
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Usuario from "../models/Usuario.js";
import StockUsuario from "../models/StockUsuario.js";

// Función para generar token JWT
const generarToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "stockpro_secret_2024",
    { expiresIn: "30d" }, // El token expira en 30 días
  );
};

// @desc    Iniciar sesión
// @route   POST /api/usuarios/login
// @access  Público
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario e incluir el password
    const usuario = await Usuario.findOne({ email }).select("+password");

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        error: "Credenciales inválidas",
        mensaje: "Email o contraseña incorrectos",
      });
    }

    // Verificar si el usuario está activo
    if (usuario.estado !== "activo") {
      return res.status(401).json({
        exito: false,
        error: "Cuenta desactivada",
        mensaje: "Su cuenta está desactivada. Contacte al administrador",
      });
    }

    // Verificar contraseña
    // const passwordCorrecto = await usuario.compararPassword(password);

    // if (!passwordCorrecto) {
    //   return res.status(401).json({
    //     exito: false,
    //     error: 'Credenciales inválidas',
    //     mensaje: 'Email o contraseña incorrectos'
    //   });
    // }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save({ validateBeforeSave: false });

    // Generar token
    const token = generarToken(usuario._id);

    // Responder con token y datos del usuario (sin password)
    res.json({
      exito: true,
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        estado: usuario.estado,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al iniciar sesión",
    });
  }
};

// @desc    Registrar nuevo usuario
// @route   POST /api/usuarios/registro
// @access  Público
export const registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Todos los campos son requeridos",
      });
    }

    // Validar formato de email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        exito: false,
        error: "Email inválido",
        mensaje: "El formato del email no es válido",
      });
    }

    // Validar largo de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        exito: false,
        error: "Contraseña débil",
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar si el email ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        exito: false,
        error: "Email duplicado",
        mensaje: "Ya existe un usuario registrado con ese email",
      });
    }

    // Crear usuario (la contraseña se encripta automáticamente en el modelo)
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      rol: "usuario", // Por defecto, los nuevos usuarios son 'usuario'
    });

    // Generar token
    const token = generarToken(usuario._id);

    // Responder
    res.status(201).json({
      exito: true,
      mensaje: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        estado: usuario.estado,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);

    // Error de validación de Mongoose
    if (error.name === "ValidationError") {
      const mensajes = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        exito: false,
        error: "Error de validación",
        mensajes,
      });
    }

    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al registrar usuario",
    });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/usuarios/perfil
// @access  Privado
export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Usuario no encontrado",
      });
    }

    res.json({
      exito: true,
      datos: usuario,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener perfil",
    });
  }
};

// @desc    Actualizar perfil
// @route   PUT /api/usuarios/perfil
// @access  Privado
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, email, rol } = req.body;

    // Buscar usuario actual
    const usuarioActual = await Usuario.findById(req.usuario._id);
    if (!usuarioActual) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Usuario no encontrado",
      });
    }

    const camposActualizar = {};
    if (nombre) camposActualizar.nombre = nombre;
    if (apellido) camposActualizar.apellido = apellido;

    // ✅ Solo admin puede modificar email y rol
    if (req.usuario.rol === "administrador") {
      if (email && email !== usuarioActual.email) {
        // Verificar que el email no esté en uso
        const emailExiste = await Usuario.findOne({
          email,
          _id: { $ne: req.usuario._id },
        });
        if (emailExiste) {
          return res.status(400).json({
            exito: false,
            error: "Email duplicado",
            mensaje: "Ya existe otro usuario con ese email",
          });
        }
        camposActualizar.email = email;
      }

      if (rol) camposActualizar.rol = rol;
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      camposActualizar,
      { new: true, runValidators: true },
    ).select("-password");

    res.json({
      exito: true,
      mensaje: "Perfil actualizado exitosamente",
      datos: usuario,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al actualizar perfil",
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/usuarios/password
// @access  Privado
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Contraseña actual y nueva son requeridas",
      });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({
        exito: false,
        error: "Contraseña débil",
        mensaje: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    // Buscar usuario con password
    const usuario = await Usuario.findById(req.usuario._id).select("+password");

    // // Verificar contraseña actual
    // const passwordCorrecto = await usuario.compararPassword(passwordActual);
    // if (!passwordCorrecto) {
    //   return res.status(400).json({
    //     exito: false,
    //     error: 'Contraseña incorrecta',
    //     mensaje: 'La contraseña actual no es correcta'
    //   });
    // }

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

// @desc    Obtener todos los usuarios (solo admin)
// @route   GET /api/usuarios
// @access  Privado/Admin
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      exito: true,
      total: usuarios.length,
      datos: usuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener usuarios",
    });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Privado/Admin
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const usuario = await Usuario.findById(id).select("-password");

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Usuario no encontrado",
      });
    }

    // Obtener stock asignado
    const stockTotal = await StockUsuario.aggregate([
      { $match: { usuario: usuario._id } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } },
    ]);

    const stockAsignado = stockTotal.length > 0 ? stockTotal[0].total : 0;

    // Obtener detalle del stock
    const stockDetalle = await StockUsuario.find({ usuario: id }).populate(
      "producto",
      "codigo nombre precio",
    );

    res.json({
      exito: true,
      datos: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        stockAsignado,
        estado: usuario.estado ? "activo" : "inactivo",
        avatar: `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase(),
        ultimoAcceso: usuario.ultimoAcceso,
        stockDetalle,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener usuario",
    });
  }
};

// @desc    Crear un nuevo usuario (admin)
// @route   POST /api/usuarios
// @access  Privado/Admin
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Nombre, apellido, email y contraseña son requeridos",
      });
    }

    // Validar formato de email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        exito: false,
        error: "Email inválido",
        mensaje: "El formato del email no es válido",
      });
    }

    // Validar largo de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        exito: false,
        error: "Contraseña débil",
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar si el email ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        exito: false,
        error: "Email duplicado",
        mensaje: "Ya existe un usuario con ese email",
      });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      rol: rol || "usuario",
    });

    res.status(201).json({
      exito: true,
      mensaje: "Usuario creado exitosamente",
      datos: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        stockAsignado: 0,
        estado: "activo",
        avatar: `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase(),
      },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);

    if (error.name === "ValidationError") {
      const mensajes = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        exito: false,
        error: "Error de validación",
        mensajes,
      });
    }

    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al crear usuario",
    });
  }
};

// @desc    Actualizar un usuario
// @route   PUT /api/usuarios/:id
// @access  Privado/Admin
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const { nombre, apellido, email, rol, estado } = req.body;

    // Verificar que el usuario existe
    let usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Usuario no encontrado",
      });
    }

    // Si cambia el email, verificar que no exista otro con ese email
    if (email && email !== usuario.email) {
      const emailExiste = await Usuario.findOne({
        email,
        _id: { $ne: id },
      });
      if (emailExiste) {
        return res.status(400).json({
          exito: false,
          error: "Email duplicado",
          mensaje: "Ya existe otro usuario con ese email",
        });
      }
    }

    // No permitir cambiar el rol del admin principal
    if (usuario.rol === "administrador" && rol && rol !== "administrador") {
      const adminsCount = await Usuario.countDocuments({
        rol: "administrador",
      });
      if (adminsCount <= 1) {
        return res.status(400).json({
          exito: false,
          error: "Operación no permitida",
          mensaje: "No se puede cambiar el rol del último administrador",
        });
      }
    }

    // Actualizar campos
    const camposActualizar = {};
    if (nombre) camposActualizar.nombre = nombre;
    if (apellido) camposActualizar.apellido = apellido;
    if (email) camposActualizar.email = email;
    if (rol) camposActualizar.rol = rol;
    if (estado !== undefined) camposActualizar.estado = estado;

    usuario = await Usuario.findByIdAndUpdate(id, camposActualizar, {
      new: true,
      runValidators: true,
    }).select("-password");

    // Obtener stock asignado
    const stockTotal = await StockUsuario.aggregate([
      { $match: { usuario: usuario._id } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } },
    ]);

    const stockAsignado = stockTotal.length > 0 ? stockTotal[0].total : 0;

    res.json({
      exito: true,
      mensaje: "Usuario actualizado exitosamente",
      datos: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        stockAsignado,
        estado: usuario.estado ? "activo" : "inactivo",
        avatar: `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase(),
      },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);

    if (error.name === "ValidationError") {
      const mensajes = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        exito: false,
        error: "Error de validación",
        mensajes,
      });
    }

    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al actualizar usuario",
    });
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/usuarios/:id
// @access  Privado/Admin
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Usuario no encontrado",
      });
    }

    // No permitir eliminar al último administrador
    if (usuario.rol === "administrador") {
      const adminsCount = await Usuario.countDocuments({
        rol: "administrador",
      });
      if (adminsCount <= 1) {
        return res.status(400).json({
          exito: false,
          error: "Operación no permitida",
          mensaje: "No se puede eliminar al último administrador del sistema",
        });
      }
    }

    // No permitir eliminarse a sí mismo
    if (req.usuario && req.usuario._id.toString() === id) {
      return res.status(400).json({
        exito: false,
        error: "Operación no permitida",
        mensaje: "No puedes eliminar tu propio usuario",
      });
    }

    // Verificar si tiene stock asignado
    const stockAsignado = await StockUsuario.countDocuments({
      usuario: id,
      cantidad: { $gt: 0 },
    });
    if (stockAsignado > 0) {
      return res.status(400).json({
        exito: false,
        error: "No se puede eliminar",
        mensaje:
          "El usuario tiene stock asignado. Transfiere el stock primero.",
      });
    }

    await Usuario.findByIdAndDelete(id);

    // También eliminar registros de stock del usuario
    await StockUsuario.deleteMany({ usuario: id });

    res.json({
      exito: true,
      mensaje: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al eliminar usuario",
    });
  }
};

// @desc    Cambiar estado de un usuario (activar/desactivar)
// @route   PATCH /api/usuarios/:id/estado
// @access  Privado/Admin
export const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Convertir a string si es booleano
    const nuevoEstado =
      typeof estado === "boolean" ? (estado ? "activo" : "inactivo") : estado;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true },
    );

    if (!usuario) {
      return res
        .status(404)
        .json({ exito: false, mensaje: "Usuario no encontrado" });
    }

    res.json({
      exito: true,
      mensaje: `Usuario ${nuevoEstado === "activo" ? "activado" : "desactivado"}`,
    });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};
