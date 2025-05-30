
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
  const panelRestablecer = document.getElementById("panel-restablecer");
  const btnRestablecer = document.getElementById("btn-restablecer");
  const cancelResetBtn = document.getElementById("popup-cancel-reset");
  const nuevaPasswordInput = document.getElementById("nueva-password");
  const confirmarPasswordInput = document.getElementById("confirmar-password");

  // Mostrar popup para ingresar email al hacer clic en "Olvidé mi contraseña"
  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      emailInput.value = "";
      popupRecuperar.style.display = "flex";
    });
  }

  // Cancelar popup recuperar email
  cancelBtn.addEventListener("click", () => {
    popupRecuperar.style.display = "none";
  });

  // Cancelar popup código
  cancelBtnCodigo.addEventListener("click", () => {
    popupCodigo.style.display = "none";
  });

  // Cancelar popup restablecer contraseña
  cancelResetBtn.addEventListener("click", () => {
    panelRestablecer.style.display = "none";
  });

  // Enviar código de recuperación
  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      showPopup("Correo inválido.");
      return;
    }

    try {
      const codigoGenerado = String(Math.floor(100000 + Math.random() * 900000));

      const datosCodigo = {
        codigo: codigoGenerado,
        timestamp: Date.now()
      };

      // Guardar código antes de enviar correo
      localStorage.setItem("codigoRecuperacion", JSON.stringify(datosCodigo));

      const response = await fetch("http://localhost:3001/api/enviar-correo-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          asunto: "Recuperación de contraseña",
          mensajeHtml: `
            <h2>Recuperación de Contraseña</h2>
            <p>Tu código de recuperación es: <strong>${codigoGenerado}</strong></p>
            <p>Este código caduca en 24 horas.</p>
          `
        })
      });

      if (response.ok) {
        showPopup("Correo enviado correctamente.", true);
        popupRecuperar.style.display = "none";
        popupCodigo.style.display = "flex";
      } else {
        showPopup("Error al enviar el correo.");
      }
    } catch (err) {
      console.error("Error:", err);
      showPopup("Error inesperado.");
    }
  });

  // Verificar código de recuperación
  verifyBtn.addEventListener("click", () => {
    const ingresado = codigoInput.value.trim();
    const guardadoRaw = localStorage.getItem("codigoRecuperacion");

    if (!guardadoRaw) {
      showPopup("No se ha generado un código aún.");
      return;
    }

    try {
      const { codigo, timestamp } = JSON.parse(guardadoRaw);
      const ahora = Date.now();

      if (ahora - timestamp > 86400000) { // 24 horas en ms
        showPopup("El código ha caducado. Solicita uno nuevo.");
        localStorage.removeItem("codigoRecuperacion");
        return;
      }

      if (ingresado === String(codigo)) {
        showPopup("Código verificado. Puedes restablecer tu contraseña.", true);
        popupCodigo.style.display = "none";
        panelRestablecer.style.display = "flex";
      } else {
        showPopup("Código incorrecto.");
      }
    } catch (err) {
      console.error("Error leyendo el código:", err);
      showPopup("Error al verificar el código.");
    }
  });

  // Guardar nueva contraseña
  btnRestablecer.addEventListener("click", () => {
    const nuevaPass = nuevaPasswordInput.value.trim();
    const confirmarPass = confirmarPasswordInput.value.trim();

    if (!nuevaPass || !confirmarPass) {
      showPopup("Por favor, completa ambos campos.");
      return;
    }

    if (nuevaPass !== confirmarPass) {
      showPopup("Las contraseñas no coinciden.");
      return;
    }

    // Aquí va la lógica para actualizar la contraseña en tu backend o almacenamiento
    // Por ejemplo, podrías hacer fetch POST con el email y nuevaPass

    showPopup("Contraseña restablecida correctamente.", true);

    // Limpiar campos y cerrar panel
    nuevaPasswordInput.value = "";
    confirmarPasswordInput.value = "";
    panelRestablecer.style.display = "none";
  });

  // Popup de mensajes
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