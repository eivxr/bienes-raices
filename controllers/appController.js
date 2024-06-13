import { Sequelize } from "sequelize";
import { raw } from "mysql2";
import { Precio, Categoria, Propiedad, Usuario } from "../models/index.js";

const inicio = async (req, res) => {
  const [categorias, precios, casas, departamentos] = await Promise.all([
    Categoria.findAll({ raw: true }),
    Precio.findAll({ raw: true }),
    Propiedad.findAll({
      limit: 3,
      where: { categoriaId: 1 },
      include: [{ model: Precio, as: "precio" }],
      order: [["createdAt", "DESC"]],
    }),
    Propiedad.findAll({
      limit: 3,
      where: { categoriaId: 2 },
      include: [{ model: Precio, as: "precio" }],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  res.render("inicio", {
    pagina: "Inicio",
    categorias,
    precios,
    casas,
    departamentos,
    csrfToken: req.csrfToken(),
  });
};

const categoria = async (req, res) => {
  const { id } = req.params;

  const categoria = await Categoria.findByPk(id);

  //la categoria existe
  if (!categoria) {
    return res.redirect("/404");
  }

  //obtencion de propiedades en base a la categoria
  const propiedades = await Propiedad.findAll({
    where: { categoriaId: id },
    include: [{ model: Precio, as: "precio" }],
  });

  res.render("categoria", {
    pagina: `${categoria.nombre}s en venta`,
    propiedades,
    csrfToken: req.csrfToken(),
  });
};

const noEncontrado = async (req, res) => {
  res.render("404", {
    pagina: "No encontrada",
    csrfToken: req.csrfToken(),
  });
};

const buscador = async (req, res) => {
  const { termino } = req.body;

  //validar que termino no este vacio
  if (!termino.trim()) {
    return res.redirect("back");
  }

  //si no esta vacio
  const propiedades = await Propiedad.findAll({
    where: {
      titulo: {
        [Sequelize.Op.like]: "%" + termino + "%",
      },
    },
    include: [{ model: Precio, as: "precio" }],
  });
  res.render("busqueda", {
    pagina: "Resultados de la búsqueda",
    propiedades,
    csrfToken: req.csrfToken(),
  });
  console.log(propiedades);
};

export { inicio, buscador, categoria, noEncontrado };
