document.addEventListener("DOMContentLoaded", () => {
  // Manejo del formulario de inicio de sesión
  document.querySelector(".sign-in").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = this.querySelector('input[placeholder="Email"]').value;
    const password = this.querySelector('input[placeholder="Contraseña"]').value;
    const rol = this.querySelector('select[name="rol"]').value;

    // Validaciones para email y contraseña
    if (!validateEmail(email)) {
      alert("Correo electrónico no válido.");
      return;
    }

    if (!validatePassword(password)) {
      alert("Contraseña insegura.");
      return;
    }

    if (!rol) {
      alert("Debe seleccionar un rol.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password && u.rol === rol);

    if (!user) {
      showPopup("Credenciales incorrectas o rol no coincide.");
      return;
    }

    localStorage.setItem("activeUser", JSON.stringify(user));

    // Redirección según rol
    if (rol === "admin") {
      window.location.href = "admin/admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  });

  // Recuperación de contraseña
  const btnRecuperarContraseña = document.getElementById("btn-recuperar-contraseña");
  const formRecuperarContraseña = document.getElementById("form-recuperar-contraseña");
  const formCodigoRecuperacion = document.getElementById("form-codigo-recuperacion");
  const formRestablecerContraseña = document.getElementById("form-restablecer-contraseña");

  // Mostrar formulario para ingresar correo para recuperar contraseña
  if (btnRecuperarContraseña) {
    btnRecuperarContraseña.addEventListener("click", function () {
      formRecuperarContraseña.style.display = "block";
    });
  }

  // Acción al enviar el correo para recuperar la contraseña
  const btnEnviarCorreo = formRecuperarContraseña.querySelector("button");
  btnEnviarCorreo.addEventListener("click", function (e) {
    e.preventDefault();
    const correo = formRecuperarContraseña.querySelector("input[name='email']").value.trim();
    if (correo) {
      recuperarContraseña(correo); // Llamamos la función de recuperación
      formRecuperarContraseña.style.display = "none";
      formCodigoRecuperacion.style.display = "block";
    } else {
      showPopup("Por favor, ingresa un correo válido.");
    }
  });

  // Acción al enviar el código de recuperación
  const btnVerificarCodigo = formCodigoRecuperacion.querySelector("button");
  btnVerificarCodigo.addEventListener("click", function (e) {
    e.preventDefault();
    verificarCodigo();  // Verificamos el código ingresado
  });

  // Acción al restablecer la contraseña
  const btnRestablecerContraseña = formRestablecerContraseña.querySelector("button");
  btnRestablecerContraseña.addEventListener("click", function (e) {
    e.preventDefault();
    restablecerContraseña();  // Restablecemos la contraseña del usuario
  });
});