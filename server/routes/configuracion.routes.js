// routes/configuracionRoutes.js
import { Router } from 'express';
import * as configuracionController from '../controllers/configuracionController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(protegerRuta);

// Rutas de empresa (solo admin puede modificar)
router.get('/empresa', configuracionController.obtenerEmpresa);
router.put('/empresa', esAdmin, configuracionController.actualizarEmpresa);
router.put('/empresa/logo', esAdmin, configuracionController.actualizarLogo);

// Rutas de usuario
router.put('/password', configuracionController.cambiarPassword);
router.get('/tema', configuracionController.obtenerTema);

export default router;