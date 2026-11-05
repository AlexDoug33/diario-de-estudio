const STORAGE_KEY = "diario-estudio-sesiones";
const GOAL_STORAGE_KEY = "diario-estudio-objetivo-semanal";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function aFormatoLocal(anio, mes, dia) {
  const mesStr = String(mes).padStart(2, "0");
  const diaStr = String(dia).padStart(2, "0");
  return `${anio}-${mesStr}-${diaStr}`;
}

function fechaLocalHoy() {
  const hoy = new Date();
  return aFormatoLocal(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
}

function restarDias(fechaStr, delta) {
  const partes = fechaStr.split("-").map(Number);
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  fecha.setDate(fecha.getDate() + delta);
  return aFormatoLocal(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate());
}

function formatearFecha(fechaStr) {
  const partes = fechaStr.split("-").map(Number);
  return `${partes[2]} de ${MESES[partes[1] - 1]} de ${partes[0]}`;
}

function readStoredSessions() {
  const current = localStorage.getItem(STORAGE_KEY);
  const previous = localStorage.getItem("diario-estudio.sesiones");
  const datos = JSON.parse(current !== null ? current : previous !== null ? previous : "[]");
  if (!Array.isArray(datos)) throw new Error("Datos de sesiones inválidos");
  return datos;
}

function readWeeklyState() {
  let sessions;
  let goal;
  try {
    sessions = { status: "valid", value: readStoredSessions() };
  } catch (error) {
    sessions = { status: "inaccessible", value: null };
  }
  try {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    const value = stored === null ? null : parseGoal(stored);
    goal = { status: stored === null ? "absent" : value === null ? "corrupt" : "valid", value };
  } catch (error) {
    goal = { status: "inaccessible", value: null };
  }
  return { sessions, goal };
}

function saveWeeklyGoal(input) {
  const value = parseGoal(input);
  if (value === null) return { ok: false, error: "invalid" };
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, value);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "storage" };
  }
}

function removeWeeklyGoal() {
  try {
    localStorage.removeItem(GOAL_STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "storage" };
  }
}

function obtenerSesiones(datos) {
  // Compatibilidad con el formato anterior: { fecha, tema, minutos }
  return datos.filter((s) => s && typeof s === "object").map((s) => ({
    date: s.date || s.fecha || "",
    topic: s.topic || s.tema || "",
    minutes: s.minutes || s.minutos || 0
  }));
}

function guardarSesionEnStorage(sesion) {
  const sesiones = readStoredSessions();
  sesiones.push(sesion);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesiones));
}

function calcularRacha(sesiones) {
  const diasConSesion = new Set(sesiones.map((s) => s.date));

  let diaFinal;
  const hoy = fechaLocalHoy();
  if (diasConSesion.has(hoy)) {
    diaFinal = hoy;
  } else {
    const ayer = restarDias(hoy, -1);
    diaFinal = diasConSesion.has(ayer) ? ayer : null;
  }

  let racha = 0;
  while (diaFinal && diasConSesion.has(diaFinal)) {
    racha++;
    diaFinal = restarDias(diaFinal, -1);
  }
  return racha;
}

function calcularMejorRacha(sesiones) {
  const diasConSesion = [...new Set(sesiones.map((s) => s.date))]
    .filter((dia) => dia <= fechaLocalHoy())
    .sort();

  let mejor = 0;
  let corrida = 0;
  let diaAnterior = null;

  for (const dia of diasConSesion) {
    if (diaAnterior && restarDias(diaAnterior, 1) === dia) {
      corrida++;
    } else {
      corrida = 1;
    }
    if (corrida > mejor) mejor = corrida;
    diaAnterior = dia;
  }

  return mejor;
}

function calcularDiasMes(sesiones) {
  const hoy = fechaLocalHoy();
  const primerDia = `${hoy.slice(0, 7)}-01`;
  const dias = sesiones
    .map((sesion) => sesion.date)
    .filter((dia) => dia >= primerDia && dia <= hoy);
  return new Set(dias).size;
}

function renderizar() {
  renderWeekly(fechaLocalHoy());
  let datos;
  try {
    datos = readStoredSessions();
  } catch (error) {
    document.getElementById("heat-content").hidden = true;
    document.getElementById("heat-error").textContent = "No se pueden leer las sesiones ni mostrar el mapa.";
    return;
  }
  renderHeatMap(datos);
  const sesionesGuardadas = obtenerSesiones(datos);
  const sesiones = sesionesGuardadas.filter((s) => isValidDate(s.date) && Number.isFinite(s.minutes));
  const racha = calcularRacha(sesiones);
  const mejorRacha = calcularMejorRacha(sesiones);
  const diasMes = calcularDiasMes(sesiones);

  const rachaEl = document.getElementById("racha");
  const textoEl = document.querySelector(".racha-texto");
  const mejorEl = document.getElementById("racha-mejor");
  const diasMesEl = document.getElementById("dias-mes");
  rachaEl.textContent = racha;
  textoEl.textContent = racha === 1 ? "día seguido estudiando" : "días seguidos estudiando";
  mejorEl.textContent = mejorRacha;
  diasMesEl.textContent = diasMes;

  const lista = document.getElementById("lista-sesiones");
  lista.innerHTML = "";

  if (sesionesGuardadas.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "vacio";
    vacio.textContent = "Aún no hay sesiones registradas.";
    lista.appendChild(vacio);
    return;
  }

  const ordenadas = [...sesionesGuardadas].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  for (const sesion of ordenadas) {
    const item = document.createElement("li");
    item.className = "sesion";

    const fecha = document.createElement("span");
    fecha.className = "sesion-fecha";
    fecha.textContent = isValidDate(sesion.date) ? formatearFecha(sesion.date) : String(sesion.date || "Fecha no válida");

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.topic;

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutes} min`;

    item.appendChild(fecha);
    item.appendChild(tema);
    item.appendChild(minutos);
    lista.appendChild(item);
  }
}

function renderWeekly(today) {
  const state = readWeeklyState();
  const totalElement = document.getElementById("minutos-semana");
  const warning = document.getElementById("weekly-session-warning");
  const status = document.getElementById("goal-status");
  const progress = document.getElementById("goal-progress");
  const remove = document.getElementById("goal-remove");
  progress.hidden = true;
  warning.textContent = "";
  let total = null;
  if (state.sessions.status !== "valid") {
    totalElement.textContent = "No se puede calcular";
    warning.textContent = "No se pueden leer las sesiones para calcular la semana.";
  } else {
    const result = calculateWeeklyTotal(state.sessions.value, today);
    total = typeof result === "number" ? result : result.total;
    totalElement.textContent = total === null ? "Total incompleto" : `${total} min`;
    if (typeof result === "object" && result.hasInvalidDate) {
      warning.textContent = "Algunos datos no se han podido interpretar.";
    }
  }
  remove.hidden = state.goal.status === "absent";
  if (state.goal.status === "absent") {
    status.textContent = "Aún no tienes un objetivo semanal";
  } else if (state.goal.status === "corrupt") {
    status.textContent = "Error: el objetivo guardado está corrupto. Puedes sustituirlo o eliminarlo.";
  } else if (state.goal.status === "inaccessible") {
    status.textContent = "Error: no se puede leer el objetivo semanal.";
  } else {
    status.textContent = `Objetivo semanal: ${state.goal.value} minutos`;
    if (total !== null) {
      const text = `${total} de ${state.goal.value} minutos`;
      document.getElementById("goal-progress-text").textContent = text;
      const bar = document.getElementById("goal-bar");
      bar.value = calculateProgress(total, state.goal.value) * 100;
      bar.setAttribute("aria-valuetext", text);
      progress.hidden = false;
    }
  }
}

function handleGoalSave(event) {
  event.preventDefault();
  const result = saveWeeklyGoal(document.getElementById("goal-input").value);
  const error = document.getElementById("goal-action-error");
  if (!result.ok) {
    error.textContent = result.error === "invalid" ? "Introduce un número entero positivo de minutos." : "No se puede guardar el objetivo.";
    return;
  }
  error.textContent = "";
  document.getElementById("goal-input").value = "";
  renderWeekly(fechaLocalHoy());
}

function handleGoalRemove() {
  const result = removeWeeklyGoal();
  const error = document.getElementById("goal-action-error");
  if (!result.ok) {
    error.textContent = "No se puede eliminar el objetivo.";
    return;
  }
  error.textContent = "";
  document.getElementById("goal-input").value = "";
  renderWeekly(fechaLocalHoy());
}

function renderHeatMap(sessions) {
  const content = document.getElementById("heat-content");
  const message = document.getElementById("heat-error");
  try {
    const result = buildHeatMap(sessions, fechaLocalHoy());
    const grid = document.getElementById("heat-grid");
    const weekdays = document.getElementById("heat-weekdays");
    const detail = document.getElementById("heat-detail");
    const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    grid.replaceChildren();
    weekdays.replaceChildren();
    detail.textContent = "Selecciona un día para consultar sus minutos.";
    result.days.forEach((day, index) => {
      if (index < 7) {
        const parts = day.date.split("-").map(Number);
        const label = document.createElement("span");
        label.textContent = names[new Date(parts[0], parts[1] - 1, parts[2], 12).getDay()].slice(0, 3);
        weekdays.appendChild(label);
      }
      const button = document.createElement("button");
      const description = `${formatearFecha(day.date)}: ${day.incomplete ? "total incompleto" : `${day.minutes} minutos`}`;
      button.type = "button";
      button.className = `heat-day ${day.incomplete ? "incomplete" : `level-${day.level}`}`;
      button.setAttribute("aria-label", description);
      button.textContent = day.incomplete ? "?" : String(day.level);
      const show = () => { detail.textContent = description; };
      button.addEventListener("focus", show);
      button.addEventListener("mouseenter", show);
      button.addEventListener("click", show);
      button.addEventListener("blur", () => { detail.textContent = "Selecciona un día para consultar sus minutos."; });
      grid.appendChild(button);
    });
    message.textContent = result.hasInvalid ? "Algunos datos no se han podido interpretar." : "";
    content.hidden = false;
  } catch (error) {
    content.hidden = true;
    message.textContent = "No se puede calcular el mapa de estudio.";
  }
}

function guardarSesion(evento) {
  evento.preventDefault();

  const sesion = {
    date: document.getElementById("fecha").value,
    topic: document.getElementById("tema").value.trim(),
    minutes: Number(document.getElementById("minutos").value)
  };

  try {
    guardarSesionEnStorage(sesion);
    document.getElementById("save-error").textContent = "";
  } catch (error) {
    document.getElementById("save-error").textContent = "No se puede guardar la sesión. Comprueba los datos guardados y el espacio disponible.";
    return;
  }

  const form = document.getElementById("form-sesion");
  form.reset();
  document.getElementById("fecha").value = fechaLocalHoy();

  renderizar();
}

function startWeeklyClock() {
  let lastDate = fechaLocalHoy();
  function refreshWeekly() {
    lastDate = fechaLocalHoy();
    renderWeekly(lastDate);
  }
  setInterval(() => {
    if (fechaLocalHoy() !== lastDate) refreshWeekly();
  }, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshWeekly();
  });
  document.addEventListener("resume", refreshWeekly);
  window.addEventListener("pageshow", refreshWeekly);
  window.addEventListener("focus", refreshWeekly);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fecha").value = fechaLocalHoy();
  document.getElementById("form-sesion").addEventListener("submit", guardarSesion);
  document.getElementById("goal-form").addEventListener("submit", handleGoalSave);
  document.getElementById("goal-remove").addEventListener("click", handleGoalRemove);
  renderizar();
  startWeeklyClock();
});
