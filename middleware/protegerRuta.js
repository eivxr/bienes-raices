import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const protegerRuta = async (req, res, next) => {
  //verificar si hay un token
  const { _token } = req.cookies;

  if (!_token) {
    return res.redirect("/auth/login");
  }
  //validar el token
  try {
    //decodificamos el token generado tras iniciar sesion
    const decoded = jwt.verify(_token, process.env.JWT_SECRET);

    //buscamos al usuario en bd a traves de los valores del token decodificado por ejemplo ({ id: 1, nombre: 'Luki', iat: 1716878450, exp: 1716964850})
    const usuario = await Usuario.scope("eliminarPassword").findByPk(
      decoded.id
    ); //aplicamos el scope definido en el modelo

    if (usuario) { //almacenamos el usuario como parte de la request
      req.usuario = usuario;
    } else {
      res.redirect("/auth/login");
    }
    return next();
  } catch (error) {
    res.clearCookie("_token").redirect("/auth/login");
  }

  next();
};

export default protegerRuta;
