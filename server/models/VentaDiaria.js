// models/VentaDiaria.js
import mongoose from 'mongoose';

const detalleVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const ventaDiariaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida']
  },
  diaSemana: {
    type: String,
    enum: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    required: true
  },
  totalVentas: {
    type: Number,
    default: 0,
    min: 0
  },
  montoTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  detalleVentas: [detalleVentaSchema],
  canalVenta: {
    type: String,
    enum: ['local', 'online', 'mayorista'],
    default: 'local'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
ventaDiariaSchema.index({ fecha: 1 });
ventaDiariaSchema.index({ diaSemana: 1 });
ventaDiariaSchema.index({ usuario: 1, fecha: 1 });

// Método estático para obtener resumen semanal
ventaDiariaSchema.statics.resumenSemanal = function(fechaInicio) {
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + 7);
  
  return this.aggregate([
    {
      $match: {
        fecha: { $gte: new Date(fechaInicio), $lt: fechaFin }
      }
    },
    {
      $group: {
        _id: '$diaSemana',
        totalVentas: { $sum: '$totalVentas' },
        montoTotal: { $sum: '$montoTotal' },
        promedioVenta: { $avg: '$montoTotal' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Método estático para productos más vendidos
ventaDiariaSchema.statics.productosMasVendidos = function(limite = 5, dias = 30) {
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  
  return this.aggregate([
    {
      $match: {
        fecha: { $gte: fechaInicio }
      }
    },
    { $unwind: '$detalleVentas' },
    {
      $group: {
        _id: '$detalleVentas.producto',
        totalVendido: { $sum: '$detalleVentas.cantidad' },
        montoTotal: { $sum: '$detalleVentas.subtotal' }
      }
    },
    {
      $lookup: {
        from: 'productos',
        localField: '_id',
        foreignField: '_id',
        as: 'producto'
      }
    },
    { $unwind: '$producto' },
    {
      $project: {
        _id: 0,
        productoId: '$_id',
        nombre: '$producto.nombre',
        codigo: '$producto.codigo',
        totalVendido: 1,
        montoTotal: 1
      }
    },
    { $sort: { totalVendido: -1 } },
    { $limit: limite }
  ]);
};

const VentaDiaria = mongoose.model('VentaDiaria', ventaDiariaSchema);

export default VentaDiaria;