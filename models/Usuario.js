import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import db from "../config/db.js";

const Usuario = db.define(
  "usuarios",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN,
  },
  {
    hooks: {
      beforeCreate: async function (usuario) {
        const salt = await bcrypt.genSalt(10); //rondas de hasheo
        usuario.password = await bcrypt.hash(usuario.password, salt); // ejecucion del hasheo
      },
    },
    scopes: {
        //scope para eliminar atributos de una consulta al autenticar usuarios
      eliminarPassword: {
        attributes: {
          exclude: [
            "password",
            "token",
            "confirmado",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    },
  }
);
//prototypes personalizados
Usuario.prototype.verificarPassword = function (password) {
  //password es el parametro, this.password el alojado en la base de datos
  return bcrypt.compareSync(password, this.password);
};

export default Usuario;
