// models/Usuario.js
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },

    apellido: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    rol: {
        type: String,
        enum: ["administrador", "usuario"],
        default: "usuario",
    },

    estado: {
        type: String,
        default: true,
    },
    stockAsignado: {
        type: Number,
        default: 0,
        min: 0,
    },

}, {
    timestamps: true,
});

export default mongoose.model("Usuario", usuarioSchema);