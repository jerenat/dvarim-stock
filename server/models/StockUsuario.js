// models/StockUsuario.js
import mongoose from 'mongoose';

const stockUsuarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es requerido']
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'El producto es requerido']
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [0, 'La cantidad no puede ser negativa'],
    default: 0
  },
  ubicacion: {
    type: String,
    trim: true,
    default: 'Depósito principal'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índice compuesto único para evitar duplicados
stockUsuarioSchema.index({ usuario: 1, producto: 1 }, { unique: true });

// Método para obtener stock de un usuario
stockUsuarioSchema.statics.obtenerStockUsuario = function(usuarioId) {
  return this.find({ usuario: usuarioId })
    .populate('producto', 'codigo nombre precio imagen')
    .sort({ 'producto.nombre': 1 });
};

// Método para actualizar cantidad
stockUsuarioSchema.statics.actualizarCantidad = async function(usuarioId, productoId, cantidad) {
  const stock = await this.findOne({ usuario: usuarioId, producto: productoId });
  
  if (!stock) {
    throw new Error('No se encontró el stock para este usuario y producto');
  }
  
  stock.cantidad += cantidad;
  
  if (stock.cantidad < 0) {
    throw new Error('Stock insuficiente');
  }
  
  return stock.save();
};

// EL NOMBRE DE LA COLECCIÓN DEBE COINCIDIR CON MONGODB
const StockUsuario = mongoose.model('StockUsuario', stockUsuarioSchema, 'stock_usuarios');

export default StockUsuario;