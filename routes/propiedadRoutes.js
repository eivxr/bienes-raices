import express from "express";
import { body } from "express-validator";

import {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes,
  cambiarEstado,
} from "../controllers/propiedadController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import upload from "../middleware/subirImagen.js";
import identificarUsuario from "../middleware/identificarUsuario.js";

const router = express.Router();

router.get("/mis-propiedades", protegerRuta, admin);
router.get("/propiedades/crear", protegerRuta, crear);

// ruta del endpoint de guardado y validacionees en rutas
router.post(
  "/propiedades/crear",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El título es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una categoría."),
  body("precio").isNumeric().withMessage("Selecciona un rango de precios"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Seleccione el número de habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Seleccione el número de estacionamientos"),
  body("wc").isNumeric().withMessage("Seleccione el número de baños"),
  body("lat").notEmpty().withMessage("Ubica la propiedad en el mapa"),
  guardar
);

//agregar imagen
router.get("/propiedades/agregar-imagen/:id", protegerRuta, agregarImagen);
router.post(
  "/propiedades/agregar-imagen/:id",
  protegerRuta,
  upload.single("image"),
  almacenarImagen
);

//editar una propiedad
router.get("/propiedades/editar/:id", protegerRuta, editar);
router.post(
  "/propiedades/editar/:id",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El título es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una categoría."),
  body("precio").isNumeric().withMessage("Selecciona un rango de precios"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Seleccione el número de habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Seleccione el número de estacionamientos"),
  body("wc").isNumeric().withMessage("Seleccione el número de baños"),
  body("lat").notEmpty().withMessage("Ubica la propiedad en el mapa"),
  guardarCambios
);

router.post("/propiedades/eliminar/:id", protegerRuta, eliminar);

//cambio de estado en las propiedades

router.put("/propiedades/:id", protegerRuta, cambiarEstado)

//area abierta al publico
router.get("/propiedad/:id", identificarUsuario, mostrarPropiedad);

//almacenar los mensajes de usuarios en las propiedades
router.post(
  "/propiedad/:id",
  identificarUsuario,
  body("mensaje")
    .isLength({ min: 10 })
    .withMessage("El mensaje es muy corto o está vacío"),
  enviarMensaje
);

router.get("/mensajes/:id", protegerRuta, verMensajes);



export default router;
