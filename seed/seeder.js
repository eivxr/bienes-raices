import { exit } from "node:process";
import db from "../config/db.js";
import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuario.js";

import { Categoria, Precio, Usuario } from "../models/index.js";

const importarDatos = async () => {
  try {
    //autenticamos la conexion
    await db.authenticate();

    //generamos las columnas
    await db.sync();

    // insertamos los datos con un promise.all, ya que son procesos que no dependen el uno del otro
    await Promise.all([
      Categoria.bulkCreate(categorias), //inserta todos los datos dentro del array
      Precio.bulkCreate(precios),
      Usuario.bulkCreate(usuarios),
    ]);

    console.log("datos importados correctamente");
    exit();
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

const eliminarDatos = async () => {
  try {
    await db.sync({ force: true });

    console.log("datos eliminados correctamente");
    exit();
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

if (process.argv[2] === "-i") {
  //i is for insertar
  importarDatos();
}

if (process.argv[2] === "-e") {
  //e is for eliminar
  eliminarDatos();
}
