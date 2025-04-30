document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("formularioCrearEvento");
  const gridEventos = document.getElementById("listaEventos");
  const departamentosData = typeof colombia !== "undefined" ? colombia : {};

  if (!formContainer || !gridEventos) return;

  // Formulario dinámico
  formContainer.innerHTML = `
    <form id="eventoForm">
      <label>Tipo de evento:</label>
      <select id="tipoEvento" required>
        <option value="">Seleccione tipo</option>
        <option value="Seminario">Seminario</option>
        <option value="Taller">Taller</option>
        <option value="Charla">Charla</option>
        <option value="Conferencia">Conferencia</option>
      </select><br><br>

      <label>Nombre del evento:</label><br>
      <input type="text" id="nombreEvento" required><br><br>

      <label>Fecha de inicio:</label><br>
      <input type="date" id="fechaEvento" required><br><br>

      <label>Valor:</label><br>
      <input type="number" id="valorEvento" required><br><br>

      <label>Cupos:</label><br>
      <input type="number" id="cuposEvento" required><br><br>

      <label>Departamento:</label><br>
      <select id="departamentoEvento" required>
        <option value="">Seleccione departamento</option>
      </select><br><br>

      <label>Ciudad:</label><br>
      <select id="ciudadEvento" required>
        <option value="">Seleccione ciudad</option>
      </select><br><br>

      <button type="submit">Guardar Evento</button>
    </form>
  `;

  // Cargar departamentos
  const departamentoSelect = document.getElementById("departamentoEvento");
  const ciudadSelect = document.getElementById("ciudadEvento");

  for (let depto in departamentosData) {
    const opt = document.createElement("option");
    opt.value = depto;
    opt.textContent = depto;
    departamentoSelect.appendChild(opt);
  }

  departamentoSelect.addEventListener("change", () => {
    ciudadSelect.innerHTML = `<option value="">Seleccione ciudad</option>`;
    const ciudades = departamentosData[departamentoSelect.value];
    ciudades.forEach(ciudad => {
      const opt = document.createElement("option");
      opt.value = ciudad;
      opt.textContent = ciudad;
      ciudadSelect.appendChild(opt);
    });
  });

  // Obtener eventos existentes
  let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  renderizarEventos();

  document.getElementById("eventoForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const nuevoEvento = {
      tipo: document.getElementById("tipoEvento").value,
      nombre: document.getElementById("nombreEvento").value,
      fecha: document.getElementById("fechaEvento").value,
      valor: document.getElementById("valorEvento").value,
      cupos: document.getElementById("cuposEvento").value,
      departamento: departamentoSelect.value,
      ciudad: ciudadSelect.value
    };

    eventos.push(nuevoEvento);
    localStorage.setItem("eventos", JSON.stringify(eventos));
    renderizarEventos();
    this.reset();
  });

  function renderizarEventos() {
    gridEventos.innerHTML = "";
    eventos.forEach(ev => {
      const card = document.createElement("div");
      card.className = "evento-card";
      card.innerHTML = `
        <strong>${ev.tipo}</strong><br>
        ${ev.nombre}<br>
        ${ev.fecha}<br>
        Valor: ${ev.valor} - Cupos: ${ev.cupos}<br>
        ${ev.departamento}, ${ev.ciudad}
      `;
      gridEventos.appendChild(card);
    });
  }
});