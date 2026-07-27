// routes/usuarioRoutes.js
import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { protegerRuta, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/usuarios/login', usuarioController.login);
router.post('/usuarios/registro', usuarioController.registro);

// Rutas protegidas (requieren autenticación)
router.get('/usuarios/perfil', protegerRuta, usuarioController.obtenerPerfil);
router.put('/usuarios/perfil', protegerRuta, usuarioController.actualizarPerfil);
router.put('/usuarios/password', protegerRuta, usuarioController.cambiarPassword);

// Rutas de administrador
router.get('/usuarios/', protegerRuta, esAdmin, usuarioController.obtenerUsuarios);
router.post('/usuarios/', protegerRuta, esAdmin, usuarioController.crearUsuario);
router.get('/usuarios/:id', protegerRuta, esAdmin, usuarioController.obtenerUsuario);
router.put('/usuarios/:id', protegerRuta, esAdmin, usuarioController.actualizarUsuario);
router.delete('/usuarios/:id', protegerRuta, esAdmin, usuarioController.eliminarUsuario);
router.patch('/usuarios/:id/estado', protegerRuta, esAdmin, usuarioController.cambiarEstadoUsuario);

export default router;