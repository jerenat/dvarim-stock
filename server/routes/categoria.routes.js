// routes/categoriaRoutes.js
import { Router } from 'express';
import * as categoriaController from '../controllers/categoriaController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(protegerRuta);

// Rutas de lectura (cualquier usuario autenticado)
router.get('/', categoriaController.obtenerCategorias);
router.get('/:id', categoriaController.obtenerCategoria);

// Rutas de escritura (solo admin)
router.post('/', esAdmin, categoriaController.crearCategoria);
router.put('/:id', esAdmin, categoriaController.actualizarCategoria);
router.delete('/:id', esAdmin, categoriaController.eliminarCategoria);

export default router;