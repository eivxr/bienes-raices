import jwt from 'jsonwebtoken';

 const generarId = () => Math.random().toString(32).substring(2) + Date.now().toString(32);

 // cosas a guardar, palabra secreta, alguna configuracion adicional
const generarJWT = datos => jwt.sign({ id: datos.id, nombre: datos.nombre }, process.env.JWT_SECRET,{ expiresIn:'1d'});

 export {
    generarId,
    generarJWT
 }