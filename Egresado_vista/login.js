document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".sign-in").addEventListener("submit", function (e) {
      e.preventDefault();
  
      const email = this.querySelector('input[placeholder="Email"]').value;
      const password = this.querySelector('input[placeholder="Contraseña"]').value;
      const rol = this.querySelector('select[name="rol"]').value;
  
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
  });