import nodemailer from 'nodemailer'

const emailRegistro = async (datos) =>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });   

      const {nombre, email, token} = datos;

      await transport.sendMail({
        from:'BienesRaices.com',
        to:email,
        subject:'Confirme su cuenta en BienesRaices.com',
        text:'Confirme su cuenta en BienesRaices.com',
        html: `
        <p>Hola, ${nombre}, verifica tu cuenta en BienesRaices.com</p>
        
        <p>Tu cuenta esta lista, únicamente tienes que confirmarla haciendo click en el siguiente enlace:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a> </p>

        <p>Si no fue usted quien creo la cuenta, simplemente ignore el mensaje</p>
        `
      })

}


const olvidePassword = async (datos) =>{
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });   

    const {nombre, email, token} = datos;

    await transport.sendMail({
      from:'BienesRaices.com',
      to:email,
      subject:'Reestablezca su contraseña en BienesRaices.com',
      text:'Al parecer usted ha solicitado un cambio de contraseña en el sitio',
      html: `
      <p>Hola, ${nombre}, verifica tu cuenta en BienesRaices.com</p>
      
      <p>Para reestablecer su contraseña solo debe hacer click en el siguiente enlace para que pueda ser redireccionado
      <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer password</a> </p>

      <p>Si no fue usted quien solicitó esto, simplemente ignore el mensaje</p>
      `
    })

}

export{
    emailRegistro,olvidePassword
}