const esVendedor = (usuarioId, propiedadUsuario) => {
  return usuarioId === propiedadUsuario;
};

const formatearFecha = fecha =>{

  const nuevaFecha =  new Date(fecha).toISOString().slice(0,10)

  const opciones = {
    weekday:'long',
    month:'long',
    year:'numeric',
    day:'numeric'
  }

  return new Date(nuevaFecha).toLocaleDateString('es-ES', opciones)
}
export { esVendedor, formatearFecha};
