document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("activeUser"));
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  const contenedor = document.getElementById("eventosEgresado");

  // Utilidad: Verifica si una fecha es futura
  const esFechaFutura = (fechaStr) => {
    const [dia, mes, anio] = fechaStr.split("/").map(Number);
    const fechaEvento = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaEvento >= hoy;
  };

  contenedor.innerHTML = "";

  eventos.forEach((evento, index) => {
    if (!esFechaFutura(evento.fecha)) return; // Salta eventos pasados

    evento.inscritos = evento.inscritos || [];
    const yaInscrito = evento.inscritos.includes(user.email);
    const hayCupos = evento.cupos > 0;

    const div = document.createElement("div");
    div.className = "evento-card";
    div.innerHTML = `
      <strong>${evento.tipo}</strong><br>
      ${evento.nombre}<br>
      Modalidad: ${evento.modalidad}<br>
      Fecha: ${evento.fecha}<br>
      Valor: ${evento.valor}<br>
      Cupos disponibles: ${evento.cupos}<br>
      Lugar: ${evento.departamento}, ${evento.ciudad}<br><br>
      ${
        yaInscrito
          ? `<em>Ya estás inscrito</em>`
          : hayCupos
          ? `<button onclick="inscribirse(${index})">Inscribirme</button>`
          : `<em>Sin cupos disponibles</em>`
      }
    `;

    contenedor.appendChild(div);
  });
});

function inscribirse(index) {
  const user = JSON.parse(localStorage.getItem("activeUser"));
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

  const evento = eventos[index];
  evento.inscritos = evento.inscritos || [];

  if (evento.inscritos.includes(user.email)) {
    alert("Ya estás inscrito en este evento.");
    return;
  }

  if (evento.cupos <= 0) {
    alert("No hay cupos disponibles.");
    return;
  }

  evento.inscritos.push(user.email);
  evento.cupos -= 1;

  localStorage.setItem("eventos", JSON.stringify(eventos));
  alert("Te has inscrito exitosamente.");
  location.reload();
}