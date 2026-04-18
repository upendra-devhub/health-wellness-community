const HealthTracker = require('../models/HealthTracker');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');
const { ensureOptionalNumber } = require('../utils/validation');

const STEPS_GOAL = 10000;

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getDateKeyOffset(daysOffset = 0) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysOffset);

  return getDateKey(date);
}

function ensureDateKey(value) {
  if (value === undefined || value === null || value === '') {
    return getDateKeyOffset();
  }

  const dateKey = String(value).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || Number.isNaN(new Date(`${dateKey}T00:00:00.000Z`).getTime())) {
    throw new AppError('Log date is invalid.', 400);
  }

  return dateKey;
}

function toActivityDay(dateKey, log) {
  return {
    date: dateKey,
    walking: log?.walking || 0,
    running: log?.running || 0,
    sleep: log?.sleep || 0,
    hasData: Boolean(log)
  };
}

function findDailyLog(tracker, dateKey) {
  return tracker.dailyLogs?.find((log) => log.date === dateKey) || null;
}

function enrichHealthTracker(tracker) {
  const waterGoal = tracker.waterGoal || 0;
  const hydrationPercent = waterGoal ? Math.min(100, Math.round((tracker.waterIntake / waterGoal) * 100)) : 0;
  const stepsGoal = STEPS_GOAL;
  const stepsPercent = Math.min(100, Math.round((tracker.steps / stepsGoal) * 100));

  return {
    ...tracker.toObject(),
    hydrationPercent,
    stepsGoal,
    stepsPercent
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
      running: 0,
      sleep: 0,
      dailyLogs: []
    });
  }

  return tracker;
}

const getHealth = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);

  res.json({
    health: enrichHealthTracker(tracker)
  });
});

const getTodayHealth = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);
  const todayKey = getDateKeyOffset();

  res.json({
    today: toActivityDay(todayKey, findDailyLog(tracker, todayKey))
  });
});

const getWeeklyHealth = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);
  const logsByDate = new Map((tracker.dailyLogs || []).map((log) => [log.date, log]));
  const weeklyData = Array.from({ length: 7 }, (_item, index) => {
    const dateKey = getDateKeyOffset(index - 6);
    return toActivityDay(dateKey, logsByDate.get(dateKey));
  });

  res.json({
    weeklyData,
    selectedDay: getDateKeyOffset()
  });
});

const updateHealth = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);

  const waterIntake = ensureOptionalNumber(req.body.waterIntake, 'Water intake');
  const waterGoal = ensureOptionalNumber(req.body.waterGoal, 'Water goal');
  const steps = ensureOptionalNumber(req.body.steps, 'Steps');
  const running = ensureOptionalNumber(req.body.running, 'Running');
  const sleep = ensureOptionalNumber(req.body.sleep, 'Sleep');

  if (waterIntake !== undefined) {
    tracker.waterIntake = waterIntake;
  }

  if (waterGoal !== undefined) {
    tracker.waterGoal = waterGoal;
  }

  if (steps !== undefined) {
    tracker.steps = steps;
  }

  if (running !== undefined) {
    tracker.running = running;
  }

  if (sleep !== undefined) {
    tracker.sleep = sleep;
  }

  await tracker.save();

  res.json({
    message: 'Health tracker updated.',
    health: enrichHealthTracker(tracker)
  });
});

const logHealthActivity = asyncHandler(async (req, res) => {
  const tracker = await getOrCreateHealthTracker(req.user._id);

  const dateKey = ensureDateKey(req.body.date);
  const walking = ensureOptionalNumber(req.body.steps ?? req.body.walking, 'Steps') ?? 0;
  const running = ensureOptionalNumber(req.body.running, 'Running') ?? 0;
  const sleep = ensureOptionalNumber(req.body.sleep, 'Sleep') ?? 0;
  const existingLog = findDailyLog(tracker, dateKey);

  if (existingLog) {
    existingLog.walking = walking;
    existingLog.running = running;
    existingLog.sleep = sleep;
  } else {
    tracker.dailyLogs.push({
      date: dateKey,
      walking,
      running,
      sleep
    });
  }

  if (dateKey === getDateKeyOffset()) {
    tracker.steps = walking;
    tracker.running = running;
    tracker.sleep = sleep;
  }

  await tracker.save();

  res.status(201).json({
    message: 'Health activity saved.',
    log: toActivityDay(dateKey, {
      walking,
      running,
      sleep
    }),
    health: enrichHealthTracker(tracker)
  });
});

module.exports = {
  getHealth,
  getTodayHealth,
  getWeeklyHealth,
  logHealthActivity,
  updateHealth
};
