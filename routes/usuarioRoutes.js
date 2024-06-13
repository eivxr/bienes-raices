import express from "express";
import {
  formularioLogin,
  formularioRegistro,
  formularioRetrivePassword,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion,
} from "../controllers/usuarioController.js";

const router = express.Router();

//inicio de sesion
router.get("/login", formularioLogin);
router.post("/login", autenticar);

//cerrar sesion
router.post("/cerrar-sesion", cerrarSesion);

router.get("/registro", formularioRegistro);
router.post("/registro", registrar);

router.get("/confirmar/:token", confirmar);

router.get("/olvide-password", formularioRetrivePassword);
router.post("/olvide-password", resetPassword);

//Almacenar nuevo password en la base de datos
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);

export default router;
