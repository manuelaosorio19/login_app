document.addEventListener("DOMContentLoaded", function () {
  const forgotLink = document.getElementById("forgot-password-link");
  const popupRecuperar = document.getElementById("popup-recuperar");
  const emailInput = document.getElementById("popup-email");
  const sendBtn = document.getElementById("popup-send");
  const cancelBtn = document.getElementById("popup-cancel");

  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      emailInput.value = "";
      popupRecuperar.style.display = "flex";
    });
  }

  cancelBtn.addEventListener("click", () => {
    popupRecuperar.style.display = "none";
  });

  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      showPopup("Por favor, introduce un correo electrónico válido.");
      return;
    }

    console.log("Clic en Enviar");

    try {
      const response = await fetch('http://localhost:3001/api/enviar-correo-recuperacion', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          asunto: "Recuperar contraseña",
          mensajeHtml: `
            <h3>Hola,</h3>
            <p>Has olvidado tu contraseña. Aquí tienes un código para restablecerla.</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Código:</strong> 123456</p>
            <p>¡Este código vence en 24 horas!</p>
          `
        })
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        showPopup("Correo de recuperación enviado con éxito.", true);
        popupRecuperar.style.display = "none";
      } else {
        showPopup("No se pudo enviar el correo. Intenta nuevamente.");
      }

    } catch (error) {
      console.error("Error al enviar el correo:", error);
      showPopup("Hubo un error al enviar el correo. Intenta nuevamente.");
    }
  });

  // Función de popup global (puedes moverla a un archivo util.js si la compartes)
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