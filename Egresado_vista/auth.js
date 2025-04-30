const BLOCK_TIME = 3600000;

// Función para verificar si el usuario está bloqueado
function isUserBlocked() {
  const failedAttempts = JSON.parse(localStorage.getItem("failedAttempts")) || 0;
  const blockTime = localStorage.getItem("blockTime");

  if (failedAttempts >= 3) {
    if (blockTime && new Date().getTime() < blockTime) {
      // El usuario está bloqueado y no puede intentar iniciar sesión hasta que pase el tiempo de bloqueo
      const remainingTime = Math.round((blockTime - new Date().getTime()) / 1000);
      showPopup(`Estás bloqueado. Vuelve a intentarlo en ${remainingTime} segundos.`, false);
      return true;
    } else {
      // Si ya pasó el tiempo de bloqueo, reiniciamos los intentos fallidos
      localStorage.setItem("failedAttempts", 0);
      localStorage.removeItem("blockTime");
      return false;
    }
  }
  return false;
}

// Función para manejar los intentos fallidos
function handleFailedLogin() {
  let failedAttempts = JSON.parse(localStorage.getItem("failedAttempts")) || 0;
  failedAttempts++;
  localStorage.setItem("failedAttempts", failedAttempts);

  if (failedAttempts >= 3) {
    // Si el número de intentos fallidos es 3 o más, bloqueamos al usuario por 1 hora
    const blockTime = new Date().getTime() + BLOCK_TIME;
    localStorage.setItem("blockTime", blockTime);
    showPopup("Has alcanzado el límite de intentos. Tu cuenta ha sido bloqueada durante 1 hora.", false);
  } else {
    showPopup(`Intento fallido. Te quedan ${3 - failedAttempts} intentos.`, false);
  }
}

// Función para restablecer los intentos fallidos después de un inicio de sesión exitoso
function resetFailedAttempts() {
  localStorage.setItem("failedAttempts", 0);
  localStorage.removeItem("blockTime");
}