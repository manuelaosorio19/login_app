const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { enviarCorreo } = require('./correo'); // Asegúrate de tener esta función para enviar correos

const app = express();
const PORT = 3001;

// Simulamos un almacenamiento en memoria (en producción, deberías usar una base de datos)
let codigosRecuperacion = {}; // Almacena los códigos de recuperación por usuario

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para recibir solicitud de envío de correo de recuperación de contraseña
app.post('/api/enviar-correo-recuperacion', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ mensaje: 'Correo electrónico requerido' });
  }

  // Generamos un código de recuperación
  const codigoRecuperacion = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
  const fechaExpiracion = Date.now() + 24 * 60 * 60 * 1000; // 24 horas desde ahora

  // Guardamos el código y la fecha de expiración
  codigosRecuperacion[email] = { codigoRecuperacion, fechaExpiracion };

  const mensajeHtml = `
    <h2>Recuperación de Contraseña</h2>
    <p>Tu código de recuperación es: <strong>${codigoRecuperacion}</strong></p>
    <p>Este código caduca en 24 horas.</p>
  `;

  try {
    // Enviar el correo con el código de recuperación
    await enviarCorreo(email, 'Recuperación de contraseña', mensajeHtml);
    res.status(200).json({ mensaje: 'Correo de recuperación enviado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error enviando el correo de recuperación', error: error.toString() });
  }
});

// Ruta para verificar el código de recuperación
app.post('/api/verificar-codigo-recuperacion', (req, res) => {
  const { email, codigo } = req.body;

  const usuario = codigosRecuperacion[email];

  if (!usuario) {
    return res.status(400).json({ mensaje: 'Correo no encontrado' });
  }

  if (usuario.codigoRecuperacion !== parseInt(codigo)) {
    return res.status(400).json({ mensaje: 'Código incorrecto' });
  }

  if (Date.now() > usuario.fechaExpiracion) {
    return res.status(400).json({ mensaje: 'El código ha expirado' });
  }

  res.status(200).json({ mensaje: 'Código verificado correctamente' });
});

// Ruta para recibir solicitud de envío de correo de registro
app.post('/api/enviar-correo', async (req, res) => {
  const { destinatario, asunto, mensajeHtml } = req.body;

  if (!destinatario || !asunto || !mensajeHtml) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos para el correo' });
  }

  try {
    await enviarCorreo(destinatario, asunto, mensajeHtml);
    res.status(200).json({ mensaje: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar correo de registro:', error);
    res.status(500).json({ mensaje: 'Error al enviar el correo', error: error.toString() });
  }
});

// Arrancamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});