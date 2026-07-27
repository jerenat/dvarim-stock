// models/Empresa.js
import mongoose from "mongoose";

const empresaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  ruc: {
    type: String,
    required: true,
    unique: true,
  },
  direccion: {
    type: String,
  },
  telefono: {
    type: String,
  },
  email: {
    type: String,
  },
  logo: {
    type: String,
  },
  moneda: {
    type: String,
    default: "PYG",
  },
  configuracion: {
    stockBajo: {
      type: Number,
      default: 10,
      min: 0,
    },
    notificacionesEmail: {
      type: Boolean,
      default: true,
    },
    zonaHoraria: {
      type: String,
      default: "America/Asuncion",
    },
    idioma: {
      type: String,
      default: "es",
      enum: ["es", "en"],
    },
  },
}, {
  timestamps: true,
});

// ✅ Especificar el nombre exacto de la colección
const Empresa = mongoose.model("Empresa", empresaSchema, "empresa");

export default Empresa;