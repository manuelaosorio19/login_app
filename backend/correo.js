const nodemailer = require('nodemailer');
require('dotenv').config(); // Asegúrate de que dotenv esté cargado para usar las variables de entorno

// Configuración de nodemailer con el servicio de Gmail usando variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.TRANSPORTER_USER, // correo de Gmail desde el archivo .env
    pass: process.env.TRANSPORTER_PASSWORD, // Contraseña de la aplicación desde el archivo .env
  },
  tls: {
    rejectUnauthorized: false, // Esto puede ayudar en algunos casos con certificados
  },
  port: 465, // Usamos el puerto seguro 465
  secure: true, // Cambiado a `true` porque estamos usando el puerto 465
});

// Función para enviar un correo
const enviarCorreo = async (destinatario, asunto, mensajeHtml) => {
  const mailOptions = {
    from: process.env.TRANSPORTER_USER, // Usa el correo de la variable de entorno
    to: destinatario,
    subject: asunto,
    html: mensajeHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response); // Puedes loggear la respuesta para ver más detalles
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
};

module.exports = { enviarCorreo };