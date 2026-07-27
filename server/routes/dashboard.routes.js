// routes/dashboardRoutes.js
import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { protegerRuta } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación
router.use(protegerRuta);

// Rutas
router.get('/', dashboardController.obtenerDashboard);
router.get('/resumen', dashboardController.obtenerResumen);

export default router;