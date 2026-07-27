// routes/stockRoutes.js
import { Router } from 'express';
import * as stockController from '../controllers/stockController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(protegerRuta);

// Rutas de consulta
router.get('/general', stockController.obtenerStockGeneral);
router.get('/usuarios', stockController.obtenerStockPorUsuarios);
router.get('/usuarios/:id', stockController.obtenerStockUsuario);
router.get('/alertas', esAdmin, stockController.obtenerAlertasStock);

// Rutas de administración
router.post('/transferir', esAdmin, stockController.transferirStock);

export default router;