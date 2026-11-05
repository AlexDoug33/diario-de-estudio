function getWeekBounds(today) {
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);

  function formatDate(value) {
    const monthText = String(value.getMonth() + 1).padStart(2, '0');
    const dayText = String(value.getDate()).padStart(2, '0');
    return `${value.getFullYear()}-${monthText}-${dayText}`;
  }

  const start = formatDate(date);
  date.setDate(date.getDate() + 6);
  return { start, end: formatDate(date) };
}

function calculateWeeklyTotal(sessions, today) {
  const { start, end } = getWeekBounds(today);
  let total = 0;
  let incomplete = false;
  let hasInvalidDate = false;

  for (const session of sessions) {
    const date = session && (session.date || session.fecha);
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      hasInvalidDate = true;
      continue;
    }
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(2000, month - 1, day, 12);
    parsed.setFullYear(year);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      hasInvalidDate = true;
      continue;
    }
    if (date < start || date > end) continue;

    const minutes = Object.prototype.hasOwnProperty.call(session, 'minutes') ? session.minutes : session.minutos;
    if (!Number.isSafeInteger(minutes) || minutes <= 0 || !Number.isSafeInteger(total + minutes)) {
      incomplete = true;
    } else if (!incomplete) {
      total += minutes;
    }
  }

  if (incomplete || hasInvalidDate) return { total: incomplete ? null : total, incomplete, hasInvalidDate };
  return total;
}

function parseGoal(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const goal = trimmed.replace(/^0+/, '');
  return goal || null;
}

function calculateProgress(minutes, goal) {
  const exactGoal = BigInt(goal);
  if (BigInt(minutes) >= exactGoal) return 1;
  const leadingDigits = goal.slice(0, 16);
  const scaledMinutes = Number(`${minutes}e-${goal.length - 1}`);
  const scaledGoal = Number(`${leadingDigits}e-${leadingDigits.length - 1}`);
  return scaledMinutes / scaledGoal;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getWeekBounds, calculateWeeklyTotal, parseGoal, calculateProgress };
}
