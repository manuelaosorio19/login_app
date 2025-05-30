document.addEventListener("DOMContentLoaded", function () {
  const forgotLink = document.getElementById("forgot-password-link");
  const popupRecuperar = document.getElementById("popup-recuperar");
  const popupCodigo = document.getElementById("popup-codigo");
  const emailInput = document.getElementById("popup-email");
  const codigoInput = document.getElementById("popup-codigo-input");
  const sendBtn = document.getElementById("popup-send");
  const cancelBtn = document.getElementById("popup-cancel");
  const verifyBtn = document.getElementById("popup-verify");
  const cancelBtnCodigo = document.getElementById("popup-cancel-code");

  let codigoRecuperacion = ''; // Este será el código generado para enviar

  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      emailInput.value = "";
      popupRecuperar.style.display = "flex";
    });
  }

  // Acción de cancelar el popup de recuperación
  cancelBtn.addEventListener("click", () => {
    popupRecuperar.style.display = "none";
  });

  // Acción de cancelar el popup del código
  cancelBtnCodigo.addEventListener("click", () => {
    popupCodigo.style.display = "none";
  });

  // Enviar el correo con el código de recuperación
  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      showPopup("Por favor, introduce un correo electrónico válido.");
      return;
    }

    try {
      // Generar el código de recuperación
      codigoRecuperacion = Math.floor(100000 + Math.random() * 900000); // Generar un código de 6 dígitos

      // Enviar el correo con el código de recuperación
      const response = await fetch('http://localhost:3001/api/enviar-correo-recuperacion', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          asunto: "Recuperación de contraseña",
          mensajeHtml: `
            <h2>Recuperación de Contraseña</h2>
            <p>Tu código de recuperación es: <strong>${codigoRecuperacion}</strong></p>
            <p>Este código caduca en 24 horas.</p>
          `
        })
      });

      const data = await response.json();

      if (response.ok) {
        showPopup("Correo de recuperación enviado con éxito.", true);
        // Guardamos el código en el localStorage para la comparación posterior
        localStorage.setItem('codigoRecuperacion', codigoRecuperacion);
        popupRecuperar.style.display = "none";
        popupCodigo.style.display = "flex";
      } else {
        showPopup("No se pudo enviar el correo. Intenta nuevamente.");
      }

    } catch (error) {
      console.error("Error al enviar el correo:", error);
      showPopup("Hubo un error al enviar el correo. Intenta nuevamente.");
    }
  });

  // Verificar el código ingresado
  verifyBtn.addEventListener("click", () => {
    const codigoIngresado = codigoInput.value.trim();

    // Recuperamos el código guardado en localStorage
    const codigoGuardado = localStorage.getItem('codigoRecuperacion');

    if (!codigoGuardado) {
      showPopup("Código de recuperación no encontrado.");
      return;
    }

    if (codigoIngresado === codigoGuardado) {
      showPopup("¡Código verificado correctamente! Ahora puedes restablecer tu contraseña.", true);
      // Aquí puedes proceder a mostrar el formulario para restablecer la contraseña
      // O redirigir a la página correspondiente
    } else {
      showPopup("El código ingresado es incorrecto. Intenta nuevamente.");
    }
  });

  // Función de popup global 
  function showPopup(message, isSuccess = false) {
    const popup = document.getElementById("popup");
    const messageSpan = document.getElementById("popup-message");

    if (popup.classList.contains("show")) {
      popup.classList.remove("show", "success");
      clearTimeout(popup._timeout);
    }

    messageSpan.textContent = message;
    popup.classList.remove("success");
    if (isSuccess) popup.classList.add("success");

    popup.style.display = "block";
    popup.classList.add("show");

    popup._timeout = setTimeout(() => {
      closePopup();
    }, isSuccess ? 6000 : 3500);
  }

  function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.remove("show", "success");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }
});