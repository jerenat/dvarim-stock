import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./config/database.js";

import authUser from "./routes/auth.routes.js";
import producto from "./routes/producto.routes.js";
import categoria from "./routes/categoria.routes.js";
import stock from "./routes/stock.routes.js";
import transferencia from "./routes/transferencia.routes.js";
import reporte from "./routes/reporte.routes.js";
import configuracion from "./routes/configuracion.routes.js";
import movimiento from "./routes/movimiento.routes.js";
import dashboard from "./routes/dashboard.routes.js";
import venta from "./routes/venta.routes.js";

dotenv.config(); // Conectar a Dotenv

connectDB(); // Conectar a MongoDB

const app = express(); // Conectar a Express
const PORT = process.env.PORT || 3000;

// -- CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080", // URL de tu frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// -- Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
// -- Morgan
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    mensaje: "StockPro API",
    version: "1.0.0",
    endpoints: {
      categorias: "/api/categorias",
      productos: "/api/productos",
      usuarios: "/api/usuarios",
      movimientos: "/api/movimientos",
      stock: "/api/stock",
      dashboard: "/api/dashboard",
    },
  });
});

// Ruta API
app.use("/api", authUser);
app.use("/api/productos", producto);
app.use("/api/categorias", categoria);
app.use("/api/stock", stock);
app.use("/api/transferencias", transferencia);
app.use("/api/configuracion", configuracion)
app.use("/api/reportes", reporte);
app.use("/api/movimientos", movimiento)
app.use("/api/dashboard", dashboard);
app.use("/api/ventas", venta);


// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: `La ruta ${req.originalUrl} no existe`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
