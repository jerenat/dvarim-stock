// models/ProductoMasVendido.js
import mongoose from 'mongoose';

const productoMasVendidoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  vendidos: {
    type: Number,
    required: true,
    min: 0
  },
  periodo: {
    type: String,
    enum: ['diario', 'semanal', 'mensual', 'anual'],
    default: 'semanal'
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'produtos_mas_vendidos' // ← Nombre exacto donde están los datos
});

const ProductoMasVendido = mongoose.model('ProductoMasVendido', productoMasVendidoSchema);

export default ProductoMasVendido;