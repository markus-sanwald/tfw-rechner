import { analysiereZeitraum, formatDate, parseDate, daysInMonth } from './rechner.js';
import { t, getLang, setLang } from './i18n.js';

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getMonths() { return getLang() === 'en' ? MONTHS_EN : MONTHS_DE; }
function getWeekdays() { return getLang() === 'en' ? WEEKDAYS_EN : WEEKDAYS_DE; }

// ── Datepicker Component ──────────────────────────────────────────

function createDatepicker(id, labelKey, onChange) {
  let selectedDate = null;
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  let showMonthSelect = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

  function buildHTML() {
    const MONTHS = getMonths();
    const WEEKDAYS = getWeekdays();
    wrapper.innerHTML = `
      <label for="${id}">${t(labelKey)}</label>
      <div class="datepicker-wrapper" id="${id}-wrapper">
        <input type="text" class="datepicker-input" id="${id}" readonly placeholder="${t('dpPlaceholder')}">
        <span class="datepicker-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M1 7h14" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 1v4M11 1v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <div class="datepicker-dropdown">
          <div class="dp-header">
            <button type="button" class="dp-nav dp-prev-year" title="${t('dpPrevYear')}">&laquo;</button>
            <button type="button" class="dp-nav dp-prev" title="${t('dpPrevMonth')}">&lsaquo;</button>
            <button type="button" class="dp-title"></button>
            <button type="button" class="dp-nav dp-next" title="${t('dpNextMonth')}">&rsaquo;</button>
            <button type="button" class="dp-nav dp-next-year" title="${t('dpNextYear')}">&raquo;</button>
          </div>
          <div class="dp-month-select hidden"></div>
          <div class="dp-weekdays">${WEEKDAYS.map(d => `<span>${d}</span>`).join('')}</div>
          <div class="dp-days"></div>
          <div class="dp-footer">
            <button type="button" class="dp-footer-btn dp-today">${t('dpToday')}</button>
            <button type="button" class="dp-footer-btn dp-clear">${t('dpClear')}</button>
          </div>
        </div>
      </div>
    `;
    // Restore selected date display
    if (selectedDate) {
      wrapper.querySelector('.datepicker-input').value = formatDate(selectedDate);
    }
  }

  buildHTML();

  function getElements() {
    return {
      input: wrapper.querySelector('.datepicker-input'),
      dpWrapper: wrapper.querySelector('.datepicker-wrapper'),
      dropdown: wrapper.querySelector('.datepicker-dropdown'),
      titleBtn: wrapper.querySelector('.dp-title'),
      daysContainer: wrapper.querySelector('.dp-days'),
      monthSelectContainer: wrapper.querySelector('.dp-month-select'),
    };
  }

  function renderCalendar() {
    const MONTHS = getMonths();
    const { titleBtn, daysContainer, monthSelectContainer } = getElements();
    titleBtn.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    monthSelectContainer.innerHTML = MONTHS.map((m, i) =>
      `<button type="button" class="dp-month-opt${i === viewMonth ? ' active' : ''}" data-month="${i}">${m}</button>`
    ).join('');
    monthSelectContainer.classList.toggle('hidden', !showMonthSelect);

    const firstDay = new Date(viewYear, viewMonth, 1);
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const totalDays = daysInMonth(viewYear, viewMonth);
    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1);
    const today = new Date();

    let html = '';

    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      html += `<button type="button" class="dp-day other-month" data-year="${viewMonth === 0 ? viewYear - 1 : viewYear}" data-month="${viewMonth === 0 ? 11 : viewMonth - 1}" data-day="${day}">${day}</button>`;
    }

    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      const isSelected = selectedDate && d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
      const cls = ['dp-day'];
      if (isToday) cls.push('today');
      if (isSelected) cls.push('selected');
      html += `<button type="button" class="${cls.join(' ')}" data-year="${viewYear}" data-month="${viewMonth}" data-day="${d}">${d}</button>`;
    }

    const totalCells = startWeekday + totalDays;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
      html += `<button type="button" class="dp-day other-month" data-year="${viewMonth === 11 ? viewYear + 1 : viewYear}" data-month="${viewMonth === 11 ? 0 : viewMonth + 1}" data-day="${d}">${d}</button>`;
    }

    daysContainer.innerHTML = html;
  }

  function selectDate(date) {
    selectedDate = date;
    const { input } = getElements();
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
    getElements().dpWrapper.classList.add('open');
  }

  function close() {
    getElements().dpWrapper.classList.remove('open');
    showMonthSelect = false;
  }

  wrapper.addEventListener('click', (e) => {
    const { input, dpWrapper } = getElements();
    if (e.target === input || e.target.closest('.datepicker-icon')) {
      if (dpWrapper.classList.contains('open')) {
        close();
      } else {
        open();
      }
      return;
    }

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

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      close();
    }
  });

  return {
    element: wrapper,
    getDate: () => selectedDate,
    rebuild: () => { buildHTML(); renderCalendar(); },
  };
}

// ── Page Content ──────────────────────────────────────────────────

function renderImpressumPage() {
  return `
    <a href="#" class="back-link">${t('backToCalculator')}</a>
    <section class="page-content">
      <h1>Impressum</h1>
      <p>Angaben gemäß § 5 DDG</p>
      <p>
        Markus Sanwald<br><br>
        Am Föllbach 39<br>
        72649 Wolfschlugen
      </p>
      <p><strong>Vertreten durch:</strong><br>
        Markus Sanwald
      </p>

      <p><strong>Kontakt:</strong><br>
        Telefon: +49-70229791487<br>
        E-Mail: <a href="mailto:info@era-rechner.de">info@era-rechner.de</a>
      </p>

      <p><strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle</strong><br>
        Wir nehmen nicht an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil und sind dazu auch nicht verpflichtet.
      </p>

      <p><strong>Haftungsausschluss:</strong></p>

      <p><strong>Haftung für Inhalte</strong><br>
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
      </p>

      <p><strong>Haftung für Links</strong><br>
        Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
      </p>

      <p><strong>Urheberrecht</strong><br>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
      </p>

      <p class="imprint-credit">
        Impressum von <a href="https://impressum-generator.de" rel="dofollow">Impressum-Generator.de</a>. Powered by <a href="https://www.kanzlei-hasselbach.de/" rel="nofollow">Franziska Hasselbach, Bonn</a>.
      </p>
    </section>
  `;
}

function renderDatenschutzPage() {
  return `
    <a href="#" class="back-link">${t('backToCalculator')}</a>
    <section class="page-content">
      <h1>Datenschutzerklärung</h1>

      <h2>Allgemeiner Hinweis und Pflichtinformationen</h2>

      <h3>Benennung der verantwortlichen Stelle</h3>
      <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
      <p>
        Markus Sanwald<br>
        Am Föllbach 39<br>
        72649 Wolfschlugen
      </p>
      <p>Die verantwortliche Stelle entscheidet allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, Kontaktdaten o.&nbsp;Ä.).</p>

      <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
      <p>Nur mit Ihrer ausdrücklichen Einwilligung sind einige Vorgänge der Datenverarbeitung möglich. Ein Widerruf Ihrer bereits erteilten Einwilligung ist jederzeit möglich. Für den Widerruf genügt eine formlose Mitteilung per E-Mail. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.</p>

      <h3>Recht auf Beschwerde bei der zuständigen Aufsichtsbehörde</h3>
      <p>Als Betroffener steht Ihnen im Falle eines datenschutzrechtlichen Verstoßes ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu. Zuständige Aufsichtsbehörde bezüglich datenschutzrechtlicher Fragen ist der Landesdatenschutzbeauftragte des Bundeslandes, in dem sich der Sitz unseres Unternehmens befindet. Der folgende Link stellt eine Liste der Datenschutzbeauftragten sowie deren Kontaktdaten bereit: <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener">https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html</a>.</p>

      <h3>Recht auf Datenübertragbarkeit</h3>
      <p>Ihnen steht das Recht zu, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an Dritte aushändigen zu lassen. Die Bereitstellung erfolgt in einem maschinenlesbaren Format. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.</p>

      <h3>Recht auf Auskunft, Berichtigung, Sperrung, Löschung</h3>
      <p>Sie haben jederzeit im Rahmen der geltenden gesetzlichen Bestimmungen das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, Herkunft der Daten, deren Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Diesbezüglich und auch zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit über die im Impressum aufgeführten Kontaktmöglichkeiten an uns wenden.</p>

      <h3>SSL- bzw. TLS-Verschlüsselung</h3>
      <p>Aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, die Sie an uns als Seitenbetreiber senden, nutzt unsere Website eine SSL-bzw. TLS-Verschlüsselung. Damit sind Daten, die Sie über diese Website übermitteln, für Dritte nicht mitlesbar. Sie erkennen eine verschlüsselte Verbindung an der \u201ehttps://\u201c Adresszeile Ihres Browsers und am Schloss-Symbol in der Browserzeile.</p>

      <h2>Kontaktformular</h2>
      <p>Per Kontaktformular übermittelte Daten werden einschließlich Ihrer Kontaktdaten gespeichert, um Ihre Anfrage bearbeiten zu können oder um für Anschlussfragen bereitzustehen. Eine Weitergabe dieser Daten findet ohne Ihre Einwilligung nicht statt.</p>
      <p>Je nach Art der Anfrage ist die Rechtsgrundlage für diese Verarbeitung Art. 6 Abs. 1 lit. b DSGVO für Anfragen, die Sie selbst im Rahmen einer vorvertraglichen Maßnahme stellen oder Art. 6 Abs. 1 S. 1 lit. f DSGVO, wenn Ihre Anfrage sonstiger Art ist. Sollten personenbezogene Daten abgefragt werden, die wir nicht für die Erfüllung eines Vertrages oder zur Wahrung berechtigter Interessen benötigen, erfolgt die Übermittlung an uns auf Basis einer von Ihnen abgegebenen Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.</p>
      <p>Über das Kontaktformular übermittelte Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder keine Notwendigkeit der Datenspeicherung mehr besteht. Zwingende gesetzliche Bestimmungen - insbesondere Aufbewahrungsfristen - bleiben unberührt.</p>
      <p>Für die technische Übermittlung der Kontaktformular-Daten nutzen wir den Dienst FormSubmit.co. Beim Absenden des Formulars werden Ihre eingegebenen Daten (Name, E-Mail-Adresse, Betreff und Nachricht) über die Server von FormSubmit.co an unsere E-Mail-Adresse weitergeleitet. FormSubmit.co verarbeitet diese Daten ausschließlich zum Zweck der Weiterleitung und speichert sie nicht dauerhaft. Die Rechtsgrundlage für die Nutzung dieses Dienstes ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer zuverlässigen Kontaktmöglichkeit). Weitere Informationen finden Sie in der Datenschutzerklärung von FormSubmit: <a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener">https://formsubmit.co/privacy.pdf</a>.</p>

      <h2>Cloudflare CDN</h2>

      <h3>Art und Umfang der Verarbeitung</h3>
      <p>Wir verwenden zur ordnungsgemäßen Bereitstellung der Inhalte unserer Website Cloudflare CDN. Cloudflare CDN ist ein Dienst der Cloudflare, Inc., welcher auf unserer Website als Content Delivery Network (CDN) fungiert.</p>
      <p>Ein CDN trägt dazu bei, Inhalte unseres Onlineangebotes, insbesondere Dateien wie Grafiken oder Skripte, mit Hilfe regional oder international verteilter Server schneller bereitzustellen. Wenn Sie auf diese Inhalte zugreifen, stellen Sie eine Verbindung zu Servern der Cloudflare, Inc., her, wobei Ihre IP-Adresse und ggf. Browserdaten wie Ihr User-Agent übermittelt werden. Diese Daten werden ausschließlich zu den oben genannten Zwecken und zur Aufrechterhaltung der Sicherheit und Funktionalität von Cloudflare CDN verarbeitet.</p>

      <h3>Zweck und Rechtsgrundlage</h3>
      <p>Die Nutzung des Content Delivery Networks erfolgt auf Grundlage unserer berechtigten Interessen, d.h. Interesse an einer sicheren und effizienten Bereitstellung sowie der Optimierung unseres Onlineangebotes gemäß Art. 6 Abs. 1 lit. f. DSGVO.</p>
      <p>Wir beabsichtigen personenbezogenen Daten an Drittländer außerhalb des Europäischen Wirtschaftsraums, insbesondere die USA, zu übermitteln. Die Datenübermittlung in die USA erfolgt nach Art. 45 Abs. 1 DSGVO auf Grundlage des Angemessenheitsbeschluss der Europäischen Kommission. Die beteiligten US-Unternehmen und/oder deren US-Unterauftragnehmer sind nach dem EU-U.S. Data Privacy Framework (EU-U.S. DPF) zertifiziert.</p>

      <h3>Speicherdauer</h3>
      <p>Die konkrete Speicherdauer der verarbeiteten Daten ist nicht durch uns beeinflussbar, sondern wird von Cloudflare, Inc. bestimmt. Weitere Hinweise finden Sie in der Datenschutzerklärung für Cloudflare CDN: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">https://www.cloudflare.com/privacypolicy/</a>.</p>

      <h2>PayPal</h2>
      <p>Unsere Website ermöglicht die Bezahlung via PayPal. Anbieter des Bezahldienstes ist die PayPal (Europe) S.à.r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg.</p>
      <p>Wenn Sie mit PayPal bezahlen, erfolgt eine Übermittlung der von Ihnen eingegebenen Zahlungsdaten an PayPal.</p>
      <p>Die Übermittlung Ihrer Daten an PayPal erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und Art. 6 Abs. 1 lit. b DSGVO (Verarbeitung zur Erfüllung eines Vertrags). Ein Widerruf Ihrer bereits erteilten Einwilligung ist jederzeit möglich. In der Vergangenheit liegende Datenverarbeitungsvorgänge bleiben bei einem Widerruf wirksam.</p>

      <p class="imprint-credit"><small>Quelle: Datenschutz-Konfigurator von <a href="https://www.hub24.de" target="_blank" rel="noopener">Herold Unternehmensberatung</a></small></p>
    </section>
  `;
}

function renderKontaktPage() {
  return `
    <a href="#" class="back-link">${t('backToCalculator')}</a>
    <section class="page-content">
      <h1>${t('kontaktTitle')}</h1>
      <p class="contact-intro">${t('kontaktIntro')}</p>
      <form id="contact-form" class="contact-form" action="https://formsubmit.co/info@era-rechner.de" method="POST">
        <input type="hidden" name="_subject" value="TFW-Rechner: Kontaktformular">
        <input type="hidden" name="_captcha" value="true">
        <input type="hidden" name="_next" value="${window.location.origin}${window.location.pathname}#kontakt-success">
        <input type="text" name="_honey" style="display:none">
        <div class="form-group">
          <label for="contact-name">${t('kontaktName')}</label>
          <input type="text" id="contact-name" name="name" required>
        </div>
        <div class="form-group">
          <label for="contact-email">${t('kontaktEmail')}</label>
          <input type="email" id="contact-email" name="email" required>
        </div>
        <div class="form-group">
          <label for="contact-subject">${t('kontaktBetreff')}</label>
          <select id="contact-subject" name="subject">
            <option value="Feedback">${t('kontaktFeedback')}</option>
            <option value="Bug">${t('kontaktBug')}</option>
            <option value="Feature">${t('kontaktFeature')}</option>
            <option value="Sonstiges">${t('kontaktSonstiges')}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contact-message">${t('kontaktNachricht')}</label>
          <textarea id="contact-message" name="message" rows="4" required></textarea>
        </div>
        <button type="submit" class="contact-submit">${t('kontaktSenden')}</button>
      </form>
      <p class="contact-success hidden" id="contact-success">${t('kontaktSuccess')}</p>
    </section>
  `;
}

// ── Router ────────────────────────────────────────────────────────

const app = document.querySelector('#app');
const header = document.querySelector('header');
const titleEl = header.querySelector('h1');
const subtitleEl = header.querySelector('.subtitle');
let calculatorEl = null;
let vonDate = null;
let bisDate = null;
let bruttoValue = null;
let vonPicker = null;
let bisPicker = null;
let resultDiv = null;

function formatCurrency(value) {
  return value.toLocaleString(getLang() === 'en' ? 'en-DE' : 'de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' \u20AC';
}

function buildCalculator() {
  const calculator = document.createElement('div');
  calculator.className = 'calculator';

  vonPicker = createDatepicker('von', 'labelVon', (date) => {
    vonDate = date;
    updateResult();
  });

  bisPicker = createDatepicker('bis', 'labelBis', (date) => {
    bisDate = date;
    updateResult();
  });

  calculator.appendChild(vonPicker.element);
  calculator.appendChild(bisPicker.element);

  // Bruttogehalt input with tooltip
  const bruttoGroup = document.createElement('div');
  bruttoGroup.className = 'form-group';
  bruttoGroup.id = 'brutto-group';
  bruttoGroup.innerHTML = `
    <label for="brutto" class="label-with-tooltip">
      ${t('labelBrutto')}
      <span class="label-info" title="${t('bruttoTooltip')}">&#9432;</span>
    </label>
    <div class="input-euro-group">
      <input type="number" id="brutto" min="0" step="1" placeholder="${t('bruttoPlaceholder')}" value="">
      <span class="input-euro-suffix">\u20AC</span>
    </div>
  `;
  bruttoGroup.querySelector('#brutto').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bruttoValue = isNaN(val) || val <= 0 ? null : val;
    updateResult();
  });
  calculator.appendChild(bruttoGroup);

  resultDiv = document.createElement('div');
  resultDiv.className = 'result hidden';
  resultDiv.id = 'zeitraum-result';

  calculator.appendChild(resultDiv);
  return calculator;
}

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
        <span class="result-label">${t('resultUngueltig')}</span>
        <span class="result-value" style="color: var(--color-accent);">${t('resultUngueltigHint')}</span>
      </div>
    `;
    return;
  }

  const { ganzeMonateFlag, anzahlMonate, restTageVor, restTageNach } = analyse;

  let html = '';

  html += `
    <div class="result-row">
      <span class="result-label">${t('resultZeitraum')}</span>
      <span class="result-value">${formatDate(vonDate)} \u2013 ${formatDate(bisDate)}</span>
    </div>
  `;

  html += `
    <div class="result-row highlight">
      <span class="result-label">${t('resultGanzeMonate')}</span>
      <span class="result-value">${ganzeMonateFlag ? t('resultJa') : t('resultNein')}</span>
    </div>
  `;

  if (ganzeMonateFlag) {
    html += `
      <div class="breakdown">
        <div class="breakdown-title">${t('breakdownTitle')}</div>
        <div class="breakdown-row">
          <span class="breakdown-label">${t('breakdownVolleMonate')}</span>
          <span class="breakdown-value">${anzahlMonate}</span>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="breakdown">
        <div class="breakdown-title">${t('breakdownTitle')}</div>
        ${restTageVor > 0 ? `
        <div class="breakdown-row">
          <span class="breakdown-label">${t('breakdownResttageAnfang')}</span>
          <span class="breakdown-value">${restTageVor} ${t('breakdownTage')}</span>
        </div>
        ` : ''}
        <div class="breakdown-row">
          <span class="breakdown-label">${t('breakdownVolleMonateLabel')}</span>
          <span class="breakdown-value">${anzahlMonate}</span>
        </div>
        ${restTageNach > 0 ? `
        <div class="breakdown-row">
          <span class="breakdown-label">${t('breakdownResttageEnde')}</span>
          <span class="breakdown-value">${restTageNach} ${t('breakdownTage')}</span>
        </div>
        ` : ''}
      </div>
    `;
  }

  // Salary calculation if Bruttogehalt is set
  if (bruttoValue) {
    // Calculate total days in period
    const diffTime = bisDate.getTime() - vonDate.getTime();
    const totalCalendarDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calculate proportional salary:
    // Full months get full salary, partial months get daily rate
    let totalSalary = anzahlMonate * bruttoValue;

    if (restTageVor > 0) {
      const daysInStartMonth = daysInMonth(vonDate.getFullYear(), vonDate.getMonth());
      totalSalary += (restTageVor / daysInStartMonth) * bruttoValue;
    }

    if (restTageNach > 0) {
      const daysInEndMonth = daysInMonth(bisDate.getFullYear(), bisDate.getMonth());
      totalSalary += (restTageNach / daysInEndMonth) * bruttoValue;
    }

    html += `
      <div class="breakdown">
        <div class="breakdown-row highlight">
          <span class="breakdown-label" style="font-weight:600; color: var(--color-primary);">${t('breakdownGehalt')}</span>
          <span class="breakdown-value" style="color: var(--color-primary);">${formatCurrency(totalSalary)}</span>
        </div>
      </div>
    `;
  }

  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = html;
}

function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === getLang());
  });
}

function rebuildPage() {
  // Update header
  titleEl.textContent = t('title');
  subtitleEl.textContent = t('subtitle');

  // Update footer
  const footerLinks = document.querySelector('.footer-links');
  if (footerLinks) {
    footerLinks.innerHTML = `
      <a href="#kontakt" data-nav="kontakt">${t('footerKontakt')}</a>
      <span class="footer-sep">&middot;</span>
      <a href="#impressum" data-nav="impressum">${t('footerImpressum')}</a>
      <span class="footer-sep">&middot;</span>
      <a href="#datenschutz" data-nav="datenschutz">${t('footerDatenschutz')}</a>
    `;
    // Re-attach footer nav handlers
    footerLinks.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = link.dataset.nav;
      });
    });
  }

  updateLangButtons();

  // Force rebuild calculator on next navigate
  calculatorEl = null;
  vonDate = null;
  bisDate = null;
  bruttoValue = null;

  handleHash();
}

function navigate(page) {
  app.innerHTML = '';

  if (page === 'impressum') {
    header.style.display = 'none';
    app.innerHTML = renderImpressumPage();
  } else if (page === 'datenschutz') {
    header.style.display = 'none';
    app.innerHTML = renderDatenschutzPage();
  } else if (page === 'kontakt' || page === 'kontakt-success') {
    header.style.display = 'none';
    app.innerHTML = renderKontaktPage();
    if (page === 'kontakt-success') {
      const form = app.querySelector('#contact-form');
      const success = app.querySelector('#contact-success');
      if (form) form.classList.add('hidden');
      if (success) success.classList.remove('hidden');
    }
  } else {
    header.style.display = '';
    if (!calculatorEl) {
      calculatorEl = buildCalculator();
    }
    app.appendChild(calculatorEl);
  }

  // Attach back-link handlers
  app.querySelectorAll('.back-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
    });
  });

  window.scrollTo(0, 0);
}

function handleHash() {
  const hash = window.location.hash.replace('#', '');
  navigate(hash || 'home');
}

// ── Language switcher ─────────────────────────────────────────────

function initLangSwitch() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang !== getLang()) {
        setLang(lang);
        rebuildPage();
      }
    });
  });
  updateLangButtons();
}

// Navigation via footer links
document.querySelectorAll('[data-nav]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = link.dataset.nav;
  });
});

window.addEventListener('hashchange', handleHash);

// Initialize
document.documentElement.lang = getLang();
titleEl.textContent = t('title');
subtitleEl.textContent = t('subtitle');
initLangSwitch();
handleHash();
