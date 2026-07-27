// controllers/movimientoController.js
import mongoose from 'mongoose';
import Movimiento from '../models/Movimiento.js';
import Producto from '../models/Producto.js';
import Usuario from '../models/Usuario.js';

// @desc    Obtener todos los movimientos con filtros
// @route   GET /api/movimientos
// @access  Privado
export const obtenerMovimientos = async (req, res) => {
  try {
    const { q, tipo, estado, pagina = 1, limite = 50 } = req.query;

    const filtro = {};

    // Filtro por tipo
    if (tipo && tipo !== 'todos') {
      filtro.tipo = tipo;
    }

    // Filtro por estado
    if (estado && estado !== 'todos') {
      filtro.estado = estado;
    }

    // Si hay búsqueda, primero buscar productos que coincidan
    if (q && q.trim() !== '') {
      const productosCoincidentes = await Producto.find({
        nombre: { $regex: q, $options: 'i' }
      }).select('_id');
      
      const usuariosCoincidentes = await Usuario.find({
        $or: [
          { nombre: { $regex: q, $options: 'i' } },
          { apellido: { $regex: q, $options: 'i' } }
        ]
      }).select('_id');

      filtro.$or = [
        { producto: { $in: productosCoincidentes.map(p => p._id) } },
        { origen: { $in: usuariosCoincidentes.map(u => u._id) } },
        { destino: { $in: usuariosCoincidentes.map(u => u._id) } },
        { registradoPor: { $in: usuariosCoincidentes.map(u => u._id) } }
      ];
    }

    // Paginación
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    // Obtener movimientos con populate
    const [movimientos, total] = await Promise.all([
      Movimiento.find(filtro)
        .populate('producto', 'codigo nombre')
        .populate('origen', 'nombre apellido')
        .populate('destino', 'nombre apellido')
        .populate('registradoPor', 'nombre apellido')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limite)),
      Movimiento.countDocuments(filtro)
    ]);

    // Formatear movimientos para el frontend
    const movimientosFormateados = movimientos.map(m => ({
      id: m._id,
      fecha: m.createdAt,
      tipo: m.tipo,
      producto: m.producto?.nombre || 'Producto eliminado',
      productoId: m.producto?._id,
      origen: m.origen 
        ? `${m.origen.nombre} ${m.origen.apellido}` 
        : 'Proveedor',
      destino: m.destino 
        ? `${m.destino.nombre} ${m.destino.apellido}` 
        : 'Cliente',
      cantidad: m.cantidad,
      usuario: m.registradoPor 
        ? `${m.registradoPor.nombre} ${m.registradoPor.apellido}` 
        : 'Sistema',
      estado: m.estado,
      notas: m.notas
    }));

    // Estadísticas
    const estadisticas = await Movimiento.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 },
          cantidadTotal: { $sum: '$cantidad' }
        }
      }
    ]);

    res.json({
      exito: true,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
      datos: movimientosFormateados,
      estadisticas
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      exito: false,
      error: 'Error del servidor',
      mensaje: 'Error al obtener movimientos: ' + error.message
    });
  }
};

// @desc    Obtener un movimiento por ID
// @route   GET /api/movimientos/:id
// @access  Privado
export const obtenerMovimiento = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID inválido',
        mensaje: 'El ID proporcionado no es válido'
      });
    }

    const movimiento = await Movimiento.findById(id)
      .populate('producto', 'codigo nombre precio imagen')
      .populate('origen', 'nombre apellido email')
      .populate('destino', 'nombre apellido email')
      .populate('registradoPor', 'nombre apellido');

    if (!movimiento) {
      return res.status(404).json({
        exito: false,
        error: 'No encontrado',
        mensaje: 'Movimiento no encontrado'
      });
    }

    res.json({
      exito: true,
      datos: movimiento
    });

  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({
      exito: false,
      error: 'Error del servidor',
      mensaje: 'Error al obtener movimiento'
    });
  }
};

// @desc    Crear un nuevo movimiento
// @route   POST /api/movimientos
// @access  Privado/Admin
export const crearMovimiento = async (req, res) => {
  try {
    const { tipo, producto: productoId, origen: origenId, destino: destinoId, cantidad, notas } = req.body;

    // Validaciones
    if (!tipo || !productoId || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: 'Datos incompletos',
        mensaje: 'Tipo, producto y cantidad son requeridos'
      });
    }

    // Verificar producto
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({
        exito: false,
        error: 'Producto no encontrado',
        mensaje: 'El producto no existe'
      });
    }

    // Crear movimiento
    const movimiento = await Movimiento.create({
      tipo,
      producto: productoId,
      origen: origenId || null,
      destino: destinoId || null,
      cantidad,
      estado: 'completado',
      notas: notas || `Movimiento de ${tipo} registrado`,
      registradoPor: req.usuario._id
    });

    // Actualizar stock según el tipo de movimiento
    if (tipo === 'ingreso') {
      producto.stock += cantidad;
      await producto.save();
    } else if (tipo === 'venta') {
      if (producto.stock < cantidad) {
        return res.status(400).json({
          exito: false,
          error: 'Stock insuficiente',
          mensaje: 'No hay suficiente stock para esta venta'
        });
      }
      producto.stock -= cantidad;
      await producto.save();
    }

    const movimientoCompleto = await Movimiento.findById(movimiento._id)
      .populate('producto', 'nombre')
      .populate('origen', 'nombre apellido')
      .populate('destino', 'nombre apellido')
      .populate('registradoPor', 'nombre apellido');

    res.status(201).json({
      exito: true,
      mensaje: 'Movimiento registrado exitosamente',
      datos: movimientoCompleto
    });

  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({
      exito: false,
      error: 'Error del servidor',
      mensaje: 'Error al crear movimiento'
    });
  }
};

// @desc    Obtener estadísticas de movimientos
// @route   GET /api/movimientos/estadisticas
// @access  Privado
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

    const estadisticas = await Movimiento.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaInicio }
        }
      },
      {
        $group: {
          _id: {
            tipo: '$tipo',
            fecha: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          total: { $sum: 1 },
          cantidadTotal: { $sum: '$cantidad' }
        }
      },
      {
        $group: {
          _id: '$_id.fecha',
          movimientos: {
            $push: {
              tipo: '$_id.tipo',
              total: '$total',
              cantidad: '$cantidadTotal'
            }
          },
          totalDia: { $sum: '$total' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      exito: true,
      periodo: `${dias} días`,
      datos: estadisticas
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      exito: false,
      error: 'Error del servidor',
      mensaje: 'Error al obtener estadísticas'
    });
  }
};