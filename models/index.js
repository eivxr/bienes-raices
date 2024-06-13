import Propiedad from "./Propiedad.js";
import Usuario from "./Usuario.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import Mensaje from "./Mensaje.js";

Propiedad.belongsTo(Precio, { foreignKey: "precioId" }); //propiedad tiene un precio
Propiedad.belongsTo(Categoria, { foreignKey: "categoriaId" }); // propiedad tiene una categoria
Propiedad.belongsTo(Usuario, { foreignKey: "usuarioId" });
Propiedad.hasMany(Mensaje, { foreignKey: "propiedadId" });

Mensaje.belongsTo(Propiedad, { foreignKey: "propiedadId" });
Mensaje.belongsTo(Usuario, { foreignKey: "usuarioId" });

export { Categoria, Precio, Propiedad, Usuario, Mensaje };
