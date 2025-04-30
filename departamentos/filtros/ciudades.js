document.addEventListener("DOMContentLoaded", () => {
    const departamentoSelect = document.querySelector('select[name="departamento"]');
    const ciudadSelect = document.querySelector('select[name="ciudad"]');
  
    if (!departamentoSelect || !ciudadSelect || typeof colombia === "undefined") return;
  
    // Inicializar ciudades si ya hay departamento seleccionado
    if (departamentoSelect.value) {
      llenarCiudades(departamentoSelect.value);
    }
  
    departamentoSelect.addEventListener("change", () => {
      const selectedDept = departamentoSelect.value;
      llenarCiudades(selectedDept);
    });
  
    function llenarCiudades(departamento) {
      ciudadSelect.innerHTML = "<option value=''>Seleccione ciudad</option>";
      if (colombia[departamento]) {
        colombia[departamento].forEach(ciudad => {
          const option = document.createElement("option");
          option.value = ciudad;
          option.textContent = ciudad;
          ciudadSelect.appendChild(option);
        });
      }
    }
  });