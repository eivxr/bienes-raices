import express from "express";
import {
  buscador,
  categoria,
  inicio,   
  noEncontrado,
} from "../controllers/appController.js";

const router = express.Router();

//inicio
router.get('/', inicio);

//categorias
router.get('/categorias/:id', categoria);

//buscador
router.post('/buscador', buscador);

//404
router.get('/404', noEncontrado);

export default router;
