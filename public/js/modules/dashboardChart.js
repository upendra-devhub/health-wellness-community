import { escapeHtml, formatCompactNumber } from '../helpers.js';
import { formatLongDate, formatShortDay } from './dashboardState.js';

const decimalFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
const MAX_WALKING = 10000;
const MAX_RUNNING = 5;
const MAX_SLEEP = 8;

function clampScore(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}

function getNormalizedScores(day) {
  return {
    walking: clampScore(Number(day.walkingSteps || 0) / MAX_WALKING),
    running: clampScore(Number(day.runningKm || 0) / MAX_RUNNING),
    sleep: clampScore(Number(day.sleepHours || 0) / MAX_SLEEP)
  };
}

function getActivityHeightPercent(scores) {
  return ((scores.walking + scores.running + scores.sleep) / 3) * 100;
}

function getStackedSegments(day) {
  const scores = getNormalizedScores(day);
  const sum = scores.walking + scores.running + scores.sleep;
  const heightPercent = getActivityHeightPercent(scores);

  if (!sum) {
    return [
      { id: 'walking', height: 0 },
      { id: 'running', height: 0 },
      { id: 'sleep', height: 0 }
    ];
  }

  return [
    { id: 'walking', height: heightPercent * (scores.walking / sum) },
    { id: 'running', height: heightPercent * (scores.running / sum) },
    { id: 'sleep', height: heightPercent * (scores.sleep / sum) }
  ];
}

function renderChartDay(day, selectedDay) {
  const isSelected = day.date === selectedDay;
  const score = Math.round(getActivityHeightPercent(getNormalizedScores(day)));
  const segments = getStackedSegments(day);
  const hasActivity = segments.some((segment) => segment.height > 0);
  const topSegmentIndex = segments.reduce((topIndex, segment, index) => {
    return segment.height > 0 ? index : topIndex;
  }, -1);

  return `
    <button
      class="dashboard-chart__day ${isSelected ? 'is-selected' : ''}"
      type="button"
      data-action="dashboard-select-day"
      data-date="${escapeHtml(day.date)}"
      aria-pressed="${String(isSelected)}"
      aria-label="${escapeHtml(formatShortDay(day.date))}: ${score}% activity score">
      <span class="dashboard-chart__bar-shell ${hasActivity ? '' : 'is-empty'}" aria-hidden="true">
        <span class="dashboard-chart__bar bar">
          ${segments.map((segment, index) => `
            <span
              class="dashboard-chart__segment dashboard-chart__segment--${segment.id} segment ${segment.id} ${index === topSegmentIndex ? 'is-top-segment' : ''}"
              style="--segment-height:${segment.height}%">
            </span>
          `).join('')}
        </span>
      </span>
      <span class="dashboard-chart__label">${escapeHtml(formatShortDay(day.date))}</span>
      <span class="dashboard-tooltip" role="tooltip">
        <strong>${escapeHtml(formatLongDate(day.date))}</strong>
        <span>${formatCompactNumber(day.walkingSteps)} steps</span>
        <span>${decimalFormatter.format(day.runningKm)} km run</span>
        <span>${decimalFormatter.format(day.sleepHours)} hrs sleep</span>
      </span>
    </button>
  `;
}

export function renderHealthActivityChart(days, selectedDay) {
  return `
    <article class="dashboard-panel dashboard-panel--chart">
      <div class="dashboard-panel__header">
        <div>
          <h1>Health activity</h1>
          <p>Weekly consolidated wellness metrics</p>
        </div>
        <div class="dashboard-legend" aria-label="Chart legend">
          <span><i class="legend-dot legend-dot--walking"></i>Walking</span>
          <span><i class="legend-dot legend-dot--running"></i>Running</span>
          <span><i class="legend-dot legend-dot--sleep"></i>Sleep</span>
        </div>
      </div>

      <div class="dashboard-chart" aria-label="Weekly health activity chart">
        <div class="dashboard-chart__scale" aria-hidden="true">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        <div class="dashboard-chart__plot">
          ${days.map((day) => renderChartDay(day, selectedDay)).join('')}
        </div>
      </div>
    </article>
  `;
}
