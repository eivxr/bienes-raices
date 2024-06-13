// const express = require('express'); // common js, forma anterior de importar en node
import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadRoutes.js';
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'

import  db from './config/db.js'

// contiene informacion especifica del servidor que estamos creando
const app = express();

//habilitar lectura de datos en formularios
app.use(express.urlencoded({extended:true}));

//habilitar cookie parser
app.use(cookieParser());

//habilitamos CSRF
app.use( csurf({cookie:true}))

//conexion a la base de datos
try{
    await db.authenticate();
    db.sync();
    console.log('conexion a bd correcta');
}catch(error){
    console.log(error);
}


//routing
app.use('/auth', usuarioRoutes); //la diferencia entre use y get es que get obtiene rutas especificas
app.use('/', propiedadesRoutes); 
app.use('/', appRoutes);
app.use('/api', apiRoutes)

//habilitamos pug (template engine)
app.set('view engine', 'pug');
app.set('views', './views')

//carpeta publica para identificar archivos estaticos
app.use(express.static('public'));


// lo primordial es definir un puerto y arrancar el servidor
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`servidor arrancado en el puerto ${port}`);
})