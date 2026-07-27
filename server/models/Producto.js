// models/Producto.js
import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: true, // Esto ya crea un índice, no necesitas schema.index()
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es requerida']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  stockMinimo: {
    type: Number,
    default: 10,
    min: 0
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  imagen: {
    type: String,
    default: '📦'
  },
  descripcion: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Solo índices que NO están definidos en el schema con unique: true
productoSchema.index({ categoria: 1 });
productoSchema.index({ nombre: 'text', codigo: 'text' });
productoSchema.index({ estado: 1 });

// Virtual para saber si el stock está bajo
productoSchema.virtual('stockBajo').get(function() {
  return this.stock <= this.stockMinimo;
});

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;