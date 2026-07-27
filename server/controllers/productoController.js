// controllers/productoController.js
import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import Categoria from "../models/Categoria.js";
import StockUsuario from "../models/StockUsuario.js"

// @desc    Obtener todos los productos con filtros y paginación
// @route   GET /api/productos
// @access  Privado
export const obtenerProductos = async (req, res) => {
  try {
    const {
      q, // búsqueda por nombre o código
      categoria, // filtrar por categoría (ID)
      estado, // filtrar por estado
      pagina = 1,
      limite = 8, // mismo PAGE_SIZE que el frontend
    } = req.query;

    const filtro = {};

    // Búsqueda por texto (nombre o código)
    if (q) {
      filtro.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { codigo: { $regex: q, $options: "i" } },
      ];
    }

    // Filtrar por categoría
    if (categoria && categoria !== "todas") {
      // Buscar la categoría por nombre
      const cat = await Categoria.findOne({ nombre: categoria });
      if (cat) {
        filtro.categoria = cat._id;
      }
    }

    // Filtrar por estado
    if (estado) {
      filtro.estado = estado;
    }

    // Calcular paginación
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    // Obtener productos y total en paralelo
    const [productos, total] = await Promise.all([
      Producto.find(filtro)
        .populate("categoria", "nombre color")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limite)),
      Producto.countDocuments(filtro),
    ]);

    // Formatear respuesta para que coincida con el frontend
    const productosFormateados = productos.map((p) => ({
      id: p._id,
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria?.nombre || "Sin categoría",
      categoriaColor: p.categoria?.color,
      precio: p.precio,
      stock: p.stock,
      estado: p.estado,
      imagen: p.imagen,
      stockBajo: p.stock <= 10,
    }));

    res.json({
      exito: true,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
      limite: parseInt(limite),
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

// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// @access  Privado
export const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const producto = await Producto.findById(id).populate(
      "categoria",
      "nombre color descripcion",
    );

    if (!producto) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Producto no encontrado",
      });
    }

    res.json({
      exito: true,
      datos: producto,
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener producto",
    });
  }
};

// @desc    Crear un nuevo producto
// @route   POST /api/productos
// @access  Privado/Admin
export const crearProducto = async (req, res) => {
  try {
    const { codigo, nombre, categoria, precio, stock, imagen, descripcion } =
      req.body;

    // Validar campos requeridos
    if (!codigo || !nombre || !categoria || precio === undefined) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Código, nombre, categoría y precio son requeridos",
      });
    }

    // Verificar si el código ya existe
    const codigoExiste = await Producto.findOne({
      codigo: codigo.toUpperCase(),
    });
    if (codigoExiste) {
      return res.status(400).json({
        exito: false,
        error: "Código duplicado",
        mensaje: "Ya existe un producto con ese código",
      });
    }

    // Verificar que la categoría existe
    const categoriaExiste = await Categoria.findById(categoria);
    if (!categoriaExiste) {
      return res.status(400).json({
        exito: false,
        error: "Categoría inválida",
        mensaje: "La categoría seleccionada no existe",
      });
    }

    // Crear producto
    const producto = await Producto.create({
      codigo: codigo.toUpperCase(),
      nombre,
      categoria,
      precio,
      stock: stock || 0,
      imagen: imagen || "📦",
      descripcion,
    });

    // Devolver con la categoría populada
    const productoCreado = await Producto.findById(producto._id).populate(
      "categoria",
      "nombre color",
    );

    res.status(201).json({
      exito: true,
      mensaje: "Producto creado exitosamente",
      datos: productoCreado,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);

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
      mensaje: "Error al crear producto",
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/productos/:id
// @access  Privado/Admin
export const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("categoria", "nombre");

    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: "Producto no encontrado" });
    }

    res.json({ exito: true, mensaje: "Actualizado", datos: producto });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/productos/:id
// @access  Privado/Admin
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Intentando eliminar producto:", id);

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: "ID inválido",
        mensaje: "El ID proporcionado no es válido",
      });
    }

    // Buscar el producto
    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Producto no encontrado",
      });
    }

    console.log("📦 Producto encontrado:", producto.nombre);

    // Verificar si hay stock asignado a usuarios
    const stockAsignado = await StockUsuario.countDocuments({
      producto: id,
      cantidad: { $gt: 0 },
    });

    if (stockAsignado > 0) {
      return res.status(400).json({
        exito: false,
        error: "No se puede eliminar",
        mensaje: `El producto "${producto.nombre}" tiene stock asignado a ${stockAsignado} usuario(s). Retire el stock primero.`,
      });
    }

    // Eliminar el producto
    await Producto.findByIdAndDelete(id);

    console.log("✅ Producto eliminado:", producto.nombre);

    // Actualizar contador de categoría
    await Categoria.actualizarContadorProductos(producto.categoria);

    res.json({
      exito: true,
      mensaje: `Producto "${producto.nombre}" eliminado exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al eliminar producto: " + error.message,
    });
  }
};

// @desc    Obtener categorías
// @route   GET /api/productos/categorias
// @access  Privado
export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ estado: "activo" }).sort({
      nombre: 1,
    });

    // Contar productos por categoría
    const categoriasConContador = await Promise.all(
      categorias.map(async (cat) => {
        const count = await Producto.countDocuments({
          categoria: cat._id,
          estado: "activo",
        });
        return {
          id: cat._id,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          color: cat.color,
          productos: count,
        };
      }),
    );

    res.json({
      exito: true,
      total: categoriasConContador.length,
      datos: categoriasConContador,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener categorías",
    });
  }
};
