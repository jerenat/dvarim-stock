// routes/productoRoutes.js
import { Router } from 'express';
import * as productoController from '../controllers/productoController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protegerRuta);

// Rutas de lectura (cualquier usuario autenticado)
router.get('/', productoController.obtenerProductos);
router.get('/categorias', productoController.obtenerCategorias);
router.get('/:id', productoController.obtenerProducto);

// Rutas de escritura (solo admin)
router.post('/', esAdmin, productoController.crearProducto);
router.put('/:id', esAdmin, productoController.actualizarProducto);
router.delete('/:id', esAdmin, productoController.eliminarProducto);

export default router;