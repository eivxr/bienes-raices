import { Categoria, Propiedad, Precio, Usuario } from "../models/index.js";

const propiedades = async (req, res) => {
  const propiedades = await Propiedad.findAll({
    include: [
      { model: Precio, as: "precio" },
      { model: Categoria, as: "categoria" },
    ],
  });
  res.json(propiedades);
};

export { propiedades };
