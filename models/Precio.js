import { DataTypes, UUID, UUIDV4 } from "sequelize";
import db from "../config/db.js";

const Precio = db.define("precios", {
  nombre: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
});

export default Precio;
