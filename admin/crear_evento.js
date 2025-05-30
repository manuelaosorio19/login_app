document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("formularioCrearEvento");
  const gridEventos = document.getElementById("listaEventos");
  const departamentosData = typeof colombia !== "undefined" ? colombia : {};

  if (!formContainer || !gridEventos) return;

  const estiloError = 'color: red; font-size: 0.9em; margin: 5px 0;';

  // HTML del formulario
  formContainer.innerHTML = `
    <div id="popupMensaje" style="display:none; background:#f44336; color:white; padding:10px; border-radius:5px; margin-bottom:10px; position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 9999;"></div>
    <form id="eventoForm" style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); max-width: 1800px; margin: auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; align-items: end;">
      <div>
        <label>Tipo de evento:</label>
        <select id="tipoEvento" required style="width: 100%;">
          <option value="">Seleccione tipo</option>
          <option value="Seminario">Seminario</option>
          <option value="Taller">Taller</option>
          <option value="Charla">Charla</option>
          <option value="Conferencia">Conferencia</option>
        </select>
        <div id="tipoError" style="${estiloError}"></div>
      </div>

      <div>
        <label>Modalidad:</label>
        <select id="modalidadEvento" required style="width: 100%;">
          <option value="">Seleccione modalidad</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
        </select>
        <div id="modalidadError" style="${estiloError}"></div>
      </div>

      <div>
        <label>Nombre del evento:</label>
        <input type="text" id="nombreEvento" required style="width: 100%;">
      </div>

      <div>
        <label>Fecha de inicio:</label>
        <input type="date" id="fechaEvento" required style="width: 100%;">
        <div id="fechaError" style="${estiloError}"></div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <label for="aplicaValor" style="display: flex; align-items: center; cursor: pointer; margin-top: 24px;">
          <input type="checkbox" id="aplicaValor" style="margin-right: 6px;"/>
          Aplica valor
        </label>
      </div>

      <div>
        <label for="valorEvento">Valor</label>
        <input type="number" id="valorEvento" value="0" required disabled style="width: 100%;">
        <div id="valorError" style="${estiloError}"></div>
      </div>

      <div>
        <label>Cupos:</label>
        <input type="number" id="cuposEvento" required style="width: 100%;">
        <div id="cuposError" style="${estiloError}"></div>
      </div>

      <div>
        <label>Departamento:</label>
        <select id="departamentoEvento" required style="width: 100%;"></select>
      </div>

      <div>
        <label>Ciudad:</label>
        <select id="ciudadEvento" required style="width: 100%;"></select>
        <div id="ciudadError" style="${estiloError}"></div>
      </div>

      <div style="grid-column: span 4; text-align: center;">
        <button type="submit" style="padding: 10px 25px; font-size: 1rem; border:none; border-radius: 5px; background-color:#007bff; color: white; cursor: pointer;">Guardar Evento</button>
      </div>
    </form>
  `;

  //  Capturar el formulario luego de renderizarlo
  const eventoForm = document.getElementById("eventoForm");

  // Sección de botones y eventos
  gridEventos.innerHTML = `
    <div style="margin-top: 20px; max-width: 1200px; margin-left: auto; margin-right: auto;">
      <div style="display:flex; justify-content:center; gap: 15px; margin-bottom: 20px;">
        <button id="btnFuturos" class="tab-btn active" style="padding: 10px 20px; cursor:pointer; border:none; background:#007bff; color:white; border-radius:5px;">Eventos futuros</button>
        <button id="btnPasados" class="tab-btn" style="padding: 10px 20px; cursor:pointer; border:none; background:#ddd; border-radius:5px;">Eventos pasados</button>
        <button id="btnDescargarExcel" style="padding: 10px 20px; background-color: orange; border: none; border-radius: 5px; color: white; cursor: pointer;"> Exportar Excel</button>
      </div>
      <div id="contenedorFuturos"></div>
      <div id="contenedorPasados" style="display:none;"></div>
    </div>
  `;

  const popupMensaje = document.getElementById("popupMensaje");

  function mostrarPopup(mensaje, color = "#f44336") {
    popupMensaje.textContent = mensaje;
    popupMensaje.style.background = color;
    popupMensaje.style.display = "block";
    setTimeout(() => {
      popupMensaje.style.display = "none";
      popupMensaje.textContent = "";
    }, 3000);
  }

  // Referencias inputs
  const tipoEvento = document.getElementById("tipoEvento");
  const modalidad = document.getElementById("modalidadEvento");
  const ciudad = document.getElementById("ciudadEvento");
  const departamento = document.getElementById("departamentoEvento");
  const cuposInput = document.getElementById("cuposEvento");
  const valorInput = document.getElementById("valorEvento");
  const aplicaValor = document.getElementById("aplicaValor");

  // Pestañas y contenedores
  const btnFuturos = document.getElementById("btnFuturos");
  const btnPasados = document.getElementById("btnPasados");
  const contenedorFuturos = document.getElementById("contenedorFuturos");
  const contenedorPasados = document.getElementById("contenedorPasados");

  // Cargar departamentos
  for (let depto in departamentosData) {
    departamento.appendChild(new Option(depto, depto));
  }

  departamento.addEventListener("change", () => {
    ciudad.innerHTML = `<option value="">Seleccione ciudad</option>`;
    const ciudades = departamentosData[departamento.value] || [];
    ciudades.forEach(c => ciudad.add(new Option(c, c)));
  });

  aplicaValor.addEventListener("change", () => {
    valorInput.disabled = !aplicaValor.checked;
    if (!aplicaValor.checked) valorInput.value = 0;
    validarCampos();
  });

  function validarCampos() {
    const tipo = tipoEvento.value;
    const mod = modalidad.value;
    const cupos = parseInt(cuposInput.value) || 0;
    const valor = parseInt(valorInput.value) || 0;
    const ciudadVal = ciudad.value;
    const fechaEvento = document.getElementById("fechaEvento").value;
    const hoy = new Date().toISOString().split("T")[0];

    document.getElementById("fechaError").textContent = '';
    document.getElementById("modalidadError").textContent = '';
    document.getElementById("cuposError").textContent = '';
    document.getElementById("valorError").textContent = '';
    document.getElementById("ciudadError").textContent = '';

    if (fechaEvento <= hoy) {
      document.getElementById("fechaError").textContent = "La fecha debe ser futura.";
    }

    if (["Seminario", "Taller", "Charla"].includes(tipo)) {
      if (mod === "Presencial" && cupos > 50) {
        document.getElementById("cuposError").textContent = "Máximo 50 cupos para modalidad presencial.";
      } else if (mod === "Virtual" && cupos > 200) {
        document.getElementById("cuposError").textContent = "Máximo 200 cupos para modalidad virtual.";
      }
    }

    if (tipo === "Conferencia") {
      if (mod !== "Presencial") {
        document.getElementById("modalidadError").textContent = "Las conferencias solo pueden ser presenciales.";
      }
      if (!["Medellín", "Bogotá"].includes(ciudadVal)) {
        document.getElementById("ciudadError").textContent = "Las conferencias solo se permiten en Medellín o Bogotá.";
      }
      if (cupos > 200) {
        document.getElementById("cuposError").textContent = "Máximo 200 cupos para conferencia.";
      }
    }

    if (aplicaValor.checked && valor <= 0) {
      document.getElementById("valorError").textContent = "El valor debe ser mayor a 0 si aplica.";
    }
  }

  // Validar en cambios/input
  tipoEvento.addEventListener("change", validarCampos);
  modalidad.addEventListener("change", validarCampos);
  ciudad.addEventListener("change", validarCampos);
  cuposInput.addEventListener("input", validarCampos);
  valorInput.addEventListener("input", validarCampos);
  aplicaValor.addEventListener("change", validarCampos);

  // Eventos guardados en localStorage
  let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

  function renderizarEventos() {
    if (eventos.length === 0) {
      contenedorFuturos.innerHTML = "<p>No hay eventos futuros.</p>";
      contenedorPasados.innerHTML = "<p>No hay eventos pasados.</p>";
      return;
    }

    const hoy = new Date().toISOString().split("T")[0];

    const futuros = eventos.filter(ev => ev.fecha > hoy).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    const pasados = eventos.filter(ev => ev.fecha <= hoy).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

    // Eventos futuros con cards en grid
    function generarCards(eventosArray) {
      if (eventosArray.length === 0) return "<p>No hay eventos en esta categoría.</p>";

      let html = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">`;

      eventosArray.forEach((evento) => {
        const idx = eventos.indexOf(evento);
        html += `
          <div class="card-evento" style="background:#f9f9f9; border-radius:8px; padding:15px; box-shadow:0 2px 6px rgba(0,0,0,0.1); position: relative;">
            <h4 style="margin-top: 0; margin-bottom: 10px;">${evento.nombre}</h4>
            <p><strong>Tipo:</strong> ${evento.tipo}</p>
            <p><strong>Modalidad:</strong> ${evento.modalidad}</p>
            <p><strong>Fecha:</strong> ${evento.fecha}</p>
            <p><strong>Aplica valor:</strong> ${evento.aplicaValor ? "Sí" : "No"}</p>
            <p><strong>Valor:</strong> ${evento.aplicaValor ? evento.valor : "N/A"}</p>
            <p><strong>Cupos:</strong> ${evento.cupos}</p>
            <p><strong>Departamento:</strong> ${evento.departamento}</p>
            <p><strong>Ciudad:</strong> ${evento.ciudad}</p>
            <div style="position:absolute; top:15px; right:15px; display:flex; gap:8px;">
              <button title="Editar" onclick="editarEvento(${idx})" style="background:none; border:none; cursor:pointer;" aria-label="Editar evento">✏️</button>
              <button title="Eliminar" onclick="confirmarEliminarEvento(${idx})" style="background:none; border:none; cursor:pointer; color:#d9534f;" aria-label="Eliminar evento">🗑️</button>
            </div>
          </div>
        `;
      });

      html += "</div>";
      return html;
    }

    // Eventos pasados en tabla estilo grid
    function generarGridPasados(eventosArray) {
      if (eventosArray.length === 0) return "<p>No hay eventos en esta categoría.</p>";

      let html = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #007bff; color: white;">
            <th style="padding: 8px; border: 1px solid #ddd;">Nombre</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Tipo</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Modalidad</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Fecha</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Aplica Valor</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Valor</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Cupos</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Departamento</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Ciudad</th>
          </tr>
        </thead>
        <tbody>
      `;

      eventosArray.forEach(ev => {
        html += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.nombre}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.tipo}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.modalidad}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.fecha}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.aplicaValor ? "Sí" : "No"}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.aplicaValor ? ev.valor : "N/A"}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.cupos}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.departamento}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${ev.ciudad}</td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      return html;
    }

    contenedorFuturos.innerHTML = generarCards(futuros);
    contenedorPasados.innerHTML = generarGridPasados(pasados);
  }

  // Editar evento
  window.editarEvento = function(index) {
    const evento = eventos[index];
    const hoy = new Date().toISOString().split("T")[0];

    if (evento.fecha <= hoy) {
      mostrarPopup("No puedes editar eventos pasados.");
      return;
    }

    tipoEvento.value = evento.tipo;
    modalidad.value = evento.modalidad;
    document.getElementById("nombreEvento").value = evento.nombre;
    document.getElementById("fechaEvento").value = evento.fecha;
    aplicaValor.checked = evento.aplicaValor;
    valorInput.disabled = !evento.aplicaValor;
    valorInput.value = evento.valor;
    cuposInput.value = evento.cupos;
    departamento.value = evento.departamento;
    departamento.dispatchEvent(new Event("change"));
    ciudad.value = evento.ciudad;

    eventoForm.dataset.editarIndex = index;
    mostrarPopup("Edita el evento y presiona Guardar.", "#2196f3");
  };

  // Confirmar eliminar evento con popup
  window.confirmarEliminarEvento = function(index) {
    const evento = eventos[index];
    const hoy = new Date().toISOString().split("T")[0];

    if (evento.fecha <= hoy) {
      mostrarPopup("No puedes eliminar eventos pasados.");
      return;
    }

    // Crear popup personalizado para confirmación
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      eventos.splice(index, 1);
      localStorage.setItem("eventos", JSON.stringify(eventos));
      renderizarEventos();
      mostrarPopup("Evento eliminado.", "#4caf50");
    }
  };

  eventoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    validarCampos();

    if (
      document.getElementById("fechaError").textContent !== '' ||
      document.getElementById("modalidadError").textContent !== '' ||
      document.getElementById("cuposError").textContent !== '' ||
      document.getElementById("valorError").textContent !== '' ||
      document.getElementById("ciudadError").textContent !== ''
    ) {
      mostrarPopup("Corrige los errores antes de guardar.");
      return;
    }

    const nuevoEvento = {
      tipo: tipoEvento.value,
      modalidad: modalidad.value,
      nombre: document.getElementById("nombreEvento").value.trim(),
      fecha: document.getElementById("fechaEvento").value,
      aplicaValor: aplicaValor.checked,
      valor: aplicaValor.checked ? parseInt(valorInput.value) : 0,
      cupos: parseInt(cuposInput.value),
      departamento: departamento.value,
      ciudad: ciudad.value,
    };

    if (!nuevoEvento.tipo || !nuevoEvento.modalidad || !nuevoEvento.nombre || !nuevoEvento.fecha || !nuevoEvento.departamento || !nuevoEvento.ciudad) {
      mostrarPopup("Por favor complete todos los campos obligatorios.");
      return;
    }

    const editarIndex = eventoForm.dataset.editarIndex;
    if (editarIndex !== undefined) {
      eventos[editarIndex] = nuevoEvento;
      delete eventoForm.dataset.editarIndex;
      mostrarPopup("Evento actualizado correctamente.", "#4caf50");
    } else {
      eventos.push(nuevoEvento);
      mostrarPopup("Evento creado correctamente.", "#4caf50");
    }

    localStorage.setItem("eventos", JSON.stringify(eventos));

    eventoForm.reset();
    valorInput.disabled = true;
    renderizarEventos();
  });
  function descargarExcel() {
  if (!eventos.length) {
    mostrarPopup("No hay eventos para exportar.");
    return;
  }

  const header = ["Nombre", "Tipo", "Modalidad", "Fecha", "Aplica Valor", "Valor", "Cupos", "Departamento", "Ciudad", "Estado"];
  const rows = eventos.map(ev => [
    ev.nombre,
    ev.tipo,
    ev.modalidad,
    ev.fecha,
    ev.aplicaValor ? "Sí" : "No",
    ev.aplicaValor ? ev.valor : "N/A",
    ev.cupos,
    ev.departamento,
    ev.ciudad,
    new Date(ev.fecha) > new Date() ? "Futuro" : "Pasado"
  ]);

  const csvContent = [header, ...rows].map(e => e.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "eventos.csv";
  a.click();
  URL.revokeObjectURL(url);
}
document.getElementById("btnDescargarExcel").addEventListener("click", descargarExcel);

  // Pestañas
  btnFuturos.addEventListener("click", () => {
    btnFuturos.classList.add("active");
    btnFuturos.style.backgroundColor = "#007bff";
    btnFuturos.style.color = "white";
    btnPasados.classList.remove("active");
    btnPasados.style.backgroundColor = "#ddd";
    btnPasados.style.color = "black";
    contenedorFuturos.style.display = "grid";
    contenedorPasados.style.display = "none";
  });

  btnPasados.addEventListener("click", () => {
    btnPasados.classList.add("active");
    btnPasados.style.backgroundColor = "#007bff";
    btnPasados.style.color = "white";
    btnFuturos.classList.remove("active");
    btnFuturos.style.backgroundColor = "#ddd";
    btnFuturos.style.color = "black";
    contenedorFuturos.style.display = "none";
    contenedorPasados.style.display = "block";
  });

  btnFuturos.click();
  renderizarEventos();
});
