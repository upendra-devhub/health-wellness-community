import { escapeHtml } from '../helpers.js';
import { formatLongDate } from './dashboardState.js';

export function renderDailyLogModal(day, isOpen) {
  const title = day.isLogged ? 'Edit daily log' : 'Log activity';
  const submitLabel = day.isLogged ? 'Save changes' : 'Log activity';

  return `
    <div id="dashboard-log-modal" class="modal-shell dashboard-log-modal ${isOpen ? 'is-open' : 'is-hidden'}" aria-hidden="${String(!isOpen)}">
      <div class="modal-shell__backdrop" data-action="dashboard-close-log-modal"></div>
      <div class="dashboard-modal-card" role="dialog" aria-modal="true" aria-labelledby="dashboard-log-modal-title">
        <form id="dashboard-log-form" class="dashboard-log-form" novalidate>
          <div class="dashboard-modal-card__header">
            <div>
              <p class="micro-copy">${escapeHtml(formatLongDate(day.date))}</p>
              <h2 id="dashboard-log-modal-title">${escapeHtml(title)}</h2>
            </div>
            <button class="soft-button" type="button" data-action="dashboard-close-log-modal">Close</button>
          </div>

          <input type="hidden" name="date" value="${escapeHtml(day.date)}">

          <div class="dashboard-form-grid">
            <label class="field">
              <span>Walking steps</span>
              <input type="number" min="0" step="1" name="walkingSteps" value="${escapeHtml(String(day.walkingSteps || 0))}" required>
            </label>

            <label class="field">
              <span>Running distance (km)</span>
              <input type="number" min="0" step="0.1" name="runningKm" value="${escapeHtml(String(day.runningKm || 0))}" required>
            </label>

            <label class="field">
              <span>Sleep duration (hrs)</span>
              <input type="number" min="0" step="0.1" name="sleepHours" value="${escapeHtml(String(day.sleepHours || 0))}" required>
            </label>

            <label class="field">
              <span>Water intake (ml)</span>
              <input type="number" min="0" step="1" name="waterIntake" value="${escapeHtml(String(day.waterIntake || 0))}" required>
            </label>
          </div>

          <label class="field">
            <span>Reflection</span>
            <textarea name="notes" rows="4" maxlength="280" placeholder="What helped your rhythm today?">${escapeHtml(day.notes || '')}</textarea>
          </label>

          <div class="dashboard-modal-card__footer">
            <p class="helper-text">One saved entry is kept for each date. Editing updates the same daily record.</p>
            <button class="button-primary" type="submit">${escapeHtml(submitLabel)}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
