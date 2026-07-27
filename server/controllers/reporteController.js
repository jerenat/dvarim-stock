// controllers/reporteController.js
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import StockUsuario from "../models/StockUsuario.js";
import ProductoMasVendido from "../models/ProductoMasVendido.js";
import Movimiento from "../models/Movimiento.js";

// @desc    Obtener datos completos para reportes
// @route   GET /api/reportes
// @access  Privado
export const obtenerReportes = async (req, res) => {
  try {
    // 1. Stock bajo
    const productosStockBajo = await Producto.find({
      estado: "activo",
      stock: { $lt: 10 },
    })
      .populate("categoria", "nombre")
      .select("codigo nombre stock imagen categoria")
      .sort({ stock: 1 });

    // 2. Más vendidos (ahora sí encuentra los datos)
    const masVendidos = await ProductoMasVendido.find().sort({ vendidos: -1 }).limit(5).lean();

    // 3. Stock por usuario
    const usuarios = await Usuario.find({
      rol: "usuario",
      estado: "activo",
    })
      .select("nombre apellido")
      .lean();

    const stockPorUsuarioData = await Promise.all(
      usuarios.map(async (usuario) => {
        const stockItems = await StockUsuario.find({ usuario: usuario._id }).lean();
        const totalStock = stockItems.reduce((sum, item) => sum + item.cantidad, 0);
        return {
          nombre: usuario.nombre,
          stock: totalStock,
        };
      }),
    );
    stockPorUsuarioData.sort((a, b) => b.stock - a.stock);

    // 4. Últimos movimientos
    const movimientos = await Movimiento.find()
      .populate("producto", "nombre")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 5. Resumen
    const [totalProductos, totalUsuarios, totalMovimientos] = await Promise.all([
      Producto.countDocuments({ estado: "activo" }),
      Usuario.countDocuments({ estado: "activo" }),
      Movimiento.countDocuments(),
    ]);

    res.json({
      exito: true,
      datos: {
        resumen: {
          totalProductos,
          totalUsuarios,
          productosBajos: productosStockBajo.length,
          totalMovimientos,
        },
        stockBajo: productosStockBajo.map((p) => ({
          id: p._id,
          codigo: p.codigo,
          nombre: p.nombre,
          imagen: p.imagen,
          categoria: p.categoria?.nombre || "Sin categoría",
          stock: p.stock,
        })),
        masVendidos: masVendidos.map((p) => ({
          nombre: p.nombre,
          vendidos: p.vendidos,
        })),
        stockPorUsuario: stockPorUsuarioData,
        movimientos: movimientos.map((m) => ({
          id: m._id,
          fecha: m.createdAt,
          tipo: m.tipo,
          producto: m.producto?.nombre || "Producto eliminado",
          cantidad: m.cantidad,
          estado: m.estado,
        })),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: error.message,
    });
  }
};


// Las otras funciones se mantienen igual...
export const obtenerMasVendidos = async (req, res) => {
  console.log("productos mas vendidos");
  try {
    const masVendidos = await ProductoMasVendido.find().sort({ vendidos: -1 }).limit(10);

    res.json({
      exito: true,
      datos: masVendidos,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener productos más vendidos",
    });
  }
};

// @desc    Obtener stock bajo
// @route   GET /api/reportes/stock-bajo
// @access  Privado/Admin
export const obtenerStockBajo = async (req, res) => {
  try {
    const productos = await Producto.find({
      estado: "activo",
      stock: { $lt: 10 },
    })
      .populate("categoria", "nombre")
      .sort({ stock: 1 });

    res.json({
      exito: true,
      total: productos.length,
      datos: productos.map((p) => ({
        id: p._id,
        codigo: p.codigo,
        nombre: p.nombre,
        stock: p.stock,
        imagen: p.imagen,
        categoria: p.categoria?.nombre,
        precio: p.precio,
      })),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener stock bajo",
    });
  }
};

// @desc    Obtener movimientos por fecha
// @route   GET /api/reportes/movimientos
// @access  Privado
export const obtenerMovimientosPorFecha = async (req, res) => {
  try {
    const { desde, hasta, tipo } = req.query;

    const filtro = {};

    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) filtro.createdAt.$lte = new Date(hasta);
    }

    if (tipo && tipo !== "todos") {
      filtro.tipo = tipo;
    }

    const movimientos = await Movimiento.find(filtro)
      .populate("producto", "codigo nombre imagen")
      .populate("origen", "nombre apellido")
      .populate("destino", "nombre apellido")
      .populate("registradoPor", "nombre apellido")
      .sort({ createdAt: -1 })
      .limit(200);

    const movimientosFormateados = movimientos.map((m) => ({
      id: m._id,
      fecha: m.createdAt,
      tipo: m.tipo,
      producto: m.producto?.nombre || "Producto eliminado",
      codigo: m.producto?.codigo,
      imagen: m.producto?.imagen || "📦",
      origen: m.origen ? `${m.origen.nombre} ${m.origen.apellido}` : "N/A",
      destino: m.destino ? `${m.destino.nombre} ${m.destino.apellido}` : "N/A",
      cantidad: m.cantidad,
      estado: m.estado,
      notas: m.notas,
      registradoPor: m.registradoPor
        ? `${m.registradoPor.nombre} ${m.registradoPor.apellido}`
        : "Sistema",
    }));

    res.json({
      exito: true,
      total: movimientosFormateados.length,
      datos: movimientosFormateados,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener movimientos",
    });
  }
};
