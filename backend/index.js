const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Importamos la función para enviar correos
const { enviarCorreo } = require('./correo');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para recibir solicitud de envío de correo de recuperación de contraseña
app.post('/api/enviar-correo-recuperacion', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ mensaje: 'Correo electrónico requerido' });
  }

  const codigoRecuperacion = Math.floor(100000 + Math.random() * 900000); // Generar un código de 6 dígitos
  const mensajeHtml = `
    <h2>Recuperación de Contraseña</h2>
    <p>Tu código de recuperación es: <strong>${codigoRecuperacion}</strong></p>
    <p>Este código caduca en 24 horas.</p>
  `;

  try {
    // Usamos la función que importa desde correo.js
    await enviarCorreo(email, 'Recuperación de contraseña', mensajeHtml);
    res.status(200).json({ mensaje: 'Correo de recuperación enviado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error enviando el correo de recuperación', error: error.toString() });
  }
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