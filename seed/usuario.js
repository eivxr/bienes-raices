import bcrypt from 'bcrypt';


const usuarios = [
  {
    nombre: "Luki",
    email: "luki@correo.com",
    password:bcrypt.hashSync("luki2003", 10) ,
    confirmado: 1,
  },
];

export default usuarios;