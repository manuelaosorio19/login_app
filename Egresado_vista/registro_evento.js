const style = `
  .evento-card {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 12px;
    background: #f9f9f9;
  }
  .btn-inscribirse {
    padding: 8px 16px;
    background-color: #2d89ef;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }
  .btn-inscribirse:hover:not(:disabled) {
    background-color: #1b5fbd;
  }
  .btn-inscribirse:disabled {
    background-color: #999;
    cursor: default;
  }
  .btn-inscrito {
    background-color: #4CAF50 !important;
    cursor: default;
  }

  /* Popup Overlay */
  #popup {
    display: none;
    position: fixed;
    top: 0; left: 0; right:0; bottom:0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    justify-content: center;
    align-items: center;
  }
  #popup.show {
    display: flex;
  }
  #popup .popup-box {
    background: white;
    padding: 20px 30px;
    border-radius: 8px;
    max-width: 320px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  #popup .popup-message {
    margin-bottom: 20px;
    font-size: 1.1em;
  }
  #popup button {
    padding: 8px 18px;
    border: none;
    background-color: #2d89ef;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
  }
  #popup button:hover {
    background-color: #1b5fbd;
  }
`;
const styleEl = document.createElement("style");
styleEl.textContent = style;
document.head.appendChild(styleEl);

// Crear el HTML del popup y agregarlo al body
const popupHtml = `
  <div id="popup">
    <div class="popup-box">
      <p id="popup-message" class="popup-message"></p>
      <button id="popup-btn">Aceptar</button>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", popupHtml);

// Función para mostrar popup con mensaje y opción confirmación
function showPopup(message, confirmCallback = null) {
  const popup = document.getElementById("popup");
  const msg = document.getElementById("popup-message");
  const btn = document.getElementById("popup-btn");

  msg.textContent = message;
  popup.classList.add("show");

  // Limpiar eventos anteriores del botón
  btn.onclick = null;

  if (confirmCallback) {
    btn.textContent = "Sí";
    // Botón para cancelar (cerrar popup sin hacer nada)
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "No";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.style.backgroundColor = "#ccc";
    cancelBtn.style.color = "#000";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.padding = "8px 18px";
    cancelBtn.id = "popup-cancel-btn";

    // Si ya existe el botón de cancelar, no agregarlo de nuevo
    if (!document.getElementById("popup-cancel-btn")) {
      btn.parentNode.appendChild(cancelBtn);
    }

    btn.onclick = () => {
      popup.classList.remove("show");
      cancelBtn.remove();
      confirmCallback();
    };
    cancelBtn.onclick = () => {
      popup.classList.remove("show");
      cancelBtn.remove();
    };
  } else {
    btn.textContent = "Aceptar";
    // Remover botón cancelar si existe
    const cancelBtn = document.getElementById("popup-cancel-btn");
    if (cancelBtn) cancelBtn.remove();

    btn.onclick = () => {
      popup.classList.remove("show");
    };
  }
}

// Cargar eventos y mostrar cards con botón inscribirse
document.addEventListener("DOMContentLoaded", () => {
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  const contenedor = document.getElementById("eventosEgresado");
  contenedor.innerHTML = "";

  const hoy = new Date();

  eventos.forEach((evento, index) => {
    const fechaEvento = new Date(evento.fecha);

    if (fechaEvento > hoy) {
      const div = document.createElement("div");
      div.className = "evento-card";
      div.innerHTML = `
        <strong>${evento.tipo}</strong><br>
        ${evento.nombre}<br>
        ${evento.fecha}<br>
        ${evento.modalidad}<br>
        Valor: ${evento.valor} - Cupos: <span id="cupos-${index}">${evento.cupos}</span><br>
        ${evento.departamento}, ${evento.ciudad}<br>
      `;

      if (evento.cupos > 0) {
        const btn = document.createElement("button");
        btn.textContent = "Inscribirse";
        btn.className = "btn-inscribirse";

        btn.addEventListener("click", () => {
          showPopup(`¿Estás seguro de que deseas inscribirte en "${evento.nombre}"?`, () => {
            // Confirmado

            // Mostrar mensaje
            showPopup(`Te has inscrito en "${evento.nombre}". ¡Nos vemos allá!`);

            // Descontar cupo
            eventos[index].cupos -= 1;
            localStorage.setItem("eventos", JSON.stringify(eventos));

            // Actualizar cupos en pantalla
            const cuposSpan = document.getElementById(`cupos-${index}`);
            cuposSpan.textContent = eventos[index].cupos;

            // Cambiar botón a "Inscrito"
            btn.disabled = true;
            btn.textContent = "Inscrito";
            btn.classList.add("btn-inscrito");
          });
        });

        div.appendChild(btn);
      } else {
        const agotado = document.createElement("p");
        agotado.textContent = "Cupos agotados";
        div.appendChild(agotado);
      }

      contenedor.appendChild(div);
    }
  });

  if (contenedor.children.length === 0) {
    contenedor.innerHTML = "<p>No hay eventos futuros disponibles.</p>";
  }
});