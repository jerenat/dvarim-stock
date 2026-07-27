// models/Movimiento.js
import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: {
      values: ['ingreso', 'transferencia', 'venta', 'ajuste', 'devolucion'],
      message: '{VALUE} no es un tipo de movimiento válido'
    },
    required: [true, 'El tipo de movimiento es requerido']
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'El producto es requerido']
  },
  origen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  destino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  notas: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder los 500 caracteres']
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario que registra es requerido']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
movimientoSchema.index({ tipo: 1, createdAt: -1 });
movimientoSchema.index({ producto: 1, createdAt: -1 });
movimientoSchema.index({ estado: 1 });
movimientoSchema.index({ origen: 1, destino: 1 });
movimientoSchema.index({ createdAt: -1 });

// Método estático para obtener movimientos del día
movimientoSchema.statics.obtenerMovimientosDia = function(fecha = new Date()) {
  const inicio = new Date(fecha.setHours(0, 0, 0, 0));
  const fin = new Date(fecha.setHours(23, 59, 59, 999));
  
  return this.find({
    createdAt: { $gte: inicio, $lte: fin }
  })
  .populate('producto', 'codigo nombre')
  .populate('origen', 'nombre apellido')
  .populate('destino', 'nombre apellido')
  .populate('registradoPor', 'nombre apellido')
  .sort({ createdAt: -1 });
};

// Método estático para estadísticas de movimientos por día
movimientoSchema.statics.estadisticasPorDia = function(dias = 7) {
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: fechaInicio },
        estado: 'completado'
      }
    },
    {
      $group: {
        _id: {
          dia: { $dayOfWeek: '$createdAt' },
          tipo: '$tipo'
        },
        total: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.dia',
        tipos: {
          $push: {
            tipo: '$_id.tipo',
            total: '$total'
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const Movimiento = mongoose.model('Movimiento', movimientoSchema);

export default Movimiento;