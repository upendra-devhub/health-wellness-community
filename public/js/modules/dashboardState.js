const DAY_MS = 24 * 60 * 60 * 1000;

export function getDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setTime(date.getTime() + (amount * DAY_MS));
  return getDateKey(date);
}

export function getLastSevenDateKeys(endDateKey = getDateKey()) {
  return Array.from({ length: 7 }, (_item, index) => addDays(endDateKey, index - 6));
}

export function formatDayHeading(dateKey) {
  const todayKey = getDateKey();
  const yesterdayKey = addDays(todayKey, -1);

  if (dateKey === todayKey) {
    return 'Today';
  }

  if (dateKey === yesterdayKey) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'long'
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function formatShortDay(dateKey) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short'
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function formatLongDate(dateKey) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function normalizeDay(day = {}, dateKey = getDateKey()) {
  return {
    date: day.date || dateKey,
    walkingSteps: Number(day.walkingSteps ?? day.steps ?? 0),
    runningKm: Number(day.runningKm ?? day.runningDistance ?? 0),
    sleepHours: Number(day.sleepHours ?? 0),
    waterIntake: Number(day.waterIntake ?? 0),
    notes: String(day.notes || ''),
    isLogged: Boolean(day.isLogged)
  };
}

export function getWeeklyDays(health, selectedDay = getDateKey()) {
  const endDate = getLastSevenDateKeys().includes(selectedDay) ? getDateKey() : selectedDay;
  const dayMap = new Map((health?.weekly || []).map((day) => [day.date, normalizeDay(day, day.date)]));
  const logMap = new Map((health?.dailyLogs || []).map((day) => [day.date, normalizeDay(day, day.date)]));

  return getLastSevenDateKeys(endDate).map((dateKey) => {
    return dayMap.get(dateKey) || logMap.get(dateKey) || normalizeDay({}, dateKey);
  });
}

export function getDayByDate(health, dateKey) {
  const allDays = [
    ...(health?.weekly || []),
    ...(health?.dailyLogs || []),
    health?.today,
    health?.selectedDay
  ].filter(Boolean);

  const foundDay = allDays.find((day) => day.date === dateKey);
  return normalizeDay(foundDay, dateKey);
}

export function getPreviousDay(health, dateKey) {
  return getDayByDate(health, addDays(dateKey, -1));
}

export function getDayScore(day) {
  const stepsScore = Math.min(100, (day.walkingSteps / 10000) * 100);
  const runScore = Math.min(100, (day.runningKm / 8) * 100);
  const sleepScore = Math.min(100, (day.sleepHours / 8) * 100);
  return Math.round((stepsScore + runScore + sleepScore) / 3);
}

export function getMetricComparison(currentValue, previousValue, unit = '') {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);
  const delta = current - previous;

  if (delta === 0) {
    return {
      tone: 'same',
      label: 'Same as previous day'
    };
  }

  const formatter = Math.abs(delta) >= 10 || unit === 'steps'
    ? new Intl.NumberFormat('en')
    : new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

  return {
    tone: delta > 0 ? 'up' : 'down',
    label: `${delta > 0 ? '+' : '-'}${formatter.format(Math.abs(delta))}${unit && unit !== 'steps' ? ` ${unit}` : ''} vs previous day`
  };
}
