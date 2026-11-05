function buildDays(today) {
  const parts = today.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2], 12);
  date.setDate(date.getDate() - 83);

  const days = [];
  for (let index = 0; index < 84; index++) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    days.push(`${year}-${month}-${day}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(2000, month - 1, day, 12);
  date.setFullYear(year);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function classifyMinutes(minutes) {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

function buildHeatMap(sessions, today) {
  const days = buildDays(today).map(date => ({ date, minutes: 0, incomplete: false, level: 0 }));
  const byDate = new Map(days.map(day => [day.date, day]));
  let hasInvalid = false;

  for (const session of sessions) {
    const date = session && (session.date || session.fecha);
    const minutes = session && (session.minutes ?? session.minutos);
    if (!isValidDate(date)) {
      hasInvalid = true;
      continue;
    }
    const day = byDate.get(date);
    if (!Number.isSafeInteger(minutes) || minutes <= 0) {
      hasInvalid = true;
      if (day) day.incomplete = true;
      continue;
    }
    if (day && !day.incomplete) {
      if (!Number.isSafeInteger(day.minutes + minutes)) {
        day.incomplete = true;
        hasInvalid = true;
      } else {
        day.minutes += minutes;
      }
    }
  }

  for (const day of days) {
    if (day.incomplete) {
      day.minutes = null;
      day.level = null;
    } else {
      day.level = classifyMinutes(day.minutes);
    }
  }
  return { days, hasInvalid };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildDays, buildHeatMap, classifyMinutes };
}
