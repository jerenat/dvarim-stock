// routes/reporteRoutes.js
import { Router } from 'express';
import * as reporteController from '../controllers/reporteController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(protegerRuta);

// Rutas
router.get('/', reporteController.obtenerReportes);
router.get('/mas-vendidos', reporteController.obtenerMasVendidos);
router.get('/stock-bajo', esAdmin, reporteController.obtenerStockBajo);
router.get('/movimientos', reporteController.obtenerMovimientosPorFecha);

export default router;