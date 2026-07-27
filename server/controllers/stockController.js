// controllers/stockController.js
import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import StockUsuario from "../models/StockUsuario.js";

// @desc    Obtener stock general (todos los productos)
// @route   GET /api/stock/general
// @access  Privado
export const obtenerStockGeneral = async (req, res) => {
  try {
    const { q } = req.query;

    const filtro = { estado: "activo" };

    // Búsqueda por nombre
    if (q) {
      filtro.nombre = { $regex: q, $options: "i" };
    }

    const productos = await Producto.find(filtro)
      .populate("categoria", "nombre")
      .sort({ nombre: 1 });

    const productosFormateados = productos.map((p) => ({
      id: p._id,
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria?.nombre || "Sin categoría",
      stock: p.stock,
      estado: p.estado,
      imagen: p.imagen,
      stockBajo: p.stock < 10,
      stockMedio: p.stock >= 10 && p.stock < 30,
      stockOptimo: p.stock >= 30,
    }));

    // Estadísticas generales
    const totalProductos = productos.length;
    const productosStockBajo = productos.filter((p) => p.stock < 10).length;
    const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);

    res.json({
      exito: true,
      datos: productosFormateados,
      estadisticas: {
        totalProductos,
        productosStockBajo,
        stockTotal,
      },
    });
  } catch (error) {
    console.error("Error al obtener stock general:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener stock general",
    });
  }
};

// @desc    Obtener stock por usuarios
// @route   GET /api/stock/usuarios
// @access  Privado
export const obtenerStockPorUsuarios = async (req, res) => {
  try {
    console.log("📦 Obteniendo stock por usuarios...");

    // CORRECCIÓN: Buscar por string 'activo' en lugar de booleano true
    const usuarios = await Usuario.find({
      rol: "usuario",
      estado: "activo", // ← Cambiado de true a 'activo'
    }).select("nombre apellido email");

    console.log(`👥 Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach((u) => console.log(`   - ${u.nombre} ${u.apellido} (${u._id})`));

    if (usuarios.length === 0) {
      return res.json({
        exito: true,
        datos: [],
      });
    }

    // Verificar stock total
    const totalStock = await StockUsuario.countDocuments();
    console.log(`📦 Total registros en stock_usuarios: ${totalStock}`);

    const usuariosConStock = [];

    for (const usuario of usuarios) {
      // Buscar stock del usuario
      const stockItems = await StockUsuario.find({
        usuario: usuario._id,
      }).populate("producto", "codigo nombre imagen");

      console.log(`📋 ${usuario.nombre}: ${stockItems.length} items`);

      if (stockItems.length > 0) {
        const itemsFormateados = stockItems
          .filter((item) => item.producto !== null)
          .map((item) => ({
            productoId: item.producto._id,
            nombre: item.producto.nombre,
            codigo: item.producto.codigo,
            imagen: item.producto.imagen || "📦",
            cantidad: item.cantidad,
          }));

        const stockAsignado = itemsFormateados.reduce((sum, item) => sum + item.cantidad, 0);

        usuariosConStock.push({
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          avatar: `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase(),
          stockAsignado,
          totalProductos: itemsFormateados.length,
          items: itemsFormateados,
        });
      }
    }

    console.log(`✅ Usuarios con stock: ${usuariosConStock.length}`);

    res.json({
      exito: true,
      datos: usuariosConStock,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: error.message,
    });
  }
};

// @desc    Obtener stock de un usuario específico
// @route   GET /api/stock/usuarios/:id
// @access  Privado
export const obtenerStockUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Usuario no encontrado",
      });
    }

    const stockItems = await StockUsuario.find({ usuario: id }).populate(
      "producto",
      "codigo nombre precio imagen categoria",
    );

    const itemsFormateados = stockItems.map((item) => ({
      productoId: item.producto?._id,
      nombre: item.producto?.nombre,
      codigo: item.producto?.codigo,
      precio: item.producto?.precio,
      imagen: item.producto?.imagen,
      cantidad: item.cantidad,
      ubicacion: item.ubicacion,
    }));

    const stockAsignado = stockItems.reduce((sum, item) => sum + item.cantidad, 0);

    res.json({
      exito: true,
      datos: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          avatar: `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase(),
        },
        stockAsignado,
        totalProductos: itemsFormateados.length,
        items: itemsFormateados,
      },
    });
  } catch (error) {
    console.error("Error al obtener stock de usuario:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener stock del usuario",
    });
  }
};

// @desc    Transferir stock entre usuarios
// @route   POST /api/stock/transferir
// @access  Privado/Admin
export const transferirStock = async (req, res) => {
  try {
    const { productoId, usuarioOrigenId, usuarioDestinoId, cantidad } = req.body;

    // Validaciones
    if (!productoId || !usuarioOrigenId || !usuarioDestinoId || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Producto, origen, destino y cantidad son requeridos",
      });
    }

    if (cantidad <= 0) {
      return res.status(400).json({
        exito: false,
        error: "Cantidad inválida",
        mensaje: "La cantidad debe ser mayor a 0",
      });
    }

    // Verificar que el producto existe
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Producto no encontrado",
      });
    }

    // Verificar stock del origen (si no es admin, es transferencia desde stock general)
    if (usuarioOrigenId) {
      const stockOrigen = await StockUsuario.findOne({
        usuario: usuarioOrigenId,
        producto: productoId,
      });

      if (!stockOrigen || stockOrigen.cantidad < cantidad) {
        return res.status(400).json({
          exito: false,
          error: "Stock insuficiente",
          mensaje: "El usuario origen no tiene suficiente stock",
        });
      }

      // Restar del origen
      stockOrigen.cantidad -= cantidad;
      await stockOrigen.save();
    } else {
      // Si no hay origen, es desde stock general (admin)
      if (producto.stock < cantidad) {
        return res.status(400).json({
          exito: false,
          error: "Stock insuficiente",
          mensaje: "No hay suficiente stock general",
        });
      }

      producto.stock -= cantidad;
      await producto.save();
    }

    // Sumar al destino
    let stockDestino = await StockUsuario.findOne({
      usuario: usuarioDestinoId,
      producto: productoId,
    });

    if (stockDestino) {
      stockDestino.cantidad += cantidad;
      await stockDestino.save();
    } else {
      await StockUsuario.create({
        usuario: usuarioDestinoId,
        producto: productoId,
        cantidad,
      });
    }

    res.json({
      exito: true,
      mensaje: "Stock transferido exitosamente",
    });
  } catch (error) {
    console.error("Error al transferir stock:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al transferir stock",
    });
  }
};

// @desc    Obtener alertas de stock bajo
// @route   GET /api/stock/alertas
// @access  Privado/Admin
export const obtenerAlertasStock = async (req, res) => {
  try {
    const productosStockBajo = await Producto.find({
      estado: "activo",
      stock: { $lt: 10 },
    })
      .populate("categoria", "nombre")
      .sort({ stock: 1 });

    res.json({
      exito: true,
      total: productosStockBajo.length,
      datos: productosStockBajo.map((p) => ({
        id: p._id,
        codigo: p.codigo,
        nombre: p.nombre,
        stock: p.stock,
        imagen: p.imagen,
        categoria: p.categoria?.nombre,
      })),
    });
  } catch (error) {
    console.error("Error al obtener alertas:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener alertas de stock",
    });
  }
};
