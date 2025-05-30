document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".sign-up");

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

  // Función para cerrar el popup
  function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.remove("show", "success");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }

  // Validaciones para email, contraseña, etc.
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }

  function validateNumeric(value) {
    return /^\d{1,11}$/.test(value); // Solo permite hasta 11 números
  }

  // Validación para que el nombre no exceda los 30 caracteres y no contenga números
  function validateName(name) {
    const regex = /^[A-Za-zÀ-ÿ\s]+$/; // Solo permite letras (incluyendo caracteres acentuados) y espacios
    return name.length <= 30 && regex.test(name);
  }

  // Mostrar mensaje de error
  function showError(input, message) {
    let error = input.parentElement.querySelector(".error-message");
    if (!error) {
      error = document.createElement("small");
      error.classList.add("error-message");
      error.style.color = "red";
      error.style.fontSize = "0.7em";
      error.style.marginTop = "2px";
      error.style.display = "block";
      input.parentElement.appendChild(error);
    }
    error.textContent = message;
  }

  // Limpiar mensaje de error
  function clearError(input) {
    const error = input.parentElement.querySelector(".error-message");
    if (error) error.remove();
  }

  // Limpiar todos los errores en el formulario
  function clearErrors(form) {
    form.querySelectorAll(".error-message").forEach(e => e.remove());
  }

  // Validación general del campo
  function validateField(input) {
    if (!input) return false;

    const placeholder = input.getAttribute("placeholder");
    const value = input.value.trim();
    clearError(input);

    if (!value) {
      showError(input, `${placeholder} es obligatorio.`);
      return false;
    }

    if (placeholder === "Email" && !validateEmail(value)) {
      showError(input, "Correo electrónico inválido.");
      return false;
    }

    if (placeholder === "Contraseña" && !validatePassword(value)) {
      showError(input, "Contraseña insegura (mín. 8 caracteres, mayúscula, minúscula, número y símbolo).");
      return false;
    }

    if (placeholder === "Teléfono" || placeholder === "Identificación") {
      if (!validateNumeric(value)) {
        showError(input, "Solo se permiten hasta 11 números.");
        return false;
      }
    }

    if (placeholder === "Nombre" && !validateName(value)) {
      showError(input, "El nombre no debe tener más de 30 caracteres ni contener números.");
      return false;
    }

    return true;
  }

  // Función para enviar el correo de registro
  function enviarCorreoRegistro(email, name, password) {
    fetch("http://localhost:3001/api/enviar-correo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destinatario: email,
        asunto: "Registro exitoso en Proyecto Egresados",
        mensajeHtml: `
          <h3>Hola ${name},</h3>
          <p>Gracias por registrarte en el Proyecto de Egresados. Podrás ingresar con las siguientes credenciales:</p>
          <p><strong>Correo:</strong> ${email}</p>
          <p><strong>Contraseña:</strong> ${password}</p>
          <p>¡Bienvenido a la comunidad!</p>
        `
      })
    })
    .then(res => res.json())
    .then(data => console.log("Correo enviado con éxito:", data))
    .catch(err => console.error("Error al enviar el correo:", err));
  }

  // Función que asegura que solo se ingresen números en campos específicos
  function enforceNumericInput(input) {
    input.addEventListener("input", function () {
      // Reemplazamos todo lo que no sea número
      this.value = this.value.replace(/\D/g, "");
      // Si el campo es 'Identificación' o 'Teléfono', limitamos la longitud a 11 caracteres
      if (this.value.length > 11) {
        this.value = this.value.slice(0, 11);
      }
    });
  }

  // Función que asegura que el nombre no tenga más de 20 caracteres
  function enforceNameLength(input) {
    input.addEventListener("input", function () {
      // Limita a 20 caracteres el valor
      if (this.value.length > 30) {
        this.value = this.value.slice(0, 30);
      }
      // Elimina cualquier número o carácter especial
      this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, ""); // Solo letras y espacios
    });
  }

  // Validar el campo mientras se escribe
  function addRealTimeValidation(input) {
    input.addEventListener("input", () => validateField(input));
  }

  // Asignamos la validación en tiempo real a los campos
  const inputs = form.querySelectorAll("input");
  inputs.forEach(input => {
    addRealTimeValidation(input);
    if (input.placeholder === "Identificación" || input.placeholder === "Teléfono") {
      enforceNumericInput(input);  // Aseguramos que solo números sean ingresados y con un máximo de 11 caracteres
    }
    if (input.placeholder === "Nombre") {
      enforceNameLength(input);  // Aseguramos que el nombre no tenga más de 20 caracteres y no contenga números
    }
  });

  // Formulario de registro
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors(this);

    const name = this.querySelector('input[placeholder="Nombre"]');
    const email = this.querySelector('input[placeholder="Email"]');
    const password = this.querySelector('input[placeholder="Contraseña"]');
    const identificacion = this.querySelector('input[placeholder="Identificación"]');
    const telefono = this.querySelector('input[placeholder="Teléfono"]');
    const direccion = this.querySelector('input[placeholder="Dirección"]');
    const departamento = this.querySelector('select[name="departamento"]');
    const ciudad = this.querySelector('select[name="ciudad"]');
    const programa = this.querySelector('input[placeholder="Programa Académico"]');
    const rol = this.querySelector('select[name="rol"]');

    let valid = true;
    [name, email, password, identificacion, telefono, direccion, programa].forEach(input => {
      if (input && !validateField(input)) valid = false;
    });

    if (!departamento.value) {
      showError(departamento, "Seleccione un departamento.");
      valid = false;
    } else {
      clearError(departamento);
    }

    if (!ciudad.value) {
      showError(ciudad, "Seleccione una ciudad.");
      valid = false;
    } else {
      clearError(ciudad);
    }

    if (!rol.value) {
      showError(rol, "Seleccione un rol.");
      valid = false;
    } else {
      clearError(rol);
    }

    if (!valid) {
      showPopup("Faltan campos por llenar.");
      return;
    }

    const user = {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value.trim(),
      identificacion: identificacion.value.trim(),
      telefono: telefono.value.trim(),
      direccion: direccion.value.trim(),
      departamento: departamento.value,
      ciudad: ciudad.value,
      programa: programa.value.trim(),
      rol: rol.value
    };

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const documentoExistente = users.find(u => u.identificacion === user.identificacion);
    const correoExistente = users.find(u => u.email === user.email);

    if (correoExistente) {
      showPopup("Este correo ya está registrado.");
      return;
    }

    if (documentoExistente && documentoExistente.email !== user.email) {
      showPopup("Esta identificación ya está registrada con otro correo.");
      return;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("activeUser", JSON.stringify(user));

    showPopup("Registro exitoso", true);
    console.log("Llamando a enviarCorreoRegistro...");
    enviarCorreoRegistro(user.email, user.name, user.password);

    setTimeout(() => {
      window.location.href = user.rol === "admin" ? "../admin/admin.html" : "dashboard.html";
    }, 1500);
  });
});