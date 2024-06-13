
//mapa de "crear nuevo anuncio" 
(function() {
    const lat = document.querySelector('#lat').value || 19.0401912;
    const lng = document.querySelector('#lng').value ||-98.2745838;
    const mapa = L.map('mapa').setView([lat, lng ], 12);
    let marker; //pin

    //utilizamos Provider y GeoCoder 
    const geocodeService = L.esri.Geocoding.geocodeService();

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


    //configuramos que el pin establezca las coordenadas del mapa cuando se arrastre
    marker = new L.marker([lat, lng],{
        draggable: true, //el pin puede ser arrastrado
        autopan: true // centrado del mapa cuando se coloque
        
    }).addTo(mapa);

    //al detectar el fin del movimiento en el pin, centramos el mapa a donde fue arrastado
    marker.on('moveend', function(e){
        marker = e.target;

        const posicion = marker.getLatLng();

        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        //obtenemos informacion de donde fue arrastrado
        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){
         
            console.log(resultado)

            marker.bindPopup(resultado.address.LongLabel);
            
            //en el renderizado de la vista crear.pug actualizaremos una etiqueta p que contara con el nombre de la calle
            
            document.querySelector('.calle').textContent = resultado.address?.Address ?? '';
            //hacemos set en los inputs escondidos en la vista
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })

    })
})()