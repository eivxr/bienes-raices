(function () {
  const lat = 19.0401912;
  const lng = -98.2745838;
  const mapa = L.map("mapa-inicio").setView([lat, lng], 12);
  let markers = new L.FeatureGroup().addTo(mapa);
  let propiedades = [];

  const categoriasSelect = document.querySelector("#categorias");
  const preciosSelect = document.querySelector("#precios");

  const filtros = {
    categoria: "",
    precios: "",
  };

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  //filtrado por parametros

  categoriasSelect.addEventListener("change", (e) => {
    filtros.categoria = +e.target.value;
    filtrarPropiedades();
  });

  preciosSelect.addEventListener("change", (e) => {
    filtros.precios = +e.target.value;
    filtrarPropiedades();
  });

  //obtenemos las propiedades y las mostramos en el mapa

  const obtenerPropiedades = async () => {
    try {
      const url = "/api/propiedades";
      const res = await fetch(url);
      propiedades = await res.json();

      mostrarPropiedades(propiedades);
    } catch (error) {}
  };

  const mostrarPropiedades = (propiedades) => {
    //limpiar pines tras cambiar el select
    markers.clearLayers();

    propiedades.forEach((propiedad) => {
      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
        autoPan: true,
      })
        .addTo(mapa)
        .bindPopup(
          `<p class="font-bold text-indigo-600 ">${propiedad?.categoria.nombre}</p>
          <h1 class="text-xl uppercase font-extrabold my-2">${propiedad?.titulo}</h1>
            <img src="uploads/${propiedad?.image}" alt="Imagen de la propiedad: ${propiedad?.titulo}"/>
            <p class="font-bold text-gray-600 ">${propiedad?.precio.nombre}</p>
            <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center uppercase font-bold ">Ver más</a>`
        );
      markers.addLayer(marker);
    });
  };

  //filtrado de propiedades de acuerdo a los parametros del select
  const filtrarPropiedades = () => {
    const resultado = propiedades
      .filter(filtrarCategoria)
      .filter(filtrarPrecio);
    mostrarPropiedades(resultado);
  };

  const filtrarCategoria = (propiedad) =>
    filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;

  const filtrarPrecio = (propiedad) =>
    filtros.precios ? propiedad.precioId === filtros.precios : propiedad;

  obtenerPropiedades();
})();
