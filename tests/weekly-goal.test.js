const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { getWeekBounds, calculateWeeklyTotal, parseGoal, calculateProgress } = require('../weekly-goal.js');

test('lunes y domingo pertenecen a la misma semana local', () => {
  assert.deepEqual(getWeekBounds('2026-11-02'), { start: '2026-11-02', end: '2026-11-08' });
  assert.deepEqual(getWeekBounds('2026-11-08'), { start: '2026-11-02', end: '2026-11-08' });
});

test('suma sesiones de la semana, incluso futuras y repetidas, sin modificar los datos', () => {
  const sessions = [
    { date: '2026-11-01', minutes: 100 },
    { date: '2026-11-02', minutes: 10 },
    { date: '2026-11-03', minutes: 20 },
    { date: '2026-11-03', minutes: 30 },
    { date: '2026-11-08', minutes: 40 },
    { date: '2026-11-09', minutes: 200 }
  ];
  const original = structuredClone(sessions);
  assert.equal(calculateWeeklyTotal(sessions, '2026-11-03'), 100);
  assert.deepEqual(sessions, original);
  assert.equal(calculateWeeklyTotal([], '2026-11-03'), 0);
  assert.equal(calculateWeeklyTotal([{ date: '2026-11-09', minutes: 5 }], '2026-11-03'), 0);
});

test('los límites cruzan mes, año y día bisiesto', () => {
  assert.deepEqual(getWeekBounds('2026-04-01'), { start: '2026-03-30', end: '2026-04-05' });
  assert.deepEqual(getWeekBounds('2026-01-01'), { start: '2025-12-29', end: '2026-01-04' });
  assert.deepEqual(getWeekBounds('2024-02-29'), { start: '2024-02-26', end: '2024-03-03' });
});

test('la semana local es estable en zonas horarias y cambios de hora', () => {
  const script = `const {getWeekBounds, calculateWeeklyTotal} = require('./weekly-goal.js');
    const assert = require('node:assert/strict');
    for (const [today, start, end] of [['2026-03-29','2026-03-23','2026-03-29'], ['2026-10-25','2026-10-19','2026-10-25']]) {
      assert.deepEqual(getWeekBounds(today), {start, end});
      assert.equal(calculateWeeklyTotal([{date: start, minutes: 7}, {date: end, minutes: 9}], today), 16);
    }
    const local = new Date(2026, 2, 29, 0, 30);
    const today = [local.getFullYear(), String(local.getMonth() + 1).padStart(2, '0'), String(local.getDate()).padStart(2, '0')].join('-');
    assert.deepEqual(getWeekBounds(today), {start: '2026-03-23', end: '2026-03-29'});`;
  for (const TZ of ['Europe/Madrid', 'America/New_York', 'Pacific/Kiritimati', 'America/Adak']) {
    execFileSync(process.execPath, ['-e', script], { cwd: require('node:path').join(__dirname, '..'), env: { ...process.env, TZ } });
  }
});

test('suma los formatos actual y antiguo sin modificar los registros', () => {
  const sessions = [{ fecha: '2026-11-02', minutos: 15 }, { date: '2026-11-03', minutes: 20 }];
  const original = structuredClone(sessions);
  assert.equal(calculateWeeklyTotal(sessions, '2026-11-03'), 35);
  assert.deepEqual(sessions, original);
});

test('los minutos inválidos de la semana producen un total incompleto', () => {
  for (const minutes of ['20', 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null]) {
    assert.deepEqual(calculateWeeklyTotal([{ date: '2026-11-02', minutes }], '2026-11-03'),
      { total: null, incomplete: true, hasInvalidDate: false });
  }
  assert.deepEqual(calculateWeeklyTotal([{ date: '2026-11-02', minutes: 0, minutos: 30 }], '2026-11-03'),
    { total: null, incomplete: true, hasInvalidDate: false });
  assert.equal(calculateWeeklyTotal([{ date: '2026-11-01', minutes: '20' }], '2026-11-03'), 0);
});

test('la suma insegura es incompleta y los datos originales se conservan', () => {
  const sessions = [{ date: '2026-11-02', minutes: Number.MAX_SAFE_INTEGER }, { fecha: '2026-11-03', minutos: 1 }];
  const original = structuredClone(sessions);
  assert.deepEqual(calculateWeeklyTotal(sessions, '2026-11-03'),
    { total: null, incomplete: true, hasInvalidDate: false });
  assert.deepEqual(sessions, original);
});

test('una fecha inválida se excluye y produce un aviso sin alterar el total atribuible', () => {
  const sessions = [{ date: '2026-02-30', minutes: 50 }, { fecha: 'no válida', minutos: 2 }, { date: '2026-11-02', minutes: 10 }];
  const original = structuredClone(sessions);
  assert.deepEqual(calculateWeeklyTotal(sessions, '2026-11-03'),
    { total: 10, incomplete: false, hasInvalidDate: true });
  assert.deepEqual(sessions, original);
});

test('acepta objetivos positivos exactos y elimina ceros iniciales', () => {
  assert.equal(parseGoal('00025'), '25');
  assert.equal(parseGoal(parseGoal('00025')), '25');
  const huge = '12345678901234567890'.repeat(30);
  assert.equal(parseGoal('000' + huge), huge);
});

test('solo elimina espacios, tabulaciones y saltos de línea de los extremos', () => {
  assert.equal(parseGoal(' \t\r\n00025\n\r\t '), '25');
  for (const input of ['2 5', '2\t5', '2\n5', '2\r5', '\u00a025', '25\u00a0']) {
    assert.equal(parseGoal(input), null);
  }
});

test('rechaza ceros, entradas vacías y formatos no admitidos', () => {
  for (const input of ['', ' \t\n', '0', '000', '-25', '+25', '2.5', '2,5', '1e3', '25x']) {
    assert.equal(parseGoal(input), null);
  }
});

test('calcula la proporción de progreso y la limita al objetivo', () => {
  assert.equal(calculateProgress(0, '100'), 0);
  assert.equal(calculateProgress(50, '100'), 0.5);
  assert.equal(calculateProgress(100, '100'), 1);
  assert.equal(calculateProgress(150, '100'), 1);
});

test('compara objetivos enormes exactamente y calcula una proporción finita', () => {
  assert.equal(calculateProgress(Number.MAX_SAFE_INTEGER, '9007199254740992') < 1, true);
  assert.equal(calculateProgress(50, '1' + '0'.repeat(301)), 5e-300);
});

function persistenceContext(initial = {}, failures = {}) {
  const vm = require('node:vm');
  const fs = require('node:fs');
  const data = { ...initial };
  const localStorage = {
    getItem(key) { if (failures.get && failures.get.includes(key)) throw Error('lectura'); return data[key] ?? null; },
    setItem(key, value) { if (failures.set) throw Error('escritura'); data[key] = value; },
    removeItem(key) { if (failures.remove) throw Error('eliminación'); delete data[key]; }
  };
  const context = vm.createContext({ localStorage, parseGoal, document: { addEventListener() {} } });
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8'), context);
  return { context, data };
}

test('distingue objetivo ausente, válido, corrupto e inaccesible sin escribir', () => {
  const key = 'diario-estudio-objetivo-semanal';
  for (const [value, status, goal] of [[undefined, 'absent', null], ['00025', 'valid', '25'], ['no válido', 'corrupt', null]]) {
    const initial = value === undefined ? {} : { [key]: value };
    const { context, data } = persistenceContext(initial);
    const result = context.readWeeklyState();
    assert.equal(result.goal.status, status);
    assert.equal(result.goal.value, goal);
    assert.deepEqual(data, initial);
  }
  const { context } = persistenceContext({}, { get: [key] });
  assert.equal(context.readWeeklyState().goal.status, 'inaccessible');
});

test('guardar, cambiar y eliminar el objetivo conserva los bytes de sesiones', () => {
  const sessions = ' [ { "fecha":"2026-11-02", "minutos":3 } ] ';
  const key = 'diario-estudio-objetivo-semanal';
  const { context, data } = persistenceContext({ 'diario-estudio-sesiones': sessions });
  const huge = '9'.repeat(80);
  assert.equal(context.saveWeeklyGoal('00025').ok, true);
  assert.equal(data[key], '25');
  assert.equal(context.readWeeklyState().goal.value, '25');
  assert.equal(context.saveWeeklyGoal(huge).ok, true);
  assert.equal(context.readWeeklyState().goal.value, huge);
  assert.equal(context.removeWeeklyGoal().ok, true);
  assert.equal(context.readWeeklyState().goal.status, 'absent');
  assert.equal(data['diario-estudio-sesiones'], sessions);
});

test('un objetivo corrupto solo se sustituye o elimina mediante acción explícita', () => {
  const key = 'diario-estudio-objetivo-semanal';
  for (const action of ['save', 'remove']) {
    const { context, data } = persistenceContext({ [key]: 'corrupto', 'diario-estudio-sesiones': '[]' });
    assert.equal(context.readWeeklyState().goal.status, 'corrupt');
    assert.equal(context.saveWeeklyGoal('0').ok, false);
    assert.equal(data[key], 'corrupto');
    assert.equal(action === 'save' ? context.saveWeeklyGoal('100').ok : context.removeWeeklyGoal().ok, true);
    assert.equal(data[key], action === 'save' ? '100' : undefined);
    assert.equal(data['diario-estudio-sesiones'], '[]');
  }
});

test('fallos de escritura y eliminación no se presentan como éxito ni alteran datos', () => {
  const key = 'diario-estudio-objetivo-semanal';
  for (const failures of [{ set: true }, { remove: true }]) {
    const { context, data } = persistenceContext({ [key]: '20', 'diario-estudio-sesiones': '[]' }, failures);
    const result = failures.set ? context.saveWeeklyGoal('30') : context.removeWeeklyGoal();
    assert.equal(result.ok, false);
    assert.equal(result.error, 'storage');
    assert.equal(data[key], '20');
    assert.equal(data['diario-estudio-sesiones'], '[]');
  }
});

test('lecturas de sesiones y objetivo fallan independientemente y conservan ambos errores', () => {
  const sessionKey = 'diario-estudio-sesiones';
  const goalKey = 'diario-estudio-objetivo-semanal';
  const cases = [
    [{ [sessionKey]: 'mal', [goalKey]: 'mal' }, {}, 'inaccessible', 'corrupt'],
    [{ [sessionKey]: '[]', [goalKey]: '25' }, { get: [sessionKey, goalKey] }, 'inaccessible', 'inaccessible'],
    [{ [sessionKey]: '[]', [goalKey]: '25' }, { get: [sessionKey] }, 'inaccessible', 'valid'],
    [{ [sessionKey]: '[]', [goalKey]: '25' }, { get: [goalKey] }, 'valid', 'inaccessible']
  ];
  for (const [initial, failures, sessionsStatus, goalStatus] of cases) {
    const { context, data } = persistenceContext(initial, failures);
    const state = context.readWeeklyState();
    assert.equal(state.sessions.status, sessionsStatus);
    assert.equal(state.goal.status, goalStatus);
    assert.deepEqual(data, initial);
  }
});

function viewContext(initial = {}, failures = {}) {
  const { context, data } = persistenceContext(initial, failures);
  const elements = {};
  for (const id of ['minutos-semana', 'weekly-session-warning', 'goal-status', 'goal-progress', 'goal-progress-text', 'goal-bar', 'goal-input', 'goal-action-error', 'goal-remove']) {
    elements[id] = { textContent: '', value: '', hidden: false, setAttribute(name, value) { this[name] = String(value); } };
  }
  context.document.getElementById = (id) => elements[id];
  context.calculateWeeklyTotal = calculateWeeklyTotal;
  context.calculateProgress = calculateProgress;
  return { context, data, elements };
}

test('la vista muestra ausencia, total natural, objetivo exacto y progreso limitado', () => {
  const sessions = JSON.stringify([{ date: '2026-11-08', minutes: 50 }]);
  const { context, data, elements } = viewContext({ 'diario-estudio-sesiones': sessions });
  context.renderWeekly('2026-11-03');
  assert.equal(elements['minutos-semana'].textContent, '50 min');
  assert.match(elements['goal-status'].textContent, /Aún no tienes un objetivo semanal/);
  assert.equal(elements['goal-progress'].hidden, true);
  data['diario-estudio-objetivo-semanal'] = '000100';
  context.renderWeekly('2026-11-03');
  assert.equal(elements['goal-progress-text'].textContent, '50 de 100 minutos');
  assert.equal(elements['goal-bar'].value, 50);
  data['diario-estudio-objetivo-semanal'] = '25';
  context.renderWeekly('2026-11-03');
  assert.equal(elements['goal-bar'].value, 100);
  assert.equal(elements['goal-progress-text'].textContent, '50 de 25 minutos');
});

test('incompleto o inaccesible oculta barra previa y mantiene avisos independientes', () => {
  const { context, data, elements } = viewContext({ 'diario-estudio-sesiones': '[]', 'diario-estudio-objetivo-semanal': '25' });
  context.renderWeekly('2026-11-03');
  assert.equal(elements['goal-progress'].hidden, false);
  data['diario-estudio-sesiones'] = JSON.stringify([{ date: '2026-11-03', minutes: 0 }, { date: 'mal', minutes: 3 }]);
  data['diario-estudio-objetivo-semanal'] = 'mal';
  context.renderWeekly('2026-11-03');
  assert.equal(elements['goal-progress'].hidden, true);
  assert.match(elements['minutos-semana'].textContent, /[Tt]otal incompleto/);
  assert.match(elements['weekly-session-warning'].textContent, /interpretar/);
  assert.match(elements['goal-status'].textContent, /error|corrupt/i);
  data['diario-estudio-sesiones'] = 'mal';
  context.renderWeekly('2026-11-03');
  assert.match(elements['minutos-semana'].textContent, /no se puede/i);
  assert.match(elements['goal-status'].textContent, /error|corrupt/i);
});

test('acciones del objetivo actualizan sin recarga y notifican errores sin falso éxito', () => {
  const { context, data, elements } = viewContext();
  elements['goal-input'].value = '00025';
  context.handleGoalSave({ preventDefault() {} });
  assert.equal(data['diario-estudio-objetivo-semanal'], '25');
  assert.match(elements['goal-progress-text'].textContent, /25 minutos/);
  elements['goal-input'].value = '0';
  context.handleGoalSave({ preventDefault() {} });
  assert.match(elements['goal-action-error'].textContent, /entero positivo/);
  assert.equal(data['diario-estudio-objetivo-semanal'], '25');
  context.handleGoalRemove();
  assert.equal(data['diario-estudio-objetivo-semanal'], undefined);
  assert.match(elements['goal-status'].textContent, /Aún no tienes/);
  const failed = viewContext({ 'diario-estudio-objetivo-semanal': '25' }, { set: true, remove: true });
  failed.elements['goal-input'].value = '50';
  failed.context.handleGoalSave({ preventDefault() {} });
  assert.match(failed.elements['goal-action-error'].textContent, /no se puede/i);
  failed.context.handleGoalRemove();
  assert.match(failed.elements['goal-action-error'].textContent, /no se puede/i);
  assert.equal(failed.data['diario-estudio-objetivo-semanal'], '25');
});

test('el control del objetivo conserva saltos para validarlos y no altera datos al rechazar', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
  assert.match(html, /<textarea\b[^>]*\bid="goal-input"[^>]*><\/textarea>/i);
  const goalKey = 'diario-estudio-objetivo-semanal';
  const sessions = ' [ { "date":"2026-11-03", "minutes":10 } ] ';
  const { context, data, elements } = viewContext({ [goalKey]: '30', 'diario-estudio-sesiones': sessions });
  for (const value of ['1\n2', '1\t2', '1 2']) {
    elements['goal-input'].value = value;
    context.handleGoalSave({ preventDefault() {} });
    assert.match(elements['goal-action-error'].textContent, /entero positivo/);
    assert.equal(elements['goal-input'].value, value);
    assert.equal(data[goalKey], '30');
    assert.equal(data['diario-estudio-sesiones'], sessions);
  }
  elements['goal-input'].value = ' \t\n00025\n\t ';
  context.handleGoalSave({ preventDefault() {} });
  assert.equal(data[goalKey], '25');
  assert.equal(data['diario-estudio-sesiones'], sessions);
});

function clockContext() {
  const sessions = JSON.stringify([{ date: '2026-11-08', minutes: 50 }, { date: '2026-11-09', minutes: 20 }]);
  const view = viewContext({ 'diario-estudio-sesiones': sessions, 'diario-estudio-objetivo-semanal': '100' });
  let now = new Date(2026, 10, 7, 23, 59, 30);
  const documentEvents = {};
  const windowEvents = {};
  const timers = [];
  view.context.Date = class extends Date { constructor(...args) { super(...(args.length ? args : [now.getTime()])); } };
  view.context.document.addEventListener = (name, fn) => { documentEvents[name] = fn; };
  view.context.window = { addEventListener(name, fn) { windowEvents[name] = fn; } };
  view.context.setInterval = (fn, delay) => { timers.push({ fn, delay }); };
  view.context.document.visibilityState = 'visible';
  view.context.document.getElementById = (id) => view.elements[id] || { value: '', addEventListener() {} };
  view.elements['goal-remove'].addEventListener = () => {};
  view.context.renderizar = () => view.context.renderWeekly(view.context.fechaLocalHoy());
  // Registrar el arranque de nuevo con los dobles de eventos instalados.
  require('node:vm').runInContext(require('node:fs').readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8').slice(require('node:fs').readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8').indexOf('document.addEventListener("DOMContentLoaded"')), view.context);
  documentEvents.DOMContentLoaded();
  return { ...view, timers, documentEvents, windowEvents, setNow(value) { now = value; } };
}

test('un único reloj actualiza día y semana local dentro de un minuto', () => {
  const clock = clockContext();
  assert.equal(clock.timers.length, 1);
  assert.ok(clock.timers[0].delay <= 60000);
  assert.equal(clock.elements['goal-progress-text'].textContent, '50 de 100 minutos');
  clock.setNow(new Date(2026, 10, 8, 0, 0, 30));
  clock.timers[0].fn();
  assert.equal(clock.elements['minutos-semana'].textContent, '50 min');
  clock.setNow(new Date(2026, 10, 9, 0, 0, 30));
  clock.timers[0].fn();
  assert.equal(clock.elements['minutos-semana'].textContent, '20 min');
  assert.equal(clock.elements['goal-progress-text'].textContent, '20 de 100 minutos');
  assert.equal(clock.elements['goal-bar'].value, 20);
});

test('reactivaciones tras suspensión recalculan sin crear relojes adicionales', () => {
  const clock = clockContext();
  for (const [event, target] of [['visibilitychange', 'documentEvents'], ['pageshow', 'windowEvents'], ['focus', 'windowEvents'], ['resume', 'documentEvents']]) {
    clock.data['diario-estudio-sesiones'] = JSON.stringify([{ date: '2026-11-09', minutes: 30 }]);
    clock.setNow(new Date(2026, 10, 9, 0, 30));
    clock.elements['minutos-semana'].textContent = 'antiguo';
    clock[target][event]();
    assert.equal(clock.elements['minutos-semana'].textContent, '30 min', event);
    assert.equal(clock.elements['goal-progress-text'].textContent, '30 de 100 minutos');
    assert.equal(clock.timers.length, 1);
  }
});

test('apertura y recarga conservan claves y formatos, y priorizan la clave actual', () => {
  const currentKey = 'diario-estudio-sesiones';
  const oldKey = 'diario-estudio.sesiones';
  const goalKey = 'diario-estudio-objetivo-semanal';
  const legacy = ' [ { "fecha":"2026-11-02", "tema":"Antigua", "minutos":15 } ] ';
  const current = ' [ { "fecha":"2026-11-02", "minutos":15 }, { "date":"2026-11-03", "minutes":20 }, { "date":"2026-11-03", "minutes":5 } ] ';
  for (const initial of [{ [oldKey]: legacy, [goalKey]: '100' }, { [oldKey]: legacy, [currentKey]: current, [goalKey]: '100' }]) {
    const opened = viewContext(initial);
    opened.context.renderWeekly('2026-11-03');
    const expected = initial[currentKey] ? '40 min' : '15 min';
    assert.equal(opened.elements['minutos-semana'].textContent, expected);
    assert.match(opened.elements['goal-status'].textContent, /100 minutos/);
    const reloaded = viewContext(opened.data);
    reloaded.context.renderWeekly('2026-11-03');
    assert.equal(reloaded.elements['minutos-semana'].textContent, expected);
    assert.match(reloaded.elements['goal-status'].textContent, /100 minutos/);
    assert.deepEqual(reloaded.data, initial);
  }
});

test('fechas futuras suman solo en la semana, sin cambiar rachas ni mapa', () => {
  const { buildHeatMap } = require('../heat-map.js');
  const today = '2026-11-03';
  const past = [{ fecha: '2026-11-02', minutos: 10 }, { date: today, minutes: 20 }];
  const future = [{ date: '2026-11-08', minutes: 40 }, { date: '2026-11-09', minutes: 100 }];
  const all = past.concat(future);
  const original = structuredClone(all);
  const { context, elements } = viewContext({ 'diario-estudio-sesiones': JSON.stringify(all), 'diario-estudio-objetivo-semanal': '100' });
  context.fechaLocalHoy = () => today;
  context.renderWeekly(today);
  assert.equal(elements['minutos-semana'].textContent, '70 min');
  assert.equal(elements['goal-progress-text'].textContent, '70 de 100 minutos');
  assert.equal(context.calcularRacha(context.obtenerSesiones(all)), context.calcularRacha(context.obtenerSesiones(past)));
  assert.equal(context.calcularMejorRacha(context.obtenerSesiones(all)), context.calcularMejorRacha(context.obtenerSesiones(past)));
  assert.equal(context.calcularRacha(context.obtenerSesiones(all)), 2);
  assert.deepEqual(buildHeatMap(all, today), buildHeatMap(past, today));
  assert.deepEqual(all, original);
});

test('recuperar objetivo corrupto conserva ambas claves de sesiones exactamente', () => {
  const currentKey = 'diario-estudio-sesiones';
  const oldKey = 'diario-estudio.sesiones';
  const goalKey = 'diario-estudio-objetivo-semanal';
  const initial = { [currentKey]: ' [ { "date":"2026-11-03", "minutes":0, "minutos":30 } ] ', [oldKey]: ' [ { "fecha":"2026-11-02", "minutos":15 } ] ', [goalKey]: 'corrupto' };
  for (const action of ['save', 'remove']) {
    const { context, data, elements } = viewContext(initial);
    context.renderWeekly('2026-11-03');
    assert.equal(elements['minutos-semana'].textContent, 'Total incompleto');
    if (action === 'save') { elements['goal-input'].value = '50'; context.handleGoalSave({ preventDefault() {} }); }
    else context.handleGoalRemove();
    assert.equal(data[currentKey], initial[currentKey]);
    assert.equal(data[oldKey], initial[oldKey]);
    assert.equal(data[goalKey], action === 'save' ? '50' : undefined);
  }
});
