// controllers/categoriaController.js
import mongoose from "mongoose";
import Categoria from "../models/Categoria.js";
import Producto from "../models/Producto.js";

// @desc    Obtener todas las categorías
// @route   GET /api/categorias
// @access  Privado
export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ estado: "activo" }).sort({ nombre: 1 });

    // Obtener conteo de productos para cada categoría
    const categoriasConProductos = await Promise.all(
      categorias.map(async (cat) => {
        const count = await Producto.countDocuments({
          categoria: cat._id,
          estado: "activo",
        });
        return {
          id: cat._id,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          productos: count,
          color: cat.color,
          estado: cat.estado,
        };
      }),
    );

    res.json({
      exito: true,
      total: categoriasConProductos.length,
      datos: categoriasConProductos,
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

// @desc    Obtener una categoría por ID
// @route   GET /api/categorias/:id
// @access  Privado
export const obtenerCategoria = async (req, res) => {
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

    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Categoría no encontrada",
      });
    }

    // Obtener productos de esta categoría
    const productos = await Producto.find({
      categoria: id,
      estado: "activo",
    }).select("codigo nombre precio stock imagen");

    const count = productos.length;

    res.json({
      exito: true,
      datos: {
        id: categoria._id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color,
        estado: categoria.estado,
        productos: count,
        listaProductos: productos,
      },
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al obtener categoría",
    });
  }
};

// @desc    Crear una nueva categoría
// @route   POST /api/categorias
// @access  Privado/Admin
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, color } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion) {
      return res.status(400).json({
        exito: false,
        error: "Datos incompletos",
        mensaje: "Nombre y descripción son requeridos",
      });
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExiste = await Categoria.findOne({ nombre });
    if (categoriaExiste) {
      return res.status(400).json({
        exito: false,
        error: "Categoría duplicada",
        mensaje: "Ya existe una categoría con ese nombre",
      });
    }

    // Crear categoría
    const categoria = await Categoria.create({
      nombre,
      descripcion,
      color: color || "#6366f1",
    });

    res.status(201).json({
      exito: true,
      mensaje: "Categoría creada exitosamente",
      datos: {
        id: categoria._id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color,
        productos: 0,
      },
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);

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
      mensaje: "Error al crear categoría",
    });
  }
};

// @desc    Actualizar una categoría
// @route   PUT /api/categorias/:id
// @access  Privado/Admin
export const actualizarCategoria = async (req, res) => {
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

    const { nombre, descripcion, color, estado } = req.body;

    // Verificar que la categoría existe
    let categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Categoría no encontrada",
      });
    }

    // Si cambia el nombre, verificar que no exista otra con ese nombre
    if (nombre && nombre !== categoria.nombre) {
      const nombreExiste = await Categoria.findOne({
        nombre,
        _id: { $ne: id },
      });
      if (nombreExiste) {
        return res.status(400).json({
          exito: false,
          error: "Nombre duplicado",
          mensaje: "Ya existe otra categoría con ese nombre",
        });
      }
    }

    // Actualizar campos
    const camposActualizar = {};
    if (nombre) camposActualizar.nombre = nombre;
    if (descripcion) camposActualizar.descripcion = descripcion;
    if (color) camposActualizar.color = color;
    if (estado) camposActualizar.estado = estado;

    categoria = await Categoria.findByIdAndUpdate(id, camposActualizar, {
      new: true,
      runValidators: true,
    });

    // Obtener conteo de productos
    const count = await Producto.countDocuments({
      categoria: id,
      estado: "activo",
    });

    res.json({
      exito: true,
      mensaje: "Categoría actualizada exitosamente",
      datos: {
        id: categoria._id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color,
        estado: categoria.estado,
        productos: count,
      },
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);

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
      mensaje: "Error al actualizar categoría",
    });
  }
};

// @desc    Eliminar una categoría
// @route   DELETE /api/categorias/:id
// @access  Privado/Admin
export const eliminarCategoria = async (req, res) => {
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

    // Verificar que la categoría existe
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        exito: false,
        error: "No encontrado",
        mensaje: "Categoría no encontrada",
      });
    }

    // Verificar si hay productos asociados
    const productosCount = await Producto.countDocuments({ categoria: id });
    if (productosCount > 0) {
      return res.status(400).json({
        exito: false,
        error: "No se puede eliminar",
        mensaje: `La categoría tiene ${productosCount} productos asociados. Reasígnalos primero.`,
      });
    }

    await Categoria.findByIdAndDelete(id);

    res.json({
      exito: true,
      mensaje: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({
      exito: false,
      error: "Error del servidor",
      mensaje: "Error al eliminar categoría",
    });
  }
};
