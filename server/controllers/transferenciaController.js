// controllers/transferenciaController.js
import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import StockUsuario from "../models/StockUsuario.js";
import Movimiento from "../models/Movimiento.js";

// @desc    Realizar una transferencia de stock
// @route   POST /api/transferencias
// @access  Privado/Admin
export const crearTransferencia = async (req, res) => {
  try {
    const {
      usuario: usuarioId,
      producto: productoId,
      cantidad,
      observaciones,
    } = req.body;

    if (!usuarioId || !productoId || !cantidad) {
      return res
        .status(400)
        .json({ exito: false, mensaje: "Todos los campos son requeridos" });
    }

    const cantidadNum = parseInt(cantidad);
    if (cantidadNum <= 0) {
      return res
        .status(400)
        .json({ exito: false, mensaje: "Cantidad debe ser mayor a 0" });
    }

    // Verificar producto
    const producto = await Producto.findOne({
      _id: productoId,
      estado: "activo",
    });
    if (!producto)
      return res
        .status(404)
        .json({ exito: false, mensaje: "Producto no encontrado" });
    if (producto.stock < cantidadNum) {
      return res
        .status(400)
        .json({
          exito: false,
          mensaje: `Stock insuficiente. Disponible: ${producto.stock}`,
        });
    }

    // Verificar usuario
    const usuario = await Usuario.findOne({
      _id: usuarioId,
      rol: "usuario",
      estado: "activo",
    });
    if (!usuario)
      return res
        .status(404)
        .json({ exito: false, mensaje: "Usuario no válido" });

    // Realizar transferencia
    producto.stock -= cantidadNum;
    await producto.save();

    // Stock del usuario
    await StockUsuario.findOneAndUpdate(
      { usuario: usuarioId, producto: productoId },
      { $inc: { cantidad: cantidadNum } },
      { upsert: true },
    );

    // ✅ Actualizar stockAsignado del usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      $inc: { stockAsignado: cantidadNum },
    });

    // Registrar movimiento
    await Movimiento.create({
      tipo: "transferencia",
      producto: productoId,
      origen: req.usuario._id,
      destino: usuarioId,
      cantidad: cantidadNum,
      estado: "completado",
      notas: observaciones || `Transferencia a ${usuario.nombre}`,
      registradoPor: req.usuario._id,
    });

    res.json({
      exito: true,
      mensaje: `Transferencia completada a ${usuario.nombre} ${usuario.apellido}`,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// @desc    Obtener usuarios disponibles para transferencia
// @route   GET /api/transferencias/usuarios
// @access  Privado/Admin
export const obtenerUsuariosParaTransferencia = async (req, res) => {
  try {
    const usuarios = await Usuario.find({
      rol: "usuario",
      estado: "activo",
    }).select("nombre apellido email avatar");

    const usuariosFormateados = usuarios.map((u) => ({
      id: u._id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      avatar: u.avatar || `${u.nombre[0]}${u.apellido[0]}`.toUpperCase(),
      nombreCompleto: `${u.nombre} ${u.apellido}`,
    }));

    res.json({
      exito: true,
      datos: usuariosFormateados,
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

// @desc    Obtener productos disponibles para transferencia
// @route   GET /api/transferencias/productos
// @access  Privado/Admin
export const obtenerProductosParaTransferencia = async (req, res) => {
  try {
    const productos = await Producto.find({
      estado: "activo",
      stock: { $gt: 0 }, // Solo productos con stock disponible
    })
      .populate("categoria", "nombre")
      .select("codigo nombre stock imagen categoria")
      .sort({ nombre: 1 });

    const productosFormateados = productos.map((p) => ({
      id: p._id,
      codigo: p.codigo,
      nombre: p.nombre,
      stock: p.stock,
      imagen: p.imagen,
      categoria: p.categoria?.nombre || "Sin categoría",
    }));

    res.json({
      exito: true,
      total: productosFormateados.length,
      datos: productosFormateados,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener productos",
    });
  }
};

// @desc    Obtener historial de transferencias
// @route   GET /api/transferencias
// @access  Privado/Admin
export const obtenerTransferencias = async (req, res) => {
  try {
    const transferencias = await Movimiento.find({ tipo: "transferencia" })
      .populate("producto", "codigo nombre imagen")
      .populate("origen", "nombre apellido")
      .populate("destino", "nombre apellido")
      .populate("registradoPor", "nombre apellido")
      .sort({ createdAt: -1 })
      .limit(50);

    const transferenciasFormateadas = transferencias.map((t) => ({
      id: t._id,
      fecha: t.createdAt,
      producto: t.producto?.nombre || "Producto eliminado",
      codigo: t.producto?.codigo || "",
      imagen: t.producto?.imagen || "📦",
      origen: t.origen
        ? `${t.origen.nombre} ${t.origen.apellido}`
        : "Stock General",
      destino: t.destino ? `${t.destino.nombre} ${t.destino.apellido}` : "N/A",
      cantidad: t.cantidad,
      estado: t.estado,
      notas: t.notas,
      registradoPor: t.registradoPor
        ? `${t.registradoPor.nombre} ${t.registradoPor.apellido}`
        : "Sistema",
    }));

    res.json({
      exito: true,
      total: transferenciasFormateadas.length,
      datos: transferenciasFormateadas,
    });
  } catch (error) {
    console.error("Error al obtener transferencias:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener transferencias",
    });
  }
};
