// routes/transferenciaRoutes.js
import { Router } from 'express';
import * as transferenciaController from '../controllers/transferenciaController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación y admin para todas las rutas
router.use(protegerRuta);
router.use(esAdmin);

// Rutas
router.get('/', transferenciaController.obtenerTransferencias);
router.post('/', transferenciaController.crearTransferencia);
router.get('/usuarios', transferenciaController.obtenerUsuariosParaTransferencia);
router.get('/productos', transferenciaController.obtenerProductosParaTransferencia);

export default router;