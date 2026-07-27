// models/Categoria.js
import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Método para contar productos de esta categoría
categoriaSchema.virtual('totalProductos', {
  ref: 'Producto',
  localField: '_id',
  foreignField: 'categoria',
  count: true
});

// Método estático para actualizar contador
categoriaSchema.statics.actualizarContadorProductos = async function(categoriaId) {
  const Producto = mongoose.model('Producto');
  const count = await Producto.countDocuments({ 
    categoria: categoriaId,
    estado: 'activo'
  });
  return this.findByIdAndUpdate(categoriaId, { productos: count });
};

const Categoria = mongoose.model('Categoria', categoriaSchema);

export default Categoria;