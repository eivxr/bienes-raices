import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const db = new Sequelize(
  process.env.BD_NOMBRE,
  process.env.BD_USER,
  process.env.BD_PASS ?? "",
  {
    host: process.env.BD_HOST,
    port: 3307,
    dialect: "mysql",
    define: {
      timestamps: true,
    },
    poll: {
      max: 5, //maximo de conexiones a retulizar
      min: 0, //minimo
      acquire: 30000, //tiempo antes de error
      idle: 10000, //tiempo para eliminar conexiones
    },
    operatorsAliases: false,
  }
);

export default db;
