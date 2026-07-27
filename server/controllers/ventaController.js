// controllers/ventaController.js
import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import StockUsuario from "../models/StockUsuario.js";
import Movimiento from "../models/Movimiento.js";

// @desc    Registrar una venta
// @route   POST /api/ventas
// @access  Privado
export const registrarVenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { producto: productoId, cantidad, cliente, observaciones } = req.body;
    const usuarioId = req.usuario._id;

    console.log("🛒 Registrando venta:", { productoId, cantidad, usuarioId });

    // Validaciones
    if (!productoId || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Producto y cantidad son requeridos",
      });
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({
        exito: false,
        error: "Cantidad inválida",
        mensaje: "La cantidad debe ser un número mayor a 0",
      });
    }

    // Verificar que el producto existe y está activo
    const producto = await Producto.findOne({
      _id: productoId,
      estado: "activo",
    }).session(session);

    if (!producto) {
      return res.status(404).json({
        exito: false,
        error: "Producto no encontrado",
        mensaje: "El producto no existe o está inactivo",
      });
    }

    // Verificar stock del usuario
    const stockUsuario = await StockUsuario.findOne({
      usuario: usuarioId,
      producto: productoId,
    }).session(session);

    if (!stockUsuario || stockUsuario.cantidad < cantidadNum) {
      const stockDisponible = stockUsuario ? stockUsuario.cantidad : 0;
      return res.status(400).json({
        exito: false,
        error: "Stock insuficiente",
        mensaje: `No tenés suficiente stock de "${producto.nombre}". Disponible: ${stockDisponible}, Solicitado: ${cantidadNum}`,
        stockDisponible,
      });
    }

    // Restar del stock del usuario
    stockUsuario.cantidad -= cantidadNum;
    await stockUsuario.save({ session });

    // Si el stock llega a 0, opcionalmente eliminar el registro
    if (stockUsuario.cantidad === 0) {
      await StockUsuario.findByIdAndDelete(stockUsuario._id, { session });
    }

    // Registrar el movimiento
    const movimiento = await Movimiento.create(
      [
        {
          tipo: "venta",
          producto: productoId,
          origen: usuarioId,
          destino: null,
          cantidad: cantidadNum,
          estado: "completado",
          notas: observaciones || `Venta a ${cliente || "cliente final"}`,
          registradoPor: usuarioId,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    console.log(
      `✅ Venta registrada: ${cantidadNum} unidades de ${producto.nombre}`,
    );

    // Obtener stock actualizado
    const stockActualizado = await StockUsuario.findOne({
      usuario: usuarioId,
      producto: productoId,
    });

    res.status(201).json({
      exito: true,
      mensaje: `Venta registrada exitosamente. ${cantidadNum} unidades de "${producto.nombre}"`,
      datos: {
        venta: {
          id: movimiento[0]._id,
          producto: producto.nombre,
          cantidad: cantidadNum,
          cliente: cliente || "Cliente final",
          precioUnitario: producto.precio,
          total: producto.precio * cantidadNum,
        },
        stockRestante: stockActualizado ? stockActualizado.cantidad : 0,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Error al registrar venta:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al registrar venta: " + error.message,
    });
  } finally {
    session.endSession();
  }
};

// @desc    Obtener productos disponibles para vender (stock del usuario)
// @route   GET /api/ventas/productos-disponibles
// @access  Privado
export const obtenerProductosDisponibles = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;

    // Buscar stock del usuario
    const stockUsuario = await StockUsuario.find({
      usuario: usuarioId,
      cantidad: { $gt: 0 },
    }).populate("producto", "codigo nombre precio imagen categoria");

    // Filtrar productos que existen (no fueron eliminados)
    const productosDisponibles = stockUsuario
      .filter((item) => item.producto !== null)
      .map((item) => ({
        id: item.producto._id,
        codigo: item.producto.codigo,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        imagen: item.producto.imagen || "📦",
        stockDisponible: item.cantidad,
        ubicacion: item.ubicacion,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    res.json({
      exito: true,
      total: productosDisponibles.length,
      datos: productosDisponibles,
    });
  } catch (error) {
    console.error("Error al obtener productos disponibles:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener productos disponibles",
    });
  }
};

// @desc    Obtener historial de ventas del usuario
// @route   GET /api/ventas
// @access  Privado
export const obtenerVentas = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;
    const usuarioId = req.usuario._id;

    const filtro = {
      tipo: "venta",
      $or: [{ origen: usuarioId }, { registradoPor: usuarioId }],
    };

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [ventas, total] = await Promise.all([
      Movimiento.find(filtro)
        .populate("producto", "codigo nombre precio imagen")
        .populate("origen", "nombre apellido")
        .populate("registradoPor", "nombre apellido")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limite)),
      Movimiento.countDocuments(filtro),
    ]);

    const ventasFormateadas = ventas.map((v) => ({
      id: v._id,
      fecha: v.createdAt,
      producto: v.producto?.nombre || "Producto eliminado",
      codigo: v.producto?.codigo,
      precio: v.producto?.precio,
      imagen: v.producto?.imagen || "📦",
      cantidad: v.cantidad,
      total: (v.producto?.precio || 0) * v.cantidad,
      estado: v.estado,
      notas: v.notas,
      vendedor: v.registradoPor
        ? `${v.registradoPor.nombre} ${v.registradoPor.apellido}`
        : "Sistema",
    }));

    // Calcular totales
    const totalVentas = ventasFormateadas.reduce((sum, v) => sum + v.total, 0);
    const totalUnidades = ventasFormateadas.reduce(
      (sum, v) => sum + v.cantidad,
      0,
    );

    res.json({
      exito: true,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
      resumen: {
        totalVentas,
        totalUnidades,
        cantidadVentas: ventasFormateadas.length,
      },
      datos: ventasFormateadas,
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener ventas",
    });
  }
};

// @desc    Obtener detalle de una venta
// @route   GET /api/ventas/:id
// @access  Privado
export const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const venta = await Movimiento.findOne({
      _id: id,
      tipo: "venta",
    })
      .populate("producto", "codigo nombre precio imagen categoria")
      .populate("origen", "nombre apellido email")
      .populate("registradoPor", "nombre apellido");

    if (!venta) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Venta no encontrada",
      });
    }

    res.json({
      exito: true,
      datos: {
        id: venta._id,
        fecha: venta.createdAt,
        producto: venta.producto,
        cantidad: venta.cantidad,
        precioUnitario: venta.producto?.precio,
        total: (venta.producto?.precio || 0) * venta.cantidad,
        vendedor: venta.registradoPor,
        estado: venta.estado,
        notas: venta.notas,
      },
    });
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener venta",
    });
  }
};
