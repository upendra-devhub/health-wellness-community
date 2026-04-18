import { escapeHtml, formatCompactNumber } from '../helpers.js';
import { renderHealthActivityChart } from './dashboardChart.js';
import { renderDailyLogModal } from './dashboardModal.js';
import {
  formatDayHeading,
  formatLongDate,
  getDayByDate,
  getDayScore,
  getMetricComparison,
  getPreviousDay,
  getWeeklyDays
} from './dashboardState.js';

const decimalFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

function renderComparisonPill(comparison) {
  return `<span class="stat-card__comparison stat-card__comparison--${comparison.tone}">${escapeHtml(comparison.label)}</span>`;
}

function renderStatCard(config) {
  const comparison = getMetricComparison(config.value, config.previousValue, config.unit);

  return `
    <article class="stat-card">
      <div class="stat-card__top">
        <span class="stat-card__icon material-symbols-outlined">${escapeHtml(config.icon)}</span>
        ${renderComparisonPill(comparison)}
      </div>
      <div>
        <h3>${escapeHtml(config.title)}</h3>
        <p>${escapeHtml(config.subtitle)}</p>
      </div>
      <strong>${escapeHtml(config.displayValue)}</strong>
      <span class="stat-card__line" aria-hidden="true"></span>
    </article>
  `;
}

function renderDailyStats(day, previousDay) {
  return `
    <section class="dashboard-section">
      <div class="dashboard-section__header">
        <div>
          <h2>Stats for ${escapeHtml(formatDayHeading(day.date))}</h2>
          <p>Click any bar in the chart to inspect that day's activity.</p>
        </div>
      </div>

      <div class="daily-stats-grid">
        ${renderStatCard({
          title: 'Walking',
          subtitle: 'Steps',
          icon: 'directions_walk',
          value: day.walkingSteps,
          previousValue: previousDay.walkingSteps,
          unit: 'steps',
          displayValue: formatCompactNumber(day.walkingSteps)
        })}
        ${renderStatCard({
          title: 'Running',
          subtitle: 'Distance',
          icon: 'directions_run',
          value: day.runningKm,
          previousValue: previousDay.runningKm,
          unit: 'km',
          displayValue: `${decimalFormatter.format(day.runningKm)} km`
        })}
        ${renderStatCard({
          title: 'Sleep',
          subtitle: 'Duration',
          icon: 'bedtime',
          value: day.sleepHours,
          previousValue: previousDay.sleepHours,
          unit: 'hrs',
          displayValue: `${decimalFormatter.format(day.sleepHours)} hrs`
        })}
      </div>
    </section>
  `;
}

function getInsight(day, previousDay) {
  if (!day.isLogged && !day.walkingSteps && !day.runningKm && !day.sleepHours) {
    return {
      title: 'Insight: Start Soft',
      copy: 'A short walk, a little water, and a realistic bedtime are enough to start the pattern.'
    };
  }

  if (day.sleepHours < 7 && (day.walkingSteps > previousDay.walkingSteps || day.runningKm > 0)) {
    return {
      title: 'Insight: Gentle Reset',
      copy: 'Movement is trending up. Pair it with an earlier wind-down tonight to protect recovery.'
    };
  }

  if (day.walkingSteps >= 8000 && day.sleepHours >= 7) {
    return {
      title: 'Insight: Strong Rhythm',
      copy: 'Your activity and sleep are working together. Keep the next day simple and repeatable.'
    };
  }

  return {
    title: 'Insight: Balanced Progress',
    copy: 'Small changes are visible across the week. Use the strongest day as your next anchor.'
  };
}

function renderInsightStrip(day, previousDay) {
  const insight = getInsight(day, previousDay);

  return `
    <section class="insight-strip">
      <span class="material-symbols-outlined">lightbulb</span>
      <div>
        <h3>${escapeHtml(insight.title)}</h3>
        <p>${escapeHtml(insight.copy)}</p>
      </div>
    </section>
  `;
}

function renderDailyLog(day, todayKey) {
  const isToday = day.date === todayKey;
  const heading = isToday ? 'Daily Log' : formatDayHeading(day.date);
  const actionLabel = day.isLogged ? 'Edit Activity' : 'Log Activity';

  return `
    <article class="dashboard-side-panel daily-log-card">
      <div>
        <h2>${escapeHtml(heading)}</h2>
        <p>${escapeHtml(isToday ? "Add today's movement and sleep to unlock your latest stats." : `Edit the log for ${formatLongDate(day.date)}.`)}</p>
      </div>

      ${day.isLogged ? `
        <div class="daily-log-card__compact">
          <span class="material-symbols-outlined">check_circle</span>
          <div>
            <strong>Activity saved</strong>
            <p>${formatCompactNumber(day.walkingSteps)} steps &middot; ${decimalFormatter.format(day.runningKm)} km &middot; ${decimalFormatter.format(day.sleepHours)} hrs</p>
          </div>
        </div>
      ` : `
        <p class="daily-log-card__empty">No activity has been logged for this day yet.</p>
      `}

      <button class="button-primary button-primary--full" type="button" data-action="dashboard-open-log-modal">
        ${escapeHtml(actionLabel)}
      </button>
    </article>
  `;
}

function getWeekAverages(days) {
  const count = Math.max(1, days.length);
  return {
    steps: Math.round(days.reduce((total, day) => total + day.walkingSteps, 0) / count),
    run: days.reduce((total, day) => total + day.runningKm, 0) / count,
    sleep: days.reduce((total, day) => total + day.sleepHours, 0) / count
  };
}

function renderMiniTracker(days, health) {
  const averages = getWeekAverages(days);
  const bestDay = [...days].sort((left, right) => getDayScore(right) - getDayScore(left))[0] || days[days.length - 1];

  return `
    <article class="dashboard-side-panel mini-tracker-card">
      <div>
        <h2>Weekly Summary</h2>
        <p>Your rolling seven-day baseline.</p>
      </div>

      <div class="mini-tracker-card__grid">
        <div>
          <span>Streak</span>
          <strong>${formatCompactNumber(health?.streak || 0)}</strong>
        </div>
        <div>
          <span>Avg steps</span>
          <strong>${formatCompactNumber(averages.steps)}</strong>
        </div>
        <div>
          <span>Avg sleep</span>
          <strong>${decimalFormatter.format(averages.sleep)} hrs</strong>
        </div>
      </div>

      <div class="mini-tracker-card__highlight">
        <span class="material-symbols-outlined">auto_graph</span>
        <p><strong>${escapeHtml(formatDayHeading(bestDay.date))}</strong> has the strongest balance score this week.</p>
      </div>
    </article>
  `;
}

function renderTrendingCircles(communities) {
  const fallback = [
    { communityName: 'Yoga Flow', noOfActiveMembers: 87, icon: 'self_improvement' },
    { communityName: 'Mental Clarity', noOfActiveMembers: 73, icon: 'spa' }
  ];
  const items = communities.length ? communities.slice(0, 2) : fallback;

  return `
    <article class="dashboard-side-panel dashboard-circles-card">
      <div>
        <h2>Trending Circles</h2>
        <p>Communities you can step into next.</p>
      </div>

      <div class="dashboard-circles-card__list">
        ${items.map((community) => `
          <div class="dashboard-circle-row">
            <span class="dashboard-circle-row__icon material-symbols-outlined">${escapeHtml(community.icon || 'directions_walk')}</span>
            <div>
              <strong>${escapeHtml(community.communityName)}</strong>
              <p>${formatCompactNumber(community.noOfActiveMembers || 0)} members</p>
            </div>
            ${community._id ? `
              <button class="join-button" type="button" data-action="join-community" data-community-id="${community._id}">Join</button>
            ` : '<span class="join-button join-button--static">Join</span>'}
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

export function renderDashboardView({ state, todayKey, trendingCommunities = [] }) {
  const selectedDay = state.selectedDay || todayKey;
  const days = getWeeklyDays(state.health, selectedDay);
  const day = getDayByDate(state.health, selectedDay);
  const previousDay = getPreviousDay(state.health, selectedDay);

  return `
    <section class="dashboard-shell">
      <div class="dashboard-main-column">
        ${renderHealthActivityChart(days, selectedDay)}
        ${renderDailyStats(day, previousDay)}
        ${renderInsightStrip(day, previousDay)}
      </div>

      <aside class="dashboard-side-column">
        ${renderDailyLog(day, todayKey)}
        ${renderMiniTracker(days, state.health)}
        ${renderTrendingCircles(trendingCommunities)}
      </aside>
    </section>

    ${renderDailyLogModal(day, state.dashboardLogModalOpen)}
  `;
}
