// routes/movimientoRoutes.js
import { Router } from 'express';
import * as movimientoController from '../controllers/movimientoController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(protegerRuta);

// Rutas de consulta
router.get('/', movimientoController.obtenerMovimientos);
router.get('/estadisticas', movimientoController.obtenerEstadisticas);
router.get('/:id', movimientoController.obtenerMovimiento);

// Rutas de escritura (admin)
router.post('/', esAdmin, movimientoController.crearMovimiento);

export default router;