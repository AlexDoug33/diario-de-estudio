const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { buildDays, buildHeatMap, classifyMinutes } = require("../heat-map.js");

test("genera 84 fechas únicas desde hace 83 días hasta hoy", () => {
  const days = buildDays("2026-11-02");
  assert.equal(days.length, 84);
  assert.equal(new Set(days).size, 84);
  assert.equal(days[0], "2026-08-11");
  assert.equal(days[83], "2026-11-02");
  assert.deepEqual([...days].sort(), days);
});

test("incluye el 29 de febrero en un año bisiesto", () => {
  const days = buildDays("2024-03-01");
  assert.deepEqual(days.slice(-3), ["2024-02-28", "2024-02-29", "2024-03-01"]);
});

test("cruza el cambio de año sin saltos", () => {
  const days = buildDays("2026-01-01");
  assert.deepEqual(days.slice(-3), ["2025-12-30", "2025-12-31", "2026-01-01"]);
});

test("mantiene días consecutivos en cambios de hora locales", () => {
  const original = process.env.TZ;
  process.env.TZ = "Europe/Madrid";
  try {
    assert.deepEqual(buildDays("2026-03-30").slice(-3), ["2026-03-28", "2026-03-29", "2026-03-30"]);
    assert.deepEqual(buildDays("2026-10-26").slice(-3), ["2026-10-24", "2026-10-25", "2026-10-26"]);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("usa la fecha local recibida incluso en zonas alejadas de UTC", () => {
  const original = process.env.TZ;
  try {
    for (const zone of ["Pacific/Kiritimati", "America/Los_Angeles"]) {
      process.env.TZ = zone;
      const days = buildDays("2026-11-02");
      assert.equal(days[0], "2026-08-11");
      assert.equal(days[83], "2026-11-02");
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("clasifica todos los límites de intensidad", () => {
  for (const [minutes, level] of [[0, 0], [1, 1], [29, 1], [30, 2], [59, 2], [60, 3], [119, 3], [120, 4]]) {
    assert.equal(classifyMinutes(minutes), level);
  }
});

test("suma sesiones del período, incluidas duplicadas y antiguas, sin modificar datos", () => {
  const sessions = [{ date: "2026-11-02", minutes: 20 }, { date: "2026-11-02", minutes: 20 }, { fecha: "2026-11-02", minutos: 10 }, { date: "2026-11-03", minutes: 50 }, { date: "2026-08-10", minutes: 30 }];
  const original = structuredClone(sessions);
  const result = buildHeatMap(sessions, "2026-11-02");
  assert.equal(result.days.length, 84);
  assert.equal(result.days[83].minutes, 50);
  assert.equal(result.days[83].level, 2);
  assert.equal(result.days[0].minutes, 0);
  assert.equal(result.hasInvalid, false);
  assert.deepEqual(sessions, original);
});

test("señala registros inválidos y días incompletos sin calcular un total falso", () => {
  const result = buildHeatMap([{ date: "2026-11-02", minutes: 12 }, { date: "2026-11-02", minutes: "5" }, { date: "2026-02-30", minutes: 5 }, null, { date: "2020-01-01", minutes: -1 }], "2026-11-02");
  assert.equal(result.hasInvalid, true);
  assert.equal(result.days[83].incomplete, true);
  assert.equal(result.days[83].minutes, null);
  assert.equal(result.days[83].level, null);
  assert.equal(result.days[82].minutes, 0);
});

test("marca incompleto un día con suma numéricamente insegura", () => {
  const result = buildHeatMap([{ date: "2026-11-02", minutes: Number.MAX_SAFE_INTEGER }, { date: "2026-11-02", minutes: 1 }], "2026-11-02");
  assert.equal(result.hasInvalid, true);
  assert.equal(result.days[83].incomplete, true);
  assert.equal(result.days[83].minutes, null);
});

test("un diario vacío produce 84 días completos sin aviso", () => {
  const result = buildHeatMap([], "2026-11-02");
  assert.equal(result.hasInvalid, false);
  assert.equal(result.days.length, 84);
  assert.ok(result.days.every(day => day.minutes === 0 && day.level === 0 && !day.incomplete));
});

test("una sesión con minutos en texto sigue visible y el mapa la señala incompleta", () => {
  function element() {
    return { textContent: "", children: [], className: "", hidden: false,
      appendChild(child) { this.children.push(child); },
      replaceChildren() { this.children = []; },
      setAttribute() {}, addEventListener() {},
      set innerHTML(value) { this.children = []; } };
  }
  const elements = new Map();
  const document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    querySelector() { return element(); }, createElement: element, addEventListener() {}
  };
  const session = { date: "2026-11-03", topic: "Sesión anterior", minutes: "25" };
  const stored = JSON.stringify([session]);
  const context = vm.createContext({ document, localStorage: { getItem(key) { return key === "diario-estudio-sesiones" ? stored : null; } } });
  vm.runInContext(fs.readFileSync("heat-map.js", "utf8"), context);
  vm.runInContext(fs.readFileSync("weekly-goal.js", "utf8"), context);
  vm.runInContext(fs.readFileSync("app.js", "utf8"), context);
  vm.runInContext('fechaLocalHoy = () => "2026-11-03"; renderizar()', context);
  const list = elements.get("lista-sesiones").children;
  assert.equal(list.length, 1);
  assert.equal(list[0].children[1].textContent, "Sesión anterior");
  assert.equal(list[0].children[2].textContent, "25 min");
  assert.match(elements.get("heat-error").textContent, /no se han podido interpretar/);
  assert.equal(elements.get("heat-grid").children[83].textContent, "?");
  assert.equal(context.localStorage.getItem("diario-estudio-sesiones"), stored);
});
