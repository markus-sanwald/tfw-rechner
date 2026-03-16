import { analysiereZeitraum, formatDate, parseDate, daysInMonth } from './rechner.js';

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// ── Datepicker Component ──────────────────────────────────────────

function createDatepicker(id, label, onChange) {
  let selectedDate = null;
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  let showMonthSelect = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  wrapper.innerHTML = `
    <label for="${id}">${label}</label>
    <div class="datepicker-wrapper" id="${id}-wrapper">
      <input type="text" class="datepicker-input" id="${id}" readonly placeholder="TT.MM.JJJJ">
      <span class="datepicker-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M1 7h14" stroke="currentColor" stroke-width="1.5"/>
          <path d="M5 1v4M11 1v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <div class="datepicker-dropdown">
        <div class="dp-header">
          <button type="button" class="dp-nav dp-prev-year" title="Vorheriges Jahr">&laquo;</button>
          <button type="button" class="dp-nav dp-prev" title="Vorheriger Monat">&lsaquo;</button>
          <button type="button" class="dp-title"></button>
          <button type="button" class="dp-nav dp-next" title="Nächster Monat">&rsaquo;</button>
          <button type="button" class="dp-nav dp-next-year" title="Nächstes Jahr">&raquo;</button>
        </div>
        <div class="dp-month-select hidden"></div>
        <div class="dp-weekdays">${WEEKDAYS.map(d => `<span>${d}</span>`).join('')}</div>
        <div class="dp-days"></div>
        <div class="dp-footer">
          <button type="button" class="dp-footer-btn dp-today">Heute</button>
          <button type="button" class="dp-footer-btn dp-clear">Löschen</button>
        </div>
      </div>
    </div>
  `;

  const input = wrapper.querySelector('.datepicker-input');
  const dpWrapper = wrapper.querySelector('.datepicker-wrapper');
  const dropdown = wrapper.querySelector('.datepicker-dropdown');
  const titleBtn = wrapper.querySelector('.dp-title');
  const daysContainer = wrapper.querySelector('.dp-days');
  const monthSelectContainer = wrapper.querySelector('.dp-month-select');

  function renderCalendar() {
    titleBtn.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    // Month selector
    monthSelectContainer.innerHTML = MONTHS.map((m, i) =>
      `<button type="button" class="dp-month-opt${i === viewMonth ? ' active' : ''}" data-month="${i}">${m}</button>`
    ).join('');
    monthSelectContainer.classList.toggle('hidden', !showMonthSelect);

    // Days grid
    const firstDay = new Date(viewYear, viewMonth, 1);
    let startWeekday = firstDay.getDay() - 1; // Monday = 0
    if (startWeekday < 0) startWeekday = 6;

    const totalDays = daysInMonth(viewYear, viewMonth);
    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1);
    const today = new Date();

    let html = '';

    // Previous month trailing days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      html += `<button type="button" class="dp-day other-month" data-year="${viewMonth === 0 ? viewYear - 1 : viewYear}" data-month="${viewMonth === 0 ? 11 : viewMonth - 1}" data-day="${day}">${day}</button>`;
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      const isSelected = selectedDate && d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
      const cls = ['dp-day'];
      if (isToday) cls.push('today');
      if (isSelected) cls.push('selected');
      html += `<button type="button" class="${cls.join(' ')}" data-year="${viewYear}" data-month="${viewMonth}" data-day="${d}">${d}</button>`;
    }

    // Next month leading days
    const totalCells = startWeekday + totalDays;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
      html += `<button type="button" class="dp-day other-month" data-year="${viewMonth === 11 ? viewYear + 1 : viewYear}" data-month="${viewMonth === 11 ? 0 : viewMonth + 1}" data-day="${d}">${d}</button>`;
    }

    daysContainer.innerHTML = html;
  }

  function selectDate(date) {
    selectedDate = date;
    input.value = date ? formatDate(date) : '';
    renderCalendar();
    onChange(date);
  }

  function open() {
    if (selectedDate) {
      viewYear = selectedDate.getFullYear();
      viewMonth = selectedDate.getMonth();
    }
    showMonthSelect = false;
    renderCalendar();
    dpWrapper.classList.add('open');
  }

  function close() {
    dpWrapper.classList.remove('open');
    showMonthSelect = false;
  }

  // Event listeners
  input.addEventListener('click', () => {
    if (dpWrapper.classList.contains('open')) {
      close();
    } else {
      open();
    }
  });

  dropdown.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.classList.contains('dp-prev-year')) {
      viewYear--;
      renderCalendar();
    } else if (btn.classList.contains('dp-next-year')) {
      viewYear++;
      renderCalendar();
    } else if (btn.classList.contains('dp-prev')) {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    } else if (btn.classList.contains('dp-next')) {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    } else if (btn.classList.contains('dp-title')) {
      showMonthSelect = !showMonthSelect;
      renderCalendar();
    } else if (btn.classList.contains('dp-month-opt')) {
      viewMonth = parseInt(btn.dataset.month);
      showMonthSelect = false;
      renderCalendar();
    } else if (btn.classList.contains('dp-today')) {
      const today = new Date();
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      selectDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
      close();
    } else if (btn.classList.contains('dp-clear')) {
      selectDate(null);
      close();
    } else if (btn.classList.contains('dp-day')) {
      const y = parseInt(btn.dataset.year);
      const m = parseInt(btn.dataset.month);
      const d = parseInt(btn.dataset.day);
      viewYear = y;
      viewMonth = m;
      selectDate(new Date(y, m, d));
      close();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      close();
    }
  });

  return { element: wrapper, getDate: () => selectedDate };
}

// ── App ───────────────────────────────────────────────────────────

const app = document.querySelector('#app');

const calculator = document.createElement('div');
calculator.className = 'calculator';

let vonDate = null;
let bisDate = null;

const vonPicker = createDatepicker('von', 'Zeitraum von', (date) => {
  vonDate = date;
  updateResult();
});

const bisPicker = createDatepicker('bis', 'Zeitraum bis', (date) => {
  bisDate = date;
  updateResult();
});

calculator.appendChild(vonPicker.element);
calculator.appendChild(bisPicker.element);

// Result area
const resultDiv = document.createElement('div');
resultDiv.className = 'result hidden';
resultDiv.id = 'zeitraum-result';

calculator.appendChild(resultDiv);
app.appendChild(calculator);

function updateResult() {
  if (!vonDate || !bisDate) {
    resultDiv.classList.add('hidden');
    return;
  }

  const analyse = analysiereZeitraum(vonDate, bisDate);

  if (!analyse) {
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
      <div class="result-row">
        <span class="result-label">Ungültiger Zeitraum</span>
        <span class="result-value" style="color: var(--color-accent);">Enddatum muss nach Startdatum liegen</span>
      </div>
    `;
    return;
  }

  const { ganzeMonateFlag, anzahlMonate, restTageVor, restTageNach } = analyse;

  let html = '';

  // Zeitraum-Anzeige
  html += `
    <div class="result-row">
      <span class="result-label">Zeitraum</span>
      <span class="result-value">${formatDate(vonDate)} – ${formatDate(bisDate)}</span>
    </div>
  `;

  // Ganze Monate Ja/Nein
  html += `
    <div class="result-row highlight">
      <span class="result-label">Ganze Monate</span>
      <span class="result-value">${ganzeMonateFlag ? 'Ja' : 'Nein'}</span>
    </div>
  `;

  // Details
  if (ganzeMonateFlag) {
    html += `
      <div class="breakdown">
        <div class="breakdown-title">Aufschlüsselung</div>
        <div class="breakdown-row">
          <span class="breakdown-label">Anzahl voller Monate</span>
          <span class="breakdown-value">${anzahlMonate}</span>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="breakdown">
        <div class="breakdown-title">Aufschlüsselung</div>
        ${restTageVor > 0 ? `
        <div class="breakdown-row">
          <span class="breakdown-label">Resttage am Anfang</span>
          <span class="breakdown-value">${restTageVor} Tage</span>
        </div>
        ` : ''}
        <div class="breakdown-row">
          <span class="breakdown-label">Volle Monate</span>
          <span class="breakdown-value">${anzahlMonate}</span>
        </div>
        ${restTageNach > 0 ? `
        <div class="breakdown-row">
          <span class="breakdown-label">Resttage am Ende</span>
          <span class="breakdown-value">${restTageNach} Tage</span>
        </div>
        ` : ''}
      </div>
    `;
  }

  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = html;
}
