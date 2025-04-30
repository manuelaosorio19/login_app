document.querySelector(".sign-up").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = this.querySelector('input[placeholder="Nombre"]').value;
    const email = this.querySelector('input[placeholder="Email"]').value;
    const password = this.querySelector('input[placeholder="Contraseña"]').value;

    //función del pop up para los mensajes de validación porque ajaaaa
    function showPopup(message, isSuccess = false) {
        const popup = document.getElementById("popup");
        const messageSpan = document.getElementById("popup-message");
    
        // Si el popup ya está mostrándose, lo cerramos antes de abrir el nuevo
        if (popup.classList.contains("show")) {
            popup.classList.remove("show", "success");
            clearTimeout(popup._timeout); // Cancelar timeout anterior si existía
        }
    
        // Establecer el nuevo mensaje
        messageSpan.textContent = message;
    
        // Resetear clases y aplicar si es éxito
        popup.classList.remove("success");
        if (isSuccess) {
            popup.classList.add("success");
        }
    
        // Mostrar popup
        popup.style.display = "block";
        popup.classList.add("show");
    
        // Guarda el timeout en una propiedad para poder limpiarlo si es necesario
        popup._timeout = setTimeout(() => {
            closePopup();
        }, 5000);
    }
    
    function closePopup() {
        const popup = document.getElementById("popup");
        popup.classList.remove("show", "success");
        setTimeout(() => {
            popup.style.display = "none";
        }, 500);
    
    }
    if (!validateEmail(email)) {
        showPopup("Por favor, introduce un correo electrónico válido.");
        return;
    }

    if (!validatePassword(password)) {
        showPopup("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.");
        return;
    }

    const user = { name, email, password };
    
    // Guardar en localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Verificar si el correo ya está registrado
    const userExists = users.some(u => u.email === email);
    if (userExists) {
        showPopup("Este correo ya está registrado.");
        return;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    showPopup("Registro guardado con éxito.", true);

    // Enviar correo tras registro exitoso
    enviarCorreoRegistro(email, name, password);

    this.reset();
});

function validateEmail(email) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(email);
}

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

// Nueva función para enviar correo vía API Express con el bendito node me mamaaaaa en reversa
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
                <p>Gracias por registrarte en el Proyecto de Egresados.</p>
                <p><strong>Correo:</strong> ${email}</p>
                <p><strong>Contraseña:</strong> ${password}</p>
                <p>¡Bienvenido a la plataforma estudiantil!</p>
            `
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Correo enviado con éxito:", data);
    })
    .catch(error => {
        console.error("Error al enviar el correo:", error);
        showPopup("Error al enviar el correo. Intenta nuevamente.", false); // <- ESTA LÍNEA NUEVA
    });
}