import { validationResult } from "express-validator";
import { unlink } from "node:fs/promises";

import {
  Precio,
  Categoria,
  Propiedad,
  Mensaje,
  Usuario,
} from "../models/index.js";
import { esVendedor, formatearFecha } from "../helpers/esVendedor.js";

const admin = async (req, res) => {
  //leer query string para la paginacion y comprobamos su valor con una expresion regular
  const { pagina: paginaActual } = req.query;
  const expresion = /^[1-9]$/; //comodines de inicio y termino con digitos(^,$);

  if (!expresion.test(paginaActual)) {
    return res.redirect("/mis-propiedades?pagina=1");
  }

  try {
    //paginacion de propiedades
    const limit = 8;
    const offset = paginaActual * limit - limit;

    const { id } = req.usuario;

    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: { usuarioId: id },
        include: [
          { model: Categoria, as: "categoria" },
          { model: Precio, as: "precio" },
          { model: Mensaje, as: "mensajes" },
        ],
      }),
      Propiedad.count({
        where: { usuarioId: id },
      }),
    ]);

    console.log(paginaActual);

    res.render("propiedades/admin", {
      pagina: "Mis propiedades",
      propiedades,
      csrfToken: req.csrfToken(),
      paginas: Math.ceil(total / limit),
      paginaActual: Number(paginaActual),
      total,
      offset,
      limit,
    });
  } catch (error) {
    console.log(error);
  }
};

//formulario para crear propieades
const crear = async (req, res) => {
  //consultamos precios y categorias en la base de datos
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear una nueva propiedad",
    categorias,
    precios,
    csrfToken: req.csrfToken(),
    datos: {},
  });
};

const guardar = async (req, res) => {
  //resultado de la validacion
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear una nueva propiedad",

      categorias,
      precios,
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      datos: req.body,
    });
  }
  //creacion del registro
  const {
    titulo,
    descripcion,
    categoria,
    precio,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    lng,
    precio: precioId,
    categoria: categoriaId,
  } = req.body;

  const { id: usuarioId } = req.usuario;

  try {
    const propiedadCreada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      wc,
      estacionamiento,
      calle,
      lat,
      lng,
      categoriaId,
      precioId,
      usuarioId,
      image: "",
    });

    const { id } = propiedadCreada;

    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

const agregarImagen = async (req, res) => {
  const { id } = req.params;

  //validamos que la propiedad exista

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  //validamos que la propiedad no este publicada

  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  //validar quien es el propietario
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }
  res.render("propiedades/agregar-imagen", {
    pagina: `Agregar imagen: ${propiedad.titulo}`,
    propiedad,
    csrfToken: req.csrfToken(),
  });
};

const almacenarImagen = async (req, res, next) => {
  const { id } = req.params;

  //validamos que la propiedad exista

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  //validamos que la propiedad no este publicada

  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  //validar quien es el propietario
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  try {
    //almacenamos la referencia dentro de la base de datos (nombre del archivo que se guarda) y marcamos como publicada la propiedad
    propiedad.image = req.file.filename;
    propiedad.publicado = 1;

    //guardamos cambios en bd
    await propiedad.save();

    next();
  } catch (error) {
    console.log(error);
  }
};

//editar propiedades

const editar = async (req, res) => {
  const { id } = req.params;

  //la propiedad existe?
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  //solo quien creo la propiedad puede editarla
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //consulta al modelo de precios y categorias
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/editar", {
    pagina: `Editar una propiedad: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad,
  });
};

const guardarCambios = async (req, res) => {
  //validamos los los campos del formulario
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/editar", {
      pagina: "Editar una propiedad",
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body,
    });
  }

  //verificamos que la propiedad exista y pertenezca a cierta persona

  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //reescribimos el objeto y actualizamos

  try {
    const {
      titulo,
      descripcion,
      categoria,
      precio,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precio: precioId,
      categoria: categoriaId,
    } = req.body;

    propiedad.set({
      titulo,
      descripcion,
      categoria,
      precio,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
    });

    await propiedad.save();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.log(error);
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  //eliminamos la imagen
  await unlink(`public/uploads/${propiedad.image}`);
  console.log(`imagen eliminada ${propiedad.id}`);

  //eliminamos el registro
  await propiedad.destroy();
  res.redirect("/mis-propiedades");
};

//cambiar el estado de una propiedad
const cambiarEstado = async (req, res) => {
  //obetenemos el id de la propiedad por medio de la url
  const { id } = req.params;

  //realizamos la consulta de la propiedad en la bd por medio del id
  const propiedad = await Propiedad.findByPk(id);

  //si no se encontro...
  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }
  //si el usuario en la pagina no es el propietario
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  //actualizar
  propiedad.publicado = !propiedad.publicado;
  await propiedad.save();

  res.json({
    resultado: 'ok'
  })
};

const mostrarPropiedad = async (req, res) => {
  const { id } = req.params;

  console.log(req.usuario);

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });
  if (!propiedad || !propiedad.publicado) {
    res.redirect("/404");
  }

  res.render("propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
  });
};

const enviarMensaje = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });
  if (!propiedad) {
    res.redirect("/404");
  }

  //validamos el formulario de envio de mensaje

  //validamos los los campos del formulario
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("propiedades/mostrar", {
      propiedad,
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      errores: resultado.array(),
    });
  }

  // almacenamos el mensaje en la base de datos

  const { id: propiedadId } = req.params;
  const { id: usuarioId } = req.usuario;
  const { mensaje } = req.body;

  await Mensaje.create({
    mensaje,
    propiedadId,
    usuarioId,
  });

  res.render("propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    enviado: true,
  });
};

//ver mensajes recibidos en una propiedad

const verMensajes = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Mensaje,
        as: "mensajes",
        include: [{ model: Usuario.scope("eliminarPassword"), as: "usuario" }],
      },
    ],
  });

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  res.render("propiedades/mensajes", {
    pagina: "Mensajes",
    mensajes: propiedad.mensajes,
    formatearFecha,
  });
};

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  cambiarEstado,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes,
};
