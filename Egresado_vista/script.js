document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container");
  const btnSignIn = document.getElementById("btn-sign-in");
  const btnSignUp = document.getElementById("btn-sign-up");

  if (btnSignIn && btnSignUp) {
    btnSignIn.addEventListener("click", () => container.classList.remove("toggle"));
    btnSignUp.addEventListener("click", () => container.classList.add("toggle"));
  }
  //esta es la función del pop up para cada mensaje de alerta que había
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

  function closePopup() { //obviamente aquí lo estoy cerrando
    const popup = document.getElementById("popup");
    popup.classList.remove("show", "success");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }

  function validateNumeric(value) {
    return /^\d{1,11}$/.test(value);
  }

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

  function clearError(input) {
    const error = input.parentElement.querySelector(".error-message");
    if (error) error.remove();
  }

  function clearErrors(form) {
    form.querySelectorAll(".error-message").forEach(e => e.remove());
  }

  function validateField(input) {
    const placeholder = input.getAttribute("placeholder");
    const value = input.value.trim();
    clearError(input);

    if (!value) {
      showError(input, `${placeholder} es obligatorio.`);
      return false;
    }
    if (placeholder === "Email" && !validateEmail(value)) {
      showError(input, "Correo electrónico inválido");
      return false;
    }
    if (placeholder === "Contraseña") {
      if (!value) {
        showError(input, "Ingrese la contraseña");
        return false;
      }
      if (!validatePassword(value)) {
        //  si estoy en el login
        if (!input.closest(".sign-in")) {
          showError(input, "Contraseña insegura (mín. 8 caracteres, mayúscula, minúscula, número y símbolo)");
          return false;
        }
      }
    }
    if ((placeholder === "Teléfono" || placeholder === "Identificación") && !validateNumeric(value)) {
      showError(input, "Solo se permiten hasta 11 números");
      return false;
    }
    return true;
  }

  function enforceNumericInput(input) {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 11);
    });
  }

  const identificacionInput = document.querySelector('input[placeholder="Identificación"]');
  const telefonoInput = document.querySelector('input[placeholder="Teléfono"]');

  if (identificacionInput) enforceNumericInput(identificacionInput);
  if (telefonoInput) enforceNumericInput(telefonoInput);
//llamo la función aquí de enviar el correo al validar que todos los campos estén correctos
  function enviarCorreoRegistro(email, name, password) {
    console.log("Preparando solicitud de envío para:", email);
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
          <p>Gracias por registrarte en el Proyecto de Egresados podrás ingresar con las siguientes credenciales.</p>
          <p><strong>Correo:</strong> ${email}</p>
          <p><strong>Contraseña:</strong> ${password}</p>
          <p>¡Bienvenido a la comunidad!</p>
        `
      })
    })
    .then(res => res.json())
    .then(data => console.log("Correo enviado con éxito:", data)) //lo hice para mirar en consola si estaba enviando pero no sale nada en la terminal o en consola o en cmd o en powershell me muero
    .catch(err => console.error("Error al enviar el correo:", err));
  }

  const registerForm = document.querySelector(".sign-up");
  if (registerForm) {
    const inputs = registerForm.querySelectorAll("input");
    inputs.forEach(input => {
      input.addEventListener("input", () => validateField(input));
    });

    registerForm.addEventListener("submit", function (e) {
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
      const programa = this.querySelector('input[placeholder="Programa Académico/unidad o area"]');
      const rol = this.querySelector('select[name="rol"]');

      let valid = true;
      [name, email, password, identificacion, telefono, direccion, programa].forEach(input => {
        if (!validateField(input)) valid = false;
      });

      if (!departamento.value) {
        showError(departamento, "Seleccione un departamento");
        valid = false;
      } else {
        clearError(departamento);
      }

      if (!ciudad.value) {
        showError(ciudad, "Seleccione una ciudad");
        valid = false;
      } else {
        clearError(ciudad);
      }

      if (!rol.value) {
        showError(rol, "Seleccione un rol");
        valid = false;
      } else {
        clearError(rol);
      }

      if (!valid) {
        const hayCampoVacio = [name, email, password, identificacion, telefono, direccion, programa].some(input => input.value.trim() === "") 
          || !departamento.value || !ciudad.value || !rol.value;
      
        if (hayCampoVacio) {
          showPopup("Faltan campos por llenar");
        }
        // Si no hay campos vacíos, los errores ya están mostrados junto a los inputs
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
  }

  const loginForm = document.querySelector(".sign-in");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(this);

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
});