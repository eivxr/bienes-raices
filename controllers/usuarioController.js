import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/token.js";
import { emailRegistro, olvidePassword } from "../helpers/emails.js";
import bcrypt from "bcrypt";
import { where } from "sequelize";

//inicio de sesion
const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Inicia sesion",
    csrfToken: req.csrfToken(),
  });
};

//cerrar sesion

const cerrarSesion = (req, res) => {
  return res.clearCookie('_token').status(200).redirect('/auth/login')
};

//
const autenticar = async (req, res) => {
  //validaciones para el formulario
  await check("email")
    .isEmail()
    .withMessage("Email es un campo obligatorio")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("El password es obligatorio")
    .run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  //comprobar si el usuario existe dentro de la base de datos
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Usuario no encontrado" }],
    });
  }

  //comprobar la confirmacion mediante correo del usuario
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario enviado aún no ha sido confirmado" }],
    });
  }

  // comparar passwords usando el prototype personalizado de Usuario
  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El password es incorrecto" }],
    });
  }

  //generar token
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

  //almacenamos el token dentro de una cookie

  return res
    .cookie("_token", token, {
      httpOnly: true,
    })
    .redirect("/mis-propiedades");
};

//registro de usuarios

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  //valudacion de registro
  await check("nombre")
    .notEmpty()
    .withMessage("Nombre no puede estar vacio")
    .run(req);
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);
  await check("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe contener al menos 8 caracteres")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Las contraseñas no coinciden")
    .run(req);

  let resultado = validationResult(req);

  //verificar que no se presentan errores
  if (!resultado.isEmpty()) {
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //extraemos datos
  const { nombre, email, password } = req.body;

  //verificamos si no hay usuarios existentes
  const existeUsuario = await Usuario.findOne({
    where: { email: req.body.email },
  });
  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario ya ha sido registrado anteriormente" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //almacenamos el usuario en la base de datos y generamos un token para este
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  //enviamos un correo de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje:
      "Un email de confirmación ha sido enviado a la dirección que nos proporcionó, presione en el enlace",
  });
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  //verificar si token es valido
  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje:
        "Hubo un error al intentar confirmar tu cuenta, intenta nuevamente",
      error: true,
    });
  }

  // confirmar cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Su cuenta ha sido confirmada",
    mensaje: "La cuenta ha sido confirmada con éxito",
  });
};

const formularioRetrivePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Recupere su contraseña",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  //valudacion de registro
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);

  let resultado = validationResult(req);

  //verificar que se introduce un email valido
  if (!resultado.isEmpty()) {
    return res.render("auth/olvide-password", {
      pagina: "Recupere su contraseña",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  //Si el usuario existe...
  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Recupere su contraseña",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no se encuentra registrado" }],
    });
  }

  //generamos un nuevo token para el usuario y lo almacenamos
  usuario.token = generarId();
  await usuario.save();

  //configuramos el correo que sera enviado
  olvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  //
  res.render("templates/mensaje", {
    pagina: "Reestablece tu password",
    mensaje:
      "Un email con las instrucciones ha sido enviado a la dirección de correo proporcionada.",
  });
};

const comprobarToken = async (req, res, next) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({ where: { token } });

  // si no se encuentra un usuario
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablece tu password",
      mensaje: "Hubo un error al validar tu información, intenta de nuevo",
      error: true,
    });
  }

  // mostrar un formulario si se encuentra un usuario

  res.render("auth/reset-password", {
    pagina: "Reestablezca su password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  //validamos el password
  await check("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe contener al menos 8 caracteres")
    .run(req);

  let resultado = validationResult(req);

  //verificar que no se presentan errores en la validacion
  if (!resultado.isEmpty()) {
    return res.render("auth/reset-password", {
      pagina: "Reestablezca su password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificamos quien hace el cambio de password
  const usuario = await Usuario.findOne({ where: { token } });

  //Hasheamos el password introducido y eliminanos el token generado para el usuario
  const salt = await bcrypt.genSalt(10); //rondas de hasheo
  usuario.password = await bcrypt.hash(password, salt); // ejecucion del hasheo
  usuario.token = null;

  //guardamos cambios en el modelo de Usuario
  await usuario.save();

  //mostramos una vista
  res.render("auth/confirmar-cuenta", {
    pagina: "Password reestablecida con éxito.",
    mensaje: "El password fue almacenado de manera correcta",
  });
};

export {
  formularioLogin,
  formularioRegistro,
  formularioRetrivePassword,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion
};
