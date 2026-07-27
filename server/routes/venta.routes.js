// routes/ventaRoutes.js
import { Router } from 'express';
import * as ventaController from '../controllers/ventaController.js';
import { protegerRuta } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(protegerRuta);

// Rutas
router.get('/', ventaController.obtenerVentas);
router.post('/', ventaController.registrarVenta);
router.get('/productos-disponibles', ventaController.obtenerProductosDisponibles);
router.get('/:id', ventaController.obtenerVenta);

export default router;