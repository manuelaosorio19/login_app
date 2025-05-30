document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container");
  const btnSignIn = document.getElementById("btn-sign-in");
  const btnSignUp = document.getElementById("btn-sign-up");

  // Cambiar entre las vistas de Iniciar sesión y Registrarse
  if (btnSignIn && btnSignUp) {
    btnSignIn.addEventListener("click", () => container.classList.remove("toggle"));
    btnSignUp.addEventListener("click", () => container.classList.add("toggle"));
  }

  // Llenar los departamentos y ciudades
  const deptSelect = document.querySelector('select[name="departamento"]');
  const citySelect = document.querySelector('select[name="ciudad"]');

  if (typeof colombia !== "undefined" && deptSelect && citySelect) {
    for (let dept in colombia) {
      const option = document.createElement("option");
      option.value = dept;
      option.textContent = dept;
      deptSelect.appendChild(option);
    }

    deptSelect.addEventListener("change", function () {
      citySelect.innerHTML = "<option value=''>Seleccione ciudad</option>";
      if (colombia[this.value]) {
        colombia[this.value].forEach(ciudad => {
          const opt = document.createElement("option");
          opt.value = ciudad;
          opt.textContent = ciudad;
          citySelect.appendChild(opt);
        });
      }
    });
  }

  // Función para mostrar el popup con mensaje
  function showPopup(message, isSuccess = false) {
    const popup = document.getElementById("popup");
    const messageSpan = document.getElementById("popup-message");

    if (!popup || !messageSpan) {
      alert(message); // fallback
      return;
    }

    messageSpan.textContent = message;
    popup.classList.remove("success");
    if (isSuccess) {
      popup.classList.add("success");
    }

    popup.style.display = "block";
    popup.classList.add("show");

    setTimeout(() => {
      closePopup();
    }, 5000);
  }

  // Cerrar el popup
  function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.remove("show", "success");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }

  // Validación para el login
  function validateField(input) {
    if (!input) return false;
    const placeholder = input.getAttribute("placeholder");
    const value = input.value.trim();

    if (!value) {
      showPopup(`${placeholder} es obligatorio.`);
      return false;
    }
    return true;
  }

  // Inicio de sesión
  const loginForm = document.querySelector(".sign-in");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector('input[placeholder="Email"]');
      const password = this.querySelector('input[placeholder="Contraseña"]');

      if (!validateField(email) || !validateField(password)) return;

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.email === email.value.trim() && u.password === password.value.trim());

      if (!user) {
        showPopup("Credenciales incorrectas");
        return;
      }

      localStorage.setItem("activeUser", JSON.stringify(user));
      window.location.href = user.rol === "admin" ? "../admin/admin.html" : "dashboard.html";
    });
  }
});
