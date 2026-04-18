const HealthTracker = require('../models/HealthTracker');
const { AppError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');
const { ensureOptionalNumber } = require('../utils/validation');

const STEPS_GOAL = 10000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

function normalizeDateKey(value, fieldName = 'Date') {
  const dateKey = value ? String(value).trim() : toDateKey();

  if (!DATE_PATTERN.test(dateKey) || Number.isNaN(new Date(`${dateKey}T00:00:00.000Z`).getTime())) {
    throw new AppError(`${fieldName} must use YYYY-MM-DD format.`, 400);
  }

  return dateKey;
}

function getLastSevenDateKeys(endDateKey = toDateKey()) {
  return Array.from({ length: 7 }, (_item, index) => addDays(endDateKey, index - 6));
}

function percent(value, goal) {
  return goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
}

function getPlainLogs(tracker) {
  return (tracker.dailyLogs || [])
    .map((log) => (typeof log.toObject === 'function' ? log.toObject() : log))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function createEmptyDay(date) {
  return {
    date,
    walkingSteps: 0,
    runningKm: 0,
    sleepHours: 0,
    waterIntake: 0,
    notes: '',
    isLogged: false
  };
}

function normalizeDailyLog(log, date) {
  return {
    ...createEmptyDay(date || log?.date),
    ...log,
    date: date || log?.date,
    walkingSteps: Number(log?.walkingSteps || 0),
    runningKm: Number(log?.runningKm || 0),
    sleepHours: Number(log?.sleepHours || 0),
    waterIntake: Number(log?.waterIntake || 0),
    notes: String(log?.notes || ''),
    isLogged: Boolean(log)
  };
}

function getLogMap(tracker) {
  return new Map(getPlainLogs(tracker).map((log) => [log.date, normalizeDailyLog(log, log.date)]));
}

function getDayFromTracker(tracker, dateKey) {
  const todayKey = toDateKey();
  const storedLog = getLogMap(tracker).get(dateKey);

  if (storedLog) {
    return storedLog;
  }

  if (dateKey === todayKey && (tracker.steps || tracker.waterIntake)) {
    return {
      ...createEmptyDay(dateKey),
      walkingSteps: Number(tracker.steps || 0),
      waterIntake: Number(tracker.waterIntake || 0)
    };
  }

  return createEmptyDay(dateKey);
}

function getWeekFromTracker(tracker, endDateKey = toDateKey()) {
  const logs = getLogMap(tracker);

  return getLastSevenDateKeys(endDateKey).map((dateKey) => {
    const storedLog = logs.get(dateKey);
    return storedLog || getDayFromTracker(tracker, dateKey);
  });
}

function getStreak(logs, endDateKey = toDateKey()) {
  let streak = 0;
  let cursor = endDateKey;
  const loggedDates = new Set(
    logs
      .filter((log) => log.isLogged && (log.walkingSteps || log.runningKm || log.sleepHours || log.waterIntake))
      .map((log) => log.date)
  );

  while (loggedDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function enrichHealthTracker(tracker, options = {}) {
  const todayKey = toDateKey();
  const selectedDate = normalizeDateKey(options.date || todayKey);
  const endDate = normalizeDateKey(options.endDate || todayKey, 'End date');
  const waterGoal = tracker.waterGoal || 0;
  const week = getWeekFromTracker(tracker, endDate);
  const today = getDayFromTracker(tracker, todayKey);
  const selectedDay = getDayFromTracker(tracker, selectedDate);

  return {
    ...tracker.toObject(),
    waterIntake: tracker.waterIntake || today.waterIntake || 0,
    waterGoal,
    hydrationPercent: percent(tracker.waterIntake || today.waterIntake || 0, waterGoal),
    steps: tracker.steps || today.walkingSteps || 0,
    stepsGoal: STEPS_GOAL,
    stepsPercent: percent(tracker.steps || today.walkingSteps || 0, STEPS_GOAL),
    today,
    selectedDay,
    weekly: week,
    dailyLogs: getPlainLogs(tracker).map((log) => normalizeDailyLog(log, log.date)),
    streak: getStreak(getPlainLogs(tracker).map((log) => normalizeDailyLog(log, log.date)), todayKey),
    todayLogged: today.isLogged
  };
}

async function getOrCreateHealthTracker(userId) {
  let tracker = await HealthTracker.findOne({ userId });

  if (!tracker) {
    tracker = await HealthTracker.create({
      userId,
      waterIntake: 0,
      waterGoal: 2500,
      steps: 0,
      dailyLogs: []
    });
  }

  return tracker;
}

function setDailyLogValue(log, fieldName, value) {
  if (value !== undefined) {
    log[fieldName] = value;
  }
}

function upsertDailyLog(tracker, dateKey, fields) {
  const existingLog = tracker.dailyLogs.find((log) => log.date === dateKey);
  const log = existingLog || {
    date: dateKey,
    walkingSteps: 0,
    runningKm: 0,
    sleepHours: 0,
    waterIntake: 0,
    notes: ''
  };

  setDailyLogValue(log, 'walkingSteps', fields.walkingSteps);
  setDailyLogValue(log, 'runningKm', fields.runningKm);
  setDailyLogValue(log, 'sleepHours', fields.sleepHours);
  setDailyLogValue(log, 'waterIntake', fields.waterIntake);

  if (fields.notes !== undefined) {
    log.notes = String(fields.notes || '').trim().slice(0, 280);
  }

  if (!existingLog) {
    tracker.dailyLogs.push(log);
  }

  tracker.dailyLogs.sort((left, right) => left.date.localeCompare(right.date));
  return log;
}

function parseHealthPayload(body) {
  const walkingSteps = ensureOptionalNumber(
    body.walkingSteps !== undefined ? body.walkingSteps : body.steps,
    'Walking steps'
  );
  const runningKm = ensureOptionalNumber(
    body.runningKm !== undefined ? body.runningKm : body.runningDistance,
    'Running distance'
  );
  const sleepHours = ensureOptionalNumber(body.sleepHours, 'Sleep duration');
  const waterIntake = ensureOptionalNumber(body.waterIntake, 'Water intake');
  const waterGoal = ensureOptionalNumber(body.waterGoal, 'Water goal');

  return {
    date: normalizeDateKey(body.date),
    walkingSteps,
    runningKm,
    sleepHours,
    waterIntake,
    waterGoal,
    notes: body.notes
  };
}

const getHealth = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);

  res.json({
    health: enrichHealthTracker(tracker, {
      date: req.query.date,
      endDate: req.query.endDate
    })
  });
});

const updateHealth = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);
  const payload = parseHealthPayload(req.body);
  const updatedLog = upsertDailyLog(tracker, payload.date, payload);
  const todayKey = toDateKey();

  if (payload.waterGoal !== undefined) {
    tracker.waterGoal = payload.waterGoal;
  }

  if (payload.date === todayKey) {
    tracker.waterIntake = updatedLog.waterIntake;
    tracker.steps = updatedLog.walkingSteps;
  }

  await tracker.save();

  res.json({
    message: 'Health tracker updated.',
    health: enrichHealthTracker(tracker, { date: payload.date }),
    dailyLog: normalizeDailyLog(updatedLog, payload.date)
  });
});

module.exports = {
  getHealth,
  updateHealth
};
