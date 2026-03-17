(function () {
  var t = TFW.t;
  var getLang = TFW.getLang;
  var setLang = TFW.setLang;
  var analysiereZeitraum = TFW.analysiereZeitraum;
  var formatDate = TFW.formatDate;
  var daysInMonth = TFW.daysInMonth;
  var arbeitstageImMonat = TFW.arbeitstageImMonat;
  var arbeitstageZwischen = TFW.arbeitstageZwischen;

  var MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var WEEKDAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  function getMonths() { return getLang() === 'en' ? MONTHS_EN : MONTHS_DE; }
  function getWeekdays() { return getLang() === 'en' ? WEEKDAYS_EN : WEEKDAYS_DE; }

  // ── Datepicker Component ──────────────────────────────────────────

  function createDatepicker(id, labelKey, onChange) {
    var selectedDate = null;
    var viewYear = new Date().getFullYear();
    var viewMonth = new Date().getMonth();
    var showMonthSelect = false;

    var wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    function buildHTML() {
      var MONTHS = getMonths();
      var WEEKDAYS = getWeekdays();
      wrapper.innerHTML =
        '<label for="' + id + '">' + t(labelKey) + '</label>' +
        '<div class="datepicker-wrapper" id="' + id + '-wrapper">' +
        '<input type="text" class="datepicker-input" id="' + id + '" readonly placeholder="' + t('dpPlaceholder') + '">' +
        '<span class="datepicker-icon">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
        '<rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M1 7h14" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M5 1v4M11 1v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg>' +
        '</span>' +
        '<div class="datepicker-dropdown">' +
        '<div class="dp-header">' +
        '<button type="button" class="dp-nav dp-prev-year" title="' + t('dpPrevYear') + '">&laquo;</button>' +
        '<button type="button" class="dp-nav dp-prev" title="' + t('dpPrevMonth') + '">&lsaquo;</button>' +
        '<button type="button" class="dp-title"></button>' +
        '<button type="button" class="dp-nav dp-next" title="' + t('dpNextMonth') + '">&rsaquo;</button>' +
        '<button type="button" class="dp-nav dp-next-year" title="' + t('dpNextYear') + '">&raquo;</button>' +
        '</div>' +
        '<div class="dp-month-select hidden"></div>' +
        '<div class="dp-weekdays">' + WEEKDAYS.map(function(d) { return '<span>' + d + '</span>'; }).join('') + '</div>' +
        '<div class="dp-days"></div>' +
        '<div class="dp-footer">' +
        '<button type="button" class="dp-footer-btn dp-today">' + t('dpToday') + '</button>' +
        '<button type="button" class="dp-footer-btn dp-clear">' + t('dpClear') + '</button>' +
        '</div>' +
        '</div>' +
        '</div>';
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
      var MONTHS = getMonths();
      var els = getElements();
      els.titleBtn.textContent = MONTHS[viewMonth] + ' ' + viewYear;

      els.monthSelectContainer.innerHTML = MONTHS.map(function(m, i) {
        return '<button type="button" class="dp-month-opt' + (i === viewMonth ? ' active' : '') + '" data-month="' + i + '">' + m + '</button>';
      }).join('');
      els.monthSelectContainer.classList.toggle('hidden', !showMonthSelect);

      var firstDay = new Date(viewYear, viewMonth, 1);
      var startWeekday = firstDay.getDay() - 1;
      if (startWeekday < 0) startWeekday = 6;

      var totalDays = daysInMonth(viewYear, viewMonth);
      var prevMonthDays = daysInMonth(viewYear, viewMonth - 1);
      var today = new Date();

      var html = '';

      for (var i = startWeekday - 1; i >= 0; i--) {
        var day = prevMonthDays - i;
        html += '<button type="button" class="dp-day other-month" data-year="' + (viewMonth === 0 ? viewYear - 1 : viewYear) + '" data-month="' + (viewMonth === 0 ? 11 : viewMonth - 1) + '" data-day="' + day + '">' + day + '</button>';
      }

      for (var d = 1; d <= totalDays; d++) {
        var isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
        var isSelected = selectedDate && d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
        var cls = 'dp-day';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';
        html += '<button type="button" class="' + cls + '" data-year="' + viewYear + '" data-month="' + viewMonth + '" data-day="' + d + '">' + d + '</button>';
      }

      var totalCells = startWeekday + totalDays;
      var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (var r = 1; r <= remaining; r++) {
        html += '<button type="button" class="dp-day other-month" data-year="' + (viewMonth === 11 ? viewYear + 1 : viewYear) + '" data-month="' + (viewMonth === 11 ? 0 : viewMonth + 1) + '" data-day="' + r + '">' + r + '</button>';
      }

      els.daysContainer.innerHTML = html;
    }

    function selectDate(date) {
      selectedDate = date;
      var els = getElements();
      els.input.value = date ? formatDate(date) : '';
      renderCalendar();
      onChange(date);
    }

    function open() {
      if (selectedDate) {
        viewYear = selectedDate.getFullYear();
        viewMonth = selectedDate.getMonth();
      } else if (hintDate) {
        viewYear = hintDate.getFullYear();
        viewMonth = hintDate.getMonth();
      }
      showMonthSelect = false;
      renderCalendar();
      getElements().dpWrapper.classList.add('open');
    }

    function close() {
      getElements().dpWrapper.classList.remove('open');
      showMonthSelect = false;
    }

    wrapper.addEventListener('click', function(e) {
      var els = getElements();
      if (e.target === els.input || e.target.closest('.datepicker-icon')) {
        if (els.dpWrapper.classList.contains('open')) {
          close();
        } else {
          open();
        }
        return;
      }

      var btn = e.target.closest('button');
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
        var today = new Date();
        viewYear = today.getFullYear();
        viewMonth = today.getMonth();
        selectDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        close();
      } else if (btn.classList.contains('dp-clear')) {
        selectDate(null);
        close();
      } else if (btn.classList.contains('dp-day')) {
        var y = parseInt(btn.dataset.year);
        var m = parseInt(btn.dataset.month);
        var dd = parseInt(btn.dataset.day);
        viewYear = y;
        viewMonth = m;
        selectDate(new Date(y, m, dd));
        close();
      }
    });

    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) {
        close();
      }
    });

    var hintDate = null;

    return {
      element: wrapper,
      getDate: function() { return selectedDate; },
      rebuild: function() { buildHTML(); renderCalendar(); },
      setHintDate: function(d) { hintDate = d; },
      setDate: function(date) {
        selectedDate = date;
        if (date) {
          viewYear = date.getFullYear();
          viewMonth = date.getMonth();
        }
        var els = getElements();
        els.input.value = date ? formatDate(date) : '';
        renderCalendar();
      },
    };
  }

  // ── Page Content ──────────────────────────────────────────────────

  function renderImpressumPage() {
    return '<a href="#" class="back-link">' + t('backToCalculator') + '</a>' +
      '<section class="page-content">' +
      '<h1>Impressum</h1>' +
      '<p>Angaben gem&auml;&szlig; &sect; 5 DDG</p>' +
      '<p>Markus Sanwald<br><br>Am F&ouml;llbach 39<br>72649 Wolfschlugen</p>' +
      '<p><strong>Vertreten durch:</strong><br>Markus Sanwald</p>' +
      '<p><strong>Kontakt:</strong><br>Telefon: +49-70229791487<br>E-Mail: <a href="mailto:info@tfw-rechner.de">info@tfw-rechner.de</a></p>' +
      '<p><strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle</strong><br>Wir nehmen nicht an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil und sind dazu auch nicht verpflichtet.</p>' +
      '<p><strong>Haftungsausschluss:</strong></p>' +
      '<p><strong>Haftung f&uuml;r Inhalte</strong><br>Die Inhalte unserer Seiten wurden mit gr&ouml;&szlig;ter Sorgfalt erstellt. F&uuml;r die Richtigkeit, Vollst&auml;ndigkeit und Aktualit&auml;t der Inhalte k&ouml;nnen wir jedoch keine Gew&auml;hr &uuml;bernehmen. Als Diensteanbieter sind wir gem&auml;&szlig; &sect; 7 Abs.1 DDG f&uuml;r eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach &sect;&sect; 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, &uuml;bermittelte oder gespeicherte fremde Informationen zu &uuml;berwachen oder nach Umst&auml;nden zu forschen, die auf eine rechtswidrige T&auml;tigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unber&uuml;hrt. Eine diesbez&uuml;gliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung m&ouml;glich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>' +
      '<p><strong>Haftung f&uuml;r Links</strong><br>Unser Angebot enth&auml;lt Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb k&ouml;nnen wir f&uuml;r diese fremden Inhalte auch keine Gew&auml;hr &uuml;bernehmen. F&uuml;r die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf m&ouml;gliche Rechtsverst&ouml;&szlig;e &uuml;berpr&uuml;ft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>' +
      '<p><strong>Urheberrecht</strong><br>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielf&auml;ltigung, Bearbeitung, Verbreitung und jede Art der Verwertung au&szlig;erhalb der Grenzen des Urheberrechtes bed&uuml;rfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur f&uuml;r den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>' +
      '<p class="imprint-credit">Impressum von <a href="https://impressum-generator.de" rel="dofollow">Impressum-Generator.de</a>. Powered by <a href="https://www.kanzlei-hasselbach.de/" rel="nofollow">Franziska Hasselbach, Bonn</a>.</p>' +
      '</section>';
  }

  function renderDatenschutzPage() {
    return '<a href="#" class="back-link">' + t('backToCalculator') + '</a>' +
      '<section class="page-content">' +
      '<h1>Datenschutzerkl&auml;rung</h1>' +
      '<h2>Allgemeiner Hinweis und Pflichtinformationen</h2>' +
      '<h3>Benennung der verantwortlichen Stelle</h3>' +
      '<p>Die verantwortliche Stelle f&uuml;r die Datenverarbeitung auf dieser Website ist:</p>' +
      '<p>Markus Sanwald<br>Am F&ouml;llbach 39<br>72649 Wolfschlugen</p>' +
      '<p>Die verantwortliche Stelle entscheidet allein oder gemeinsam mit anderen &uuml;ber die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, Kontaktdaten o.&nbsp;&Auml;.).</p>' +
      '<h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>' +
      '<p>Nur mit Ihrer ausdr&uuml;cklichen Einwilligung sind einige Vorg&auml;nge der Datenverarbeitung m&ouml;glich. Ein Widerruf Ihrer bereits erteilten Einwilligung ist jederzeit m&ouml;glich. F&uuml;r den Widerruf gen&uuml;gt eine formlose Mitteilung per E-Mail. Die Rechtm&auml;&szlig;igkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unber&uuml;hrt.</p>' +
      '<h3>Recht auf Beschwerde bei der zust&auml;ndigen Aufsichtsbeh&ouml;rde</h3>' +
      '<p>Als Betroffener steht Ihnen im Falle eines datenschutzrechtlichen Versto&szlig;es ein Beschwerderecht bei der zust&auml;ndigen Aufsichtsbeh&ouml;rde zu. Zust&auml;ndige Aufsichtsbeh&ouml;rde bez&uuml;glich datenschutzrechtlicher Fragen ist der Landesdatenschutzbeauftragte des Bundeslandes, in dem sich der Sitz unseres Unternehmens befindet. Der folgende Link stellt eine Liste der Datenschutzbeauftragten sowie deren Kontaktdaten bereit: <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener">https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html</a>.</p>' +
      '<h3>Recht auf Daten&uuml;bertragbarkeit</h3>' +
      '<p>Ihnen steht das Recht zu, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erf&uuml;llung eines Vertrags automatisiert verarbeiten, an sich oder an Dritte aush&auml;ndigen zu lassen. Die Bereitstellung erfolgt in einem maschinenlesbaren Format. Sofern Sie die direkte &Uuml;bertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.</p>' +
      '<h3>Recht auf Auskunft, Berichtigung, Sperrung, L&ouml;schung</h3>' +
      '<p>Sie haben jederzeit im Rahmen der geltenden gesetzlichen Bestimmungen das Recht auf unentgeltliche Auskunft &uuml;ber Ihre gespeicherten personenbezogenen Daten, Herkunft der Daten, deren Empf&auml;nger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder L&ouml;schung dieser Daten. Diesbez&uuml;glich und auch zu weiteren Fragen zum Thema personenbezogene Daten k&ouml;nnen Sie sich jederzeit &uuml;ber die im Impressum aufgef&uuml;hrten Kontaktm&ouml;glichkeiten an uns wenden.</p>' +
      '<h3>SSL- bzw. TLS-Verschl&uuml;sselung</h3>' +
      '<p>Aus Sicherheitsgr&uuml;nden und zum Schutz der &Uuml;bertragung vertraulicher Inhalte, die Sie an uns als Seitenbetreiber senden, nutzt unsere Website eine SSL-bzw. TLS-Verschl&uuml;sselung. Damit sind Daten, die Sie &uuml;ber diese Website &uuml;bermitteln, f&uuml;r Dritte nicht mitlesbar. Sie erkennen eine verschl&uuml;sselte Verbindung an der &bdquo;https://&ldquo; Adresszeile Ihres Browsers und am Schloss-Symbol in der Browserzeile.</p>' +
      '<h2>Kontaktformular</h2>' +
      '<p>Per Kontaktformular &uuml;bermittelte Daten werden einschlie&szlig;lich Ihrer Kontaktdaten gespeichert, um Ihre Anfrage bearbeiten zu k&ouml;nnen oder um f&uuml;r Anschlussfragen bereitzustehen. Eine Weitergabe dieser Daten findet ohne Ihre Einwilligung nicht statt.</p>' +
      '<p>Je nach Art der Anfrage ist die Rechtsgrundlage f&uuml;r diese Verarbeitung Art. 6 Abs. 1 lit. b DSGVO f&uuml;r Anfragen, die Sie selbst im Rahmen einer vorvertraglichen Ma&szlig;nahme stellen oder Art. 6 Abs. 1 S. 1 lit. f DSGVO, wenn Ihre Anfrage sonstiger Art ist. Sollten personenbezogene Daten abgefragt werden, die wir nicht f&uuml;r die Erf&uuml;llung eines Vertrages oder zur Wahrung berechtigter Interessen ben&ouml;tigen, erfolgt die &Uuml;bermittlung an uns auf Basis einer von Ihnen abgegebenen Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Die Rechtm&auml;&szlig;igkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unber&uuml;hrt.</p>' +
      '<p>&Uuml;ber das Kontaktformular &uuml;bermittelte Daten verbleiben bei uns, bis Sie uns zur L&ouml;schung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder keine Notwendigkeit der Datenspeicherung mehr besteht. Zwingende gesetzliche Bestimmungen - insbesondere Aufbewahrungsfristen - bleiben unber&uuml;hrt.</p>' +
      '<p>F&uuml;r die technische &Uuml;bermittlung der Kontaktformular-Daten nutzen wir den Dienst FormSubmit.co. Beim Absenden des Formulars werden Ihre eingegebenen Daten (Name, E-Mail-Adresse, Betreff und Nachricht) &uuml;ber die Server von FormSubmit.co an unsere E-Mail-Adresse weitergeleitet. FormSubmit.co verarbeitet diese Daten ausschlie&szlig;lich zum Zweck der Weiterleitung und speichert sie nicht dauerhaft. Die Rechtsgrundlage f&uuml;r die Nutzung dieses Dienstes ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer zuverl&auml;ssigen Kontaktm&ouml;glichkeit). Weitere Informationen finden Sie in der Datenschutzerkl&auml;rung von FormSubmit: <a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener">https://formsubmit.co/privacy.pdf</a>.</p>' +
      '<h2>Cloudflare CDN</h2>' +
      '<h3>Art und Umfang der Verarbeitung</h3>' +
      '<p>Wir verwenden zur ordnungsgem&auml;&szlig;en Bereitstellung der Inhalte unserer Website Cloudflare CDN. Cloudflare CDN ist ein Dienst der Cloudflare, Inc., welcher auf unserer Website als Content Delivery Network (CDN) fungiert.</p>' +
      '<p>Ein CDN tr&auml;gt dazu bei, Inhalte unseres Onlineangebotes, insbesondere Dateien wie Grafiken oder Skripte, mit Hilfe regional oder international verteilter Server schneller bereitzustellen. Wenn Sie auf diese Inhalte zugreifen, stellen Sie eine Verbindung zu Servern der Cloudflare, Inc., her, wobei Ihre IP-Adresse und ggf. Browserdaten wie Ihr User-Agent &uuml;bermittelt werden. Diese Daten werden ausschlie&szlig;lich zu den oben genannten Zwecken und zur Aufrechterhaltung der Sicherheit und Funktionalit&auml;t von Cloudflare CDN verarbeitet.</p>' +
      '<h3>Zweck und Rechtsgrundlage</h3>' +
      '<p>Die Nutzung des Content Delivery Networks erfolgt auf Grundlage unserer berechtigten Interessen, d.h. Interesse an einer sicheren und effizienten Bereitstellung sowie der Optimierung unseres Onlineangebotes gem&auml;&szlig; Art. 6 Abs. 1 lit. f. DSGVO.</p>' +
      '<p>Wir beabsichtigen personenbezogenen Daten an Drittl&auml;nder au&szlig;erhalb des Europ&auml;ischen Wirtschaftsraums, insbesondere die USA, zu &uuml;bermitteln. Die Daten&uuml;bermittlung in die USA erfolgt nach Art. 45 Abs. 1 DSGVO auf Grundlage des Angemessenheitsbeschluss der Europ&auml;ischen Kommission. Die beteiligten US-Unternehmen und/oder deren US-Unterauftragnehmer sind nach dem EU-U.S. Data Privacy Framework (EU-U.S. DPF) zertifiziert.</p>' +
      '<h3>Speicherdauer</h3>' +
      '<p>Die konkrete Speicherdauer der verarbeiteten Daten ist nicht durch uns beeinflussbar, sondern wird von Cloudflare, Inc. bestimmt. Weitere Hinweise finden Sie in der Datenschutzerkl&auml;rung f&uuml;r Cloudflare CDN: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">https://www.cloudflare.com/privacypolicy/</a>.</p>' +
      '<p class="imprint-credit"><small>Quelle: Datenschutz-Konfigurator von <a href="https://www.hub24.de" target="_blank" rel="noopener">Herold Unternehmensberatung</a></small></p>' +
      '</section>';
  }

  function renderKontaktPage() {
    return '<a href="#" class="back-link">' + t('backToCalculator') + '</a>' +
      '<section class="page-content">' +
      '<h1>' + t('kontaktTitle') + '</h1>' +
      '<p class="contact-intro">' + t('kontaktIntro') + '</p>' +
      '<form id="contact-form" class="contact-form" action="https://formsubmit.co/info@tfw-rechner.de" method="POST">' +
      '<input type="hidden" name="_subject" value="TFW-Rechner: Kontaktformular">' +
      '<input type="hidden" name="_captcha" value="true">' +
      '<input type="hidden" name="_next" value="' + window.location.origin + window.location.pathname + '#kontakt-success">' +
      '<input type="text" name="_honey" style="display:none">' +
      '<div class="form-group"><label for="contact-name">' + t('kontaktName') + '</label><input type="text" id="contact-name" name="name" required></div>' +
      '<div class="form-group"><label for="contact-email">' + t('kontaktEmail') + '</label><input type="email" id="contact-email" name="email" required></div>' +
      '<div class="form-group"><label for="contact-subject">' + t('kontaktBetreff') + '</label>' +
      '<select id="contact-subject" name="subject">' +
      '<option value="Feedback">' + t('kontaktFeedback') + '</option>' +
      '<option value="Bug">' + t('kontaktBug') + '</option>' +
      '<option value="Feature">' + t('kontaktFeature') + '</option>' +
      '<option value="Sonstiges">' + t('kontaktSonstiges') + '</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="contact-message">' + t('kontaktNachricht') + '</label><textarea id="contact-message" name="message" rows="4" required></textarea></div>' +
      '<button type="submit" class="contact-submit">' + t('kontaktSenden') + '</button>' +
      '</form>' +
      '<p class="contact-success hidden" id="contact-success">' + t('kontaktSuccess') + '</p>' +
      '</section>';
  }

  // ── Router ────────────────────────────────────────────────────────

  var app = document.querySelector('#app');
  var header = document.querySelector('header');
  var titleEl = header.querySelector('h1');
  var subtitleEl = header.querySelector('.subtitle');
  var calculatorEl = null;
  var vonDate = null;
  var bisDate = null;
  var bruttoValue = null;
  var guthabenValue = null;
  var wochenstundenValue = 35;
  var tfwStundenValue = null;
  var tfwStartMonatValue = null; // {year, month} oder null = aktueller Monat
  var sonderzahlungen = { weihnachtsgeld: false, urlaubsgeld: false, tzug: false };
  var ECKENTGELT_BW = 3592;
  var vonPicker = null;
  var bisPicker = null;
  var resultDiv = null;
  var bdDocClickHandler = null;
  var bdDocKeyHandler = null;

  function formatCurrency(value) {
    return value.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' \u20AC';
  }

  function formatNumberDisplay(val) {
    if (val == null || val === '') return '';
    var num = parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
    if (isNaN(num)) return String(val);
    var parts = num.toFixed(num % 1 === 0 ? 0 : 2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  }

  function parseCurrencyInput(str) {
    if (!str) return null;
    var cleaned = str.replace(/\./g, '').replace(',', '.');
    var val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  }

  function setupCurrencyInput(input, onChange, allowZero) {
    var editing = false;
    input.addEventListener('focus', function() {
      editing = true;
      // Punkte entfernen beim Editieren, Komma beibehalten
      var val = parseCurrencyInput(input.value);
      if (val != null) {
        input.value = val % 1 === 0 ? String(val) : val.toFixed(2).replace('.', ',');
      }
    });
    input.addEventListener('blur', function() {
      editing = false;
      var val = parseCurrencyInput(input.value);
      if (val != null && (allowZero ? val >= 0 : val > 0)) {
        input.value = formatNumberDisplay(val);
      }
    });
    input.addEventListener('input', function() {
      var val = parseCurrencyInput(input.value);
      if (allowZero) {
        onChange(val != null && val >= 0 ? val : null);
      } else {
        onChange(val != null && val > 0 ? val : null);
      }
    });
  }

  function buildCalculator() {
    var calculator = document.createElement('div');
    calculator.className = 'calculator';

    vonPicker = createDatepicker('von', 'labelVon', function(date) {
      vonDate = date;
      if (bisPicker) bisPicker.setHintDate(date);
      if (tfwStundenValue && tfwStartMonatGroup) updateTfwStartMonatOptions();
      updateResult();
    });

    bisPicker = createDatepicker('bis', 'labelBis', function(date) {
      bisDate = date;
      updateResult();
    });

    calculator.appendChild(vonPicker.element);
    calculator.appendChild(bisPicker.element);

    var bruttoGroup = document.createElement('div');
    bruttoGroup.className = 'form-group';
    bruttoGroup.id = 'brutto-group';
    bruttoGroup.innerHTML =
      '<label for="brutto" class="label-with-tooltip">' +
      t('labelBrutto') +
      ' <span class="label-info" data-tooltip="' + t('bruttoTooltip') + '">&#9432;</span>' +
      '</label>' +
      '<div class="input-euro-group">' +
      '<input type="text" inputmode="decimal" id="brutto" placeholder="' + t('bruttoPlaceholder') + '" value="">' +
      '<span class="input-euro-suffix">\u20AC</span>' +
      '</div>';
    setupCurrencyInput(bruttoGroup.querySelector('#brutto'), function(val) {
      bruttoValue = val;
      updateResult();
    });
    calculator.appendChild(bruttoGroup);

    var guthabenGroup = document.createElement('div');
    guthabenGroup.className = 'form-group';
    guthabenGroup.id = 'guthaben-group';
    guthabenGroup.innerHTML =
      '<label for="guthaben">' + t('labelGuthaben') + '</label>' +
      '<div class="input-euro-group">' +
      '<input type="text" inputmode="decimal" id="guthaben" placeholder="' + t('guthabenPlaceholder') + '" value="">' +
      '<span class="input-euro-suffix">\u20AC</span>' +
      '</div>';
    setupCurrencyInput(guthabenGroup.querySelector('#guthaben'), function(val) {
      guthabenValue = val;
      updateResult();
    }, true);
    calculator.appendChild(guthabenGroup);

    var tfwStundenGroup = document.createElement('div');
    tfwStundenGroup.className = 'form-group';
    tfwStundenGroup.id = 'tfwstunden-group';
    tfwStundenGroup.innerHTML =
      '<label for="tfwstunden" class="label-with-tooltip">' + t('labelTfwStunden') +
      ' <span class="label-info" data-tooltip="' + t('tfwStundenTooltip') + '">&#9432;</span>' +
      '</label>' +
      '<div class="input-euro-group">' +
      '<input type="number" id="tfwstunden" min="0" step="1" placeholder="' + t('tfwStundenPlaceholder') + '" value="">' +
      '<span class="input-euro-suffix">' + t('tfwStundenSuffix') + '</span>' +
      '</div>';
    tfwStundenGroup.querySelector('#tfwstunden').addEventListener('input', function(e) {
      var val = parseFloat(e.target.value);
      tfwStundenValue = isNaN(val) || val <= 0 ? null : val;
      // Wochenarbeitszeit und Startmonat ein-/ausblenden
      wochenstundenGroup.style.display = tfwStundenValue ? '' : 'none';
      tfwStartMonatGroup.style.display = tfwStundenValue ? '' : 'none';
      if (tfwStundenValue) updateTfwStartMonatOptions();
      updateResult();
    });
    calculator.appendChild(tfwStundenGroup);

    var wochenstundenGroup = document.createElement('div');
    wochenstundenGroup.className = 'form-group';
    wochenstundenGroup.id = 'wochenstunden-group';
    wochenstundenGroup.style.display = 'none';
    wochenstundenGroup.innerHTML =
      '<label for="wochenstunden">' + t('labelWochenstunden') + '</label>' +
      '<div class="input-euro-group">' +
      '<input type="number" id="wochenstunden" min="1" max="48" step="1" placeholder="' + t('wochenstundenPlaceholder') + '" value="35">' +
      '<span class="input-euro-suffix">' + t('wochenstundenSuffix') + '</span>' +
      '</div>';
    wochenstundenGroup.querySelector('#wochenstunden').addEventListener('input', function(e) {
      var val = parseFloat(e.target.value);
      wochenstundenValue = isNaN(val) || val <= 0 ? 35 : val;
      updateResult();
    });
    calculator.appendChild(wochenstundenGroup);

    var tfwStartMonatGroup = document.createElement('div');
    tfwStartMonatGroup.className = 'form-group';
    tfwStartMonatGroup.id = 'tfw-startmonat-group';
    tfwStartMonatGroup.style.display = 'none';
    tfwStartMonatGroup.innerHTML =
      '<label for="tfw-startmonat">' + t('labelTfwStartMonat') + '</label>' +
      '<select id="tfw-startmonat"></select>';
    function updateTfwStartMonatOptions() {
      var sel = tfwStartMonatGroup.querySelector('#tfw-startmonat');
      var prev = tfwStartMonatValue;
      sel.innerHTML = '<option value="">' + t('tfwStartMonatPlaceholder') + '</option>';
      var MONTHS = getMonths();
      var now = new Date();
      var startY = now.getFullYear();
      var startM = now.getMonth();
      var endY = vonDate ? vonDate.getFullYear() : startY + 3;
      var endM = vonDate ? vonDate.getMonth() : 11;
      var cur = new Date(startY, startM, 1);
      var end = new Date(endY, endM, 1);
      while (cur < end) {
        var val = cur.getFullYear() + '-' + cur.getMonth();
        var label = MONTHS[cur.getMonth()] + ' ' + cur.getFullYear();
        sel.innerHTML += '<option value="' + val + '">' + label + '</option>';
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
      // Restore selection if still valid
      if (prev) {
        var prevVal = prev.year + '-' + prev.month;
        if (sel.querySelector('option[value="' + prevVal + '"]')) {
          sel.value = prevVal;
        } else {
          tfwStartMonatValue = null;
          sel.value = '';
        }
      }
    }
    tfwStartMonatGroup.querySelector('#tfw-startmonat').addEventListener('change', function(e) {
      if (e.target.value) {
        var parts = e.target.value.split('-');
        tfwStartMonatValue = { year: parseInt(parts[0]), month: parseInt(parts[1]) };
      } else {
        tfwStartMonatValue = null;
      }
      updateResult();
    });
    calculator.appendChild(tfwStartMonatGroup);

    var sonderzahlungenGroup = document.createElement('div');
    sonderzahlungenGroup.className = 'form-group';
    sonderzahlungenGroup.id = 'sonderzahlungen-group';
    sonderzahlungenGroup.innerHTML =
      '<label>' + t('labelSonderzahlungen') + '</label>' +
      '<div class="checkbox-group">' +
      '<label class="checkbox-label"><input type="checkbox" id="sz-urlaubsgeld"> ' + t('sonderzahlungUrlaubsgeld') + ' <span class="label-info" data-tooltip="' + t('szTooltipUrlaubsgeld') + '">&#9432;</span></label>' +
      '<label class="checkbox-label"><input type="checkbox" id="sz-weihnachtsgeld"> ' + t('sonderzahlungWeihnachtsgeld') + ' <span class="label-info" data-tooltip="' + t('szTooltipWeihnachtsgeld') + '">&#9432;</span></label>' +
      '<label class="checkbox-label"><input type="checkbox" id="sz-tzug"> ' + t('sonderzahlungTzug') + ' <span class="label-info" data-tooltip="' + t('szTooltipTzug') + '">&#9432;</span></label>' +
      '</div>';
    sonderzahlungenGroup.querySelector('#sz-urlaubsgeld').addEventListener('change', function(e) {
      sonderzahlungen.urlaubsgeld = e.target.checked;
      updateResult();
    });
    sonderzahlungenGroup.querySelector('#sz-weihnachtsgeld').addEventListener('change', function(e) {
      sonderzahlungen.weihnachtsgeld = e.target.checked;
      updateResult();
    });
    sonderzahlungenGroup.querySelector('#sz-tzug').addEventListener('change', function(e) {
      sonderzahlungen.tzug = e.target.checked;
      updateResult();
    });
    calculator.appendChild(sonderzahlungenGroup);

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

    var analyse = analysiereZeitraum(vonDate, bisDate);

    if (!analyse) {
      resultDiv.classList.remove('hidden');
      resultDiv.innerHTML =
        '<div class="result-row">' +
        '<span class="result-label">' + t('resultUngueltig') + '</span>' +
        '<span class="result-value" style="color: var(--color-accent);">' + t('resultUngueltigHint') + '</span>' +
        '</div>';
      return;
    }

    var ganzeMonateFlag = analyse.ganzeMonateFlag;
    var anzahlMonate = analyse.anzahlMonate;
    var restTageVor = analyse.restTageVor;
    var restTageNach = analyse.restTageNach;

    var html = '';

    var gesamtTage = Math.round((bisDate - vonDate) / (1000 * 60 * 60 * 24)) + 1;
    var gesamtArbeitstage = arbeitstageZwischen(vonDate, bisDate);
    html += '<div class="result-row"><span class="result-label">' + t('resultZeitraum') + '</span><span class="result-value">' + formatDate(vonDate) + ' \u2013 ' + formatDate(bisDate) + '</span></div>';
    html += '<div class="result-row" style="padding-top:0; border:none;"><span class="result-label"></span><span class="result-value" style="font-size:0.9rem; font-weight:400; color:var(--color-text-muted);">' + gesamtTage + ' ' + t('breakdownTage') + ', ' + gesamtArbeitstage + ' ' + t('breakdownArbeitstage') + '</span></div>';

    // Berechne Gesamtgehalt für den Zeitraum
    var totalSalary = 0;
    if (bruttoValue) {
      totalSalary = anzahlMonate * bruttoValue;
      if (restTageVor > 0) {
        totalSalary += (analyse.arbeitstageVor / analyse.arbeitstageVorGesamt) * bruttoValue;
      }
      if (restTageNach > 0) {
        totalSalary += (analyse.arbeitstageNach / analyse.arbeitstageNachGesamt) * bruttoValue;
      }
    }

    // Sonderzahlungen berechnen (Einbringung = Guthaben-Seite)
    // Auszahlungsmonate: T-Zug B=Feb(1), Urlaubsgeld=Jun(5), T-Zug A=Jul(6), Weihnachtsgeld=Nov(10)
    var jetzt = new Date();
    var jetztMonat = jetzt.getMonth();
    var jetztJahr = jetzt.getFullYear();
    var tfwStartM = vonDate.getMonth();
    var tfwStartJ = vonDate.getFullYear();

    function zahlungenBisStart(auszahlungsMonat) {
      var count = 0;
      for (var jahr = jetztJahr; jahr <= tfwStartJ; jahr++) {
        if (jahr === jetztJahr && auszahlungsMonat <= jetztMonat) continue;
        if (jahr === tfwStartJ && auszahlungsMonat >= tfwStartM) continue;
        count++;
      }
      return count;
    }

    var sonderzahlungenTotal = 0;
    var szDetails = [];
    var szUrlaubsgeldAnzahl = 0, szWeihnachtsgeldAnzahl = 0, szTzugAAnzahl = 0, szTzugBAnzahl = 0;
    var szUrlaubsgeldBetrag = 0, szWeihnachtsgeldBetrag = 0, szTzugABetrag = 0, szTzugBBetrag = 0;

    if (bruttoValue && sonderzahlungen.urlaubsgeld) {
      szUrlaubsgeldAnzahl = zahlungenBisStart(5);
      szUrlaubsgeldBetrag = szUrlaubsgeldAnzahl * bruttoValue * 0.69;
      if (szUrlaubsgeldBetrag > 0) {
        sonderzahlungenTotal += szUrlaubsgeldBetrag;
        szDetails.push(szUrlaubsgeldAnzahl + '\u00D7 Urlaubsgeld (' + formatCurrency(szUrlaubsgeldBetrag) + ')');
      }
    }
    if (bruttoValue && sonderzahlungen.weihnachtsgeld) {
      szWeihnachtsgeldAnzahl = zahlungenBisStart(10);
      szWeihnachtsgeldBetrag = szWeihnachtsgeldAnzahl * bruttoValue * 0.55;
      if (szWeihnachtsgeldBetrag > 0) {
        sonderzahlungenTotal += szWeihnachtsgeldBetrag;
        szDetails.push(szWeihnachtsgeldAnzahl + '\u00D7 Weihnachtsgeld (' + formatCurrency(szWeihnachtsgeldBetrag) + ')');
      }
    }
    if (sonderzahlungen.tzug) {
      if (bruttoValue) {
        szTzugAAnzahl = zahlungenBisStart(6);
        szTzugABetrag = szTzugAAnzahl * bruttoValue * 0.275;
        if (szTzugABetrag > 0) {
          sonderzahlungenTotal += szTzugABetrag;
          szDetails.push(szTzugAAnzahl + '\u00D7 T-Zug A (' + formatCurrency(szTzugABetrag) + ')');
        }
      }
      szTzugBAnzahl = zahlungenBisStart(1);
      szTzugBBetrag = szTzugBAnzahl * ECKENTGELT_BW * 0.265;
      if (szTzugBBetrag > 0) {
        sonderzahlungenTotal += szTzugBBetrag;
        szDetails.push(szTzugBAnzahl + '\u00D7 T-Zug B (' + formatCurrency(szTzugBBetrag) + ')');
      }
    }

    // TFW-Ansparen berechnen
    var tfwAnsparenValue = 0;
    var tfwAnsparenMonate = 0;
    var ansparStartJ = tfwStartMonatValue ? tfwStartMonatValue.year : jetztJahr;
    var ansparStartM = tfwStartMonatValue ? tfwStartMonatValue.month : jetztMonat;
    if (bruttoValue && tfwStundenValue) {
      var monatsStunden = wochenstundenValue * 52 / 12;
      var stundensatz = bruttoValue / monatsStunden;
      var ansparVonMonat = new Date(ansparStartJ, ansparStartM, 1);
      var tfwStartMonat = new Date(tfwStartJ, tfwStartM, 1);
      if (tfwStartMonat > ansparVonMonat) {
        tfwAnsparenMonate = (tfwStartJ - ansparStartJ) * 12
          + (tfwStartM - ansparStartM);
        tfwAnsparenValue = tfwStundenValue * stundensatz * tfwAnsparenMonate;
      }
    }

    // Blauer Kasten: Saldo
    // Sonderzahlungen sind Einbringungen (Guthaben-Seite)
    var totalGuthaben = (guthabenValue || 0) + tfwAnsparenValue + sonderzahlungenTotal;
    if (bruttoValue) {
      var saldo = totalGuthaben - totalSalary;
      var saldoColor = saldo >= 0 ? '#2e6b2e' : 'var(--color-accent)';
      html += '<div class="result-row highlight"><span class="result-label">' + t('resultSaldo') + '</span><span class="result-value" style="color: ' + saldoColor + ';">' + formatCurrency(saldo) + '</span></div>';
    }

    // Aufschlüsselung
    var monateLabel = function(n) { return n === 1 ? t('breakdownMonat') : t('breakdownMonate'); };
    html += '<div class="breakdown"><div class="breakdown-title">' + t('breakdownTitle') + '</div>';
    if (ganzeMonateFlag) {
      html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownVolleMonate') + '</span><span class="breakdown-value">' + anzahlMonate + ' ' + monateLabel(anzahlMonate) + '</span></div>';
    } else {
      if (restTageVor > 0) {
        var vorRange = formatDate(analyse.restVonDatum) + ' \u2013 ' + formatDate(analyse.restBisDatumVor);
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownResttageAnfang') + '<br><span style="font-weight:400;font-size:0.8rem;">' + vorRange + '</span></span><span class="breakdown-value">' + analyse.arbeitstageVor + ' ' + t('breakdownVonGesamt') + ' ' + analyse.arbeitstageVorGesamt + ' ' + t('breakdownArbeitstage') + '</span></div>';
      }
      if (anzahlMonate > 0) {
        var volleStart = restTageVor > 0
          ? new Date(vonDate.getFullYear(), vonDate.getMonth() + 1, 1)
          : new Date(vonDate.getFullYear(), vonDate.getMonth(), 1);
        var volleEnde = restTageNach > 0
          ? new Date(bisDate.getFullYear(), bisDate.getMonth(), 0)
          : new Date(bisDate.getFullYear(), bisDate.getMonth() + 1, 0);
        var volleRange = formatDate(volleStart) + ' \u2013 ' + formatDate(volleEnde);
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownVolleMonateLabel') + '<br><span style="font-weight:400;font-size:0.8rem;">' + volleRange + '</span></span><span class="breakdown-value">' + anzahlMonate + ' ' + monateLabel(anzahlMonate) + '</span></div>';
      } else {
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownVolleMonateLabel') + '</span><span class="breakdown-value">0 ' + t('breakdownMonate') + '</span></div>';
      }
      if (restTageNach > 0) {
        var nachRange = formatDate(analyse.restVonDatumNach) + ' \u2013 ' + formatDate(analyse.restBisDatum);
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownResttageEnde') + '<br><span style="font-weight:400;font-size:0.8rem;">' + nachRange + '</span></span><span class="breakdown-value">' + analyse.arbeitstageNach + ' ' + t('breakdownVonGesamt') + ' ' + analyse.arbeitstageNachGesamt + ' ' + t('breakdownArbeitstage') + '</span></div>';
      }
    }
    html += '</div>';

    // TFW-Entnahme und Einbringungen
    if (bruttoValue) {
      html += '<div class="breakdown">';
      html += '<div class="breakdown-row highlight"><span class="breakdown-label" style="font-weight:600; color: var(--color-primary);">' + t('breakdownGehalt') + '</span><span class="breakdown-value" style="color: var(--color-primary);">' + formatCurrency(totalSalary) + '</span></div>';
      if (guthabenValue != null && guthabenValue > 0) {
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownTfwGuthaben') + '</span><span class="breakdown-value" style="color: #2e6b2e;">' + formatCurrency(guthabenValue) + '</span></div>';
      }
      if (tfwAnsparenValue > 0) {
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownTfwAnsparen') + '<br><span style="font-weight:400;font-size:0.8rem;">' + tfwAnsparenMonate + ' ' + monateLabel(tfwAnsparenMonate) + ' \u00D7 ' + tfwStundenValue + ' Std \u00D7 ' + formatCurrency(bruttoValue / (wochenstundenValue * 52 / 12)) + '/Std</span></span><span class="breakdown-value" style="color: #2e6b2e;">' + formatCurrency(tfwAnsparenValue) + '</span></div>';
      }
      var hatSzAusgewaehlt = sonderzahlungen.urlaubsgeld || sonderzahlungen.weihnachtsgeld || sonderzahlungen.tzug;
      if (sonderzahlungenTotal > 0) {
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownSonderzahlungen') + '<br><span style="font-weight:400;font-size:0.8rem;">' + szDetails.join(', ') + '</span></span><span class="breakdown-value" style="color: #2e6b2e;">' + formatCurrency(sonderzahlungenTotal) + '</span></div>';
      } else if (hatSzAusgewaehlt) {
        html += '<div class="breakdown-row"><span class="breakdown-label">' + t('breakdownSonderzahlungen') + '<br><span style="font-weight:400;font-size:0.8rem;">' + t('szKeineVorBeginn') + '</span></span><span class="breakdown-value" style="color: var(--color-text-muted);">0,00 \u20AC</span></div>';
      }
      html += '</div>';
    }

    // Burndown-Chart (Flächendiagramm)
    if (bruttoValue) {
      var MONTHS = getMonths();
      var timelineMonths = [];
      var tmStart = new Date(ansparStartJ, ansparStartM, 1);
      var tmEnd = new Date(bisDate.getFullYear(), bisDate.getMonth(), 1);
      var tmCur = new Date(tmStart);
      while (tmCur <= tmEnd) {
        timelineMonths.push({ year: tmCur.getFullYear(), month: tmCur.getMonth() });
        tmCur = new Date(tmCur.getFullYear(), tmCur.getMonth() + 1, 1);
      }

      if (timelineMonths.length > 1 && timelineMonths.length <= 60) {
        var monthlyAnsparen = 0;
        if (tfwStundenValue && bruttoValue) {
          var msStd = wochenstundenValue * 52 / 12;
          monthlyAnsparen = tfwStundenValue * (bruttoValue / msStd);
        }

        var szEvents = [];
        if (sonderzahlungen.urlaubsgeld && bruttoValue) {
          szEvents.push({ month: 5, betrag: bruttoValue * 0.69, label: t('timelineUrlaubsgeld'), color: '#f59e0b' });
        }
        if (sonderzahlungen.weihnachtsgeld && bruttoValue) {
          szEvents.push({ month: 10, betrag: bruttoValue * 0.55, label: t('timelineWeihnachtsgeld'), color: '#8b5cf6' });
        }
        if (sonderzahlungen.tzug) {
          if (bruttoValue) {
            szEvents.push({ month: 6, betrag: bruttoValue * 0.275, label: t('timelineTzugA'), color: '#ec4899' });
          }
          szEvents.push({ month: 1, betrag: ECKENTGELT_BW * 0.265, label: t('timelineTzugB'), color: '#14b8a6' });
        }

        // Kumulativen Kontostand berechnen
        var points = []; // {label, balance, isAnspar, szHits: []}
        var balance = guthabenValue || 0;
        var szMarkers = [];

        for (var ti = 0; ti < timelineMonths.length; ti++) {
          var tm = timelineMonths[ti];
          var isAnspar = tm.year < tfwStartJ || (tm.year === tfwStartJ && tm.month < tfwStartM);
          var szHits = [];

          var monatAnsparen = 0;
          var monatEntnahme = 0;
          if (isAnspar) {
            monatAnsparen = monthlyAnsparen;
            balance += monthlyAnsparen;
            for (var si = 0; si < szEvents.length; si++) {
              if (tm.month === szEvents[si].month && !(tm.year === ansparStartJ && tm.month <= ansparStartM)) {
                balance += szEvents[si].betrag;
                szHits.push(szEvents[si]);
              }
            }
          } else {
            // Entnahme: anteilig für Randmonate
            var isFirstMonth = (tm.year === vonDate.getFullYear() && tm.month === vonDate.getMonth());
            var isLastMonth = (tm.year === bisDate.getFullYear() && tm.month === bisDate.getMonth());
            monatEntnahme = bruttoValue;
            if (isFirstMonth && restTageVor > 0) {
              monatEntnahme = (analyse.arbeitstageVor / analyse.arbeitstageVorGesamt) * bruttoValue;
            } else if (isLastMonth && restTageNach > 0) {
              monatEntnahme = (analyse.arbeitstageNach / analyse.arbeitstageNachGesamt) * bruttoValue;
            }
            balance -= monatEntnahme;
          }

          points.push({
            label: MONTHS[tm.month] + (ti === 0 || tm.month === 0 ? ' ' + tm.year : ''),
            balance: balance,
            isAnspar: isAnspar,
            szHits: szHits,
            ansparen: monatAnsparen,
            entnahme: monatEntnahme
          });

          for (var sj = 0; sj < szHits.length; sj++) {
            szMarkers.push({ index: ti, sz: szHits[sj], balance: balance });
          }
        }

        // Beantragungsfrist berechnen
        var gesamtMonateDauerBD = anzahlMonate + (restTageVor > 0 ? 1 : 0) + (restTageNach > 0 ? 1 : 0);
        var fristMonateBD;
        if (gesamtTage <= 31) { fristMonateBD = 1; }
        else if (gesamtMonateDauerBD <= 6) { fristMonateBD = 3; }
        else { fristMonateBD = 6; }
        var fristDatumBD = new Date(vonDate.getFullYear(), vonDate.getMonth() - fristMonateBD + 1, 0);
        var fristMonthIdx = -1;
        for (var fi = 0; fi < timelineMonths.length; fi++) {
          var ftm = timelineMonths[fi];
          if (ftm.year === fristDatumBD.getFullYear() && ftm.month === fristDatumBD.getMonth()) {
            fristMonthIdx = fi; break;
          }
        }

        // SVG Dimensionen
        var svgW = 600, svgH = 240;
        var padL = 55, padR = 10, padT = 45, padB = 35;
        var chartW = svgW - padL - padR;
        var chartH = svgH - padT - padB;

        // Y-Achse: min/max bestimmen
        var minBal = 0, maxBal = 0;
        for (var pi = 0; pi < points.length; pi++) {
          if (points[pi].balance < minBal) minBal = points[pi].balance;
          if (points[pi].balance > maxBal) maxBal = points[pi].balance;
        }
        var startBal = guthabenValue || 0;
        if (startBal > maxBal) maxBal = startBal;
        if (startBal < minBal) minBal = startBal;
        var range = maxBal - minBal;
        if (range === 0) range = 1000;
        maxBal += range * 0.1;
        // Y-Achse bei 0 starten wenn Saldo nie negativ wird
        if (minBal >= 0) {
          minBal = 0;
        } else {
          minBal -= range * 0.1;
        }

        function yPos(val) { return padT + chartH - ((val - minBal) / (maxBal - minBal)) * chartH; }
        function xPos(idx) { return padL + (idx / (points.length - 1)) * chartW; }

        var yZero = yPos(0);

        // SVG bauen
        var chartId = 'burndown-' + Date.now();
        var svg = '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" class="burndown-svg" id="' + chartId + '">';

        // Phasen-Hintergrund und Header-Banner
        var ansparEndIdx = -1;
        for (var ai = 0; ai < points.length; ai++) {
          if (points[ai].isAnspar) ansparEndIdx = ai;
        }
        var stepW = chartW / (points.length - 1);
        if (ansparEndIdx >= 0) {
          var phaseX = padL;
          var phaseBorderX = xPos(ansparEndIdx) + stepW * 0.5;
          var phaseW = phaseBorderX - padL;
          var freiW = padL + chartW - phaseBorderX;
          // Hintergrund-Flächen (stärker)
          svg += '<rect x="' + phaseX + '" y="' + padT + '" width="' + phaseW + '" height="' + chartH + '" fill="rgba(59,130,246,0.08)"/>';
          svg += '<rect x="' + phaseBorderX + '" y="' + padT + '" width="' + freiW + '" height="' + chartH + '" fill="rgba(226,0,26,0.08)"/>';
          // Phasen-Trennlinie
          svg += '<line x1="' + phaseBorderX + '" y1="0" x2="' + phaseBorderX + '" y2="' + (svgH - padB) + '" stroke="#9ca3af" stroke-width="1" stroke-dasharray="6,4"/>';
          // Header-Banner oben
          svg += '<rect x="' + phaseX + '" y="0" width="' + phaseW + '" height="' + (padT - 5) + '" rx="4" fill="#3b82f6" opacity="0.12"/>';
          svg += '<text x="' + (phaseX + phaseW / 2) + '" y="' + ((padT - 5) / 2 + 5) + '" text-anchor="middle" class="phase-label" fill="#2563eb">' + t('timelineAnsparphase') + '</text>';
          svg += '<rect x="' + phaseBorderX + '" y="0" width="' + freiW + '" height="' + (padT - 5) + '" rx="4" fill="#e2001a" opacity="0.12"/>';
          svg += '<text x="' + (phaseBorderX + freiW / 2) + '" y="' + ((padT - 5) / 2 + 5) + '" text-anchor="middle" class="phase-label" fill="#e2001a">' + t('timelineFreistellung') + '</text>';
        }

        // Nulllinie
        if (minBal < 0) {
          svg += '<line x1="' + padL + '" y1="' + yZero + '" x2="' + (padL + chartW) + '" y2="' + yZero + '" stroke="#999" stroke-width="0.5" stroke-dasharray="4,3"/>';
          svg += '<text x="' + (padL - 5) + '" y="' + (yZero + 3) + '" text-anchor="end" class="axis-label">0</text>';
        }

        // Fläche: grün (über 0)
        var linePoints = '';
        linePoints += padL + ',' + yPos(startBal) + ' ';
        for (var lp = 0; lp < points.length; lp++) {
          linePoints += xPos(lp) + ',' + yPos(points[lp].balance) + ' ';
        }
        var areaGreen = padL + ',' + Math.min(yZero, yPos(startBal)) + ' ';
        for (var ag = 0; ag < points.length; ag++) {
          var yVal = yPos(points[ag].balance);
          areaGreen += xPos(ag) + ',' + Math.min(yZero, yVal) + ' ';
        }
        for (var agr = points.length - 1; agr >= 0; agr--) {
          areaGreen += xPos(agr) + ',' + yZero + ' ';
        }
        areaGreen += padL + ',' + yZero;
        svg += '<polygon points="' + areaGreen + '" fill="rgba(34,197,94,0.2)"/>';

        // Fläche rot (unter 0)
        if (minBal < 0) {
          var areaRed = padL + ',' + Math.max(yZero, yPos(startBal)) + ' ';
          for (var ar = 0; ar < points.length; ar++) {
            var yValR = yPos(points[ar].balance);
            areaRed += xPos(ar) + ',' + Math.max(yZero, yValR) + ' ';
          }
          for (var arr = points.length - 1; arr >= 0; arr--) {
            areaRed += xPos(arr) + ',' + yZero + ' ';
          }
          areaRed += padL + ',' + yZero;
          svg += '<polygon points="' + areaRed + '" fill="rgba(226,0,26,0.15)"/>';
        }

        // Linie
        svg += '<polyline points="' + linePoints + '" fill="none" stroke="#003d6b" stroke-width="2" stroke-linejoin="round"/>';

        // Startpunkt (Guthaben)
        svg += '<circle cx="' + padL + '" cy="' + yPos(startBal) + '" r="4" fill="#22c55e" stroke="#fff" stroke-width="1.5"/>';

        // Datenpunkte
        for (var dp = 0; dp < points.length; dp++) {
          var dotColor = points[dp].isAnspar ? '#3b82f6' : '#e2001a';
          svg += '<circle cx="' + xPos(dp) + '" cy="' + yPos(points[dp].balance) + '" r="3" fill="' + dotColor + '" stroke="#fff" stroke-width="1.5"/>';
        }

        // Sonderzahlungs-Marker
        for (var mk = 0; mk < szMarkers.length; mk++) {
          var m = szMarkers[mk];
          var mx = xPos(m.index);
          var my = yPos(m.balance);
          svg += '<circle cx="' + mx + '" cy="' + my + '" r="6" fill="' + m.sz.color + '" stroke="#fff" stroke-width="2"/>';
          svg += '<text x="' + mx + '" y="' + (my - 10) + '" text-anchor="middle" class="sz-marker-label" fill="' + m.sz.color + '">' + m.sz.label + '</text>';
        }

        // Antragsfrist-Linie
        if (fristMonthIdx >= 0) {
          var fristX = xPos(fristMonthIdx);
          svg += '<line x1="' + fristX + '" y1="' + padT + '" x2="' + fristX + '" y2="' + (svgH - padB) + '" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5,3"/>';
          svg += '<text x="' + (fristX + 4) + '" y="' + (svgH - padB - 5) + '" class="sz-marker-label" fill="#d97706">' + t('timelineAntragsfrist') + '</text>';
        }

        // Y-Achse Werte
        var yLabels = [maxBal, (maxBal + minBal) / 2, minBal];
        for (var yl = 0; yl < yLabels.length; yl++) {
          var yv = yLabels[yl];
          var yy = yPos(yv);
          if (Math.abs(yv) > 0.01 || yl === 1) {
            svg += '<text x="' + (padL - 5) + '" y="' + (yy + 3) + '" text-anchor="end" class="axis-label">' + Math.round(yv).toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE') + ' \u20AC</text>';
            svg += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (padL + chartW) + '" y2="' + yy + '" stroke="#e5e7eb" stroke-width="0.5"/>';
          }
        }

        // X-Achse Labels
        var labelStep = points.length > 12 ? Math.ceil(points.length / 12) : 1;
        for (var xl = 0; xl < points.length; xl++) {
          if (xl % labelStep === 0 || xl === points.length - 1) {
            svg += '<text x="' + xPos(xl) + '" y="' + (svgH - 5) + '" text-anchor="middle" class="axis-label">' + points[xl].label + '</text>';
          }
        }

        // Unsichtbare Klick-Bereiche pro Monat (Startpunkt + Datenpunkte)
        svg += '<rect class="bd-hitarea" data-bd-idx="-1" x="' + (padL - stepW * 0.5) + '" y="' + padT + '" width="' + stepW + '" height="' + chartH + '" fill="transparent" style="cursor:pointer"/>';
        for (var hi = 0; hi < points.length; hi++) {
          var hx = xPos(hi) - stepW * 0.5;
          svg += '<rect class="bd-hitarea" data-bd-idx="' + hi + '" x="' + hx + '" y="' + padT + '" width="' + stepW + '" height="' + chartH + '" fill="transparent" style="cursor:pointer"/>';
        }

        svg += '</svg>';

        // Tooltip-Container
        html += '<div class="timeline-chart" id="timeline-chart-container">';
        html += '<div class="breakdown-title" style="display:flex;justify-content:space-between;align-items:center;">' + t('timelineTitle') + '<button type="button" class="bd-expand-btn" id="bd-expand-btn" title="Vergrößern">&#x26F6;</button></div>';
        html += svg;
        html += '<div class="bd-tooltip" id="' + chartId + '-tip" style="display:none;"></div>';

        // Legende
        html += '<div class="timeline-legend">';
        if (startBal > 0) {
          html += '<div class="timeline-legend-item"><span class="timeline-legend-color" style="background:#22c55e;"></span>' + t('timelineGuthaben') + '</div>';
        }
        if (monthlyAnsparen > 0) {
          html += '<div class="timeline-legend-item"><span class="timeline-legend-color" style="background:#3b82f6;"></span>' + t('timelineAnsparen') + '</div>';
        }
        for (var sn = 0; sn < szEvents.length; sn++) {
          html += '<div class="timeline-legend-item"><span class="timeline-legend-color" style="background:' + szEvents[sn].color + ';border-radius:50%;"></span>' + szEvents[sn].label + '</div>';
        }
        html += '<div class="timeline-legend-item"><span class="timeline-legend-color" style="background:var(--color-accent);"></span>' + t('timelineEntnahme') + '</div>';
        if (fristMonthIdx >= 0) {
          html += '<div class="timeline-legend-item"><span class="timeline-legend-color" style="background:#d97706;border-radius:0;height:2px;width:14px;border-top:1.5px dashed #d97706;background:transparent;"></span>' + t('timelineAntragsfrist') + '</div>';
        }
        html += '</div>';
        html += '</div>';

        // Tooltip-Daten merken für Event-Listener
        var bdTooltipData = [{ label: t('timelineGuthaben'), balance: startBal, szHits: [], ansparen: 0, entnahme: 0 }];
        for (var bd = 0; bd < points.length; bd++) {
          bdTooltipData.push({ label: points[bd].label, balance: points[bd].balance, szHits: points[bd].szHits, isAnspar: points[bd].isAnspar, ansparen: points[bd].ansparen, entnahme: points[bd].entnahme });
        }
      }
    }

    // Beantragungsfristen Info-Text
    if (vonDate) {
      var gesamtMonateDauer = anzahlMonate + (restTageVor > 0 ? 1 : 0) + (restTageNach > 0 ? 1 : 0);
      var fristMonate;
      var fristText;
      if (gesamtTage <= 31) {
        fristMonate = 1;
        fristText = t('fristKurz');
      } else if (gesamtMonateDauer <= 6) {
        fristMonate = 3;
        fristText = t('fristMittel');
      } else {
        fristMonate = 6;
        fristText = t('fristLang');
      }
      var fristDatum = new Date(vonDate.getFullYear(), vonDate.getMonth() - fristMonate + 1, 0);
      html += '<div class="info-box" style="margin-top:2rem;">';
      html += '<div class="info-box-title">' + t('fristTitle') + '</div>';
      html += '<p>' + fristText + '</p>';
      html += '<p style="font-weight:600;">' + t('fristDeadline') + ' ' + formatDate(fristDatum) + '</p>';
      html += '</div>';
    }

    // Disclaimer
    html += '<p class="disclaimer">' + t('disclaimer') + '</p>';

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = html;

    // Tooltip-Interaktion für Burndown-Chart
    if (typeof chartId !== 'undefined' && typeof bdTooltipData !== 'undefined') {
      var svgEl = document.getElementById(chartId);
      var tipEl = document.getElementById(chartId + '-tip');
      if (svgEl && tipEl) {
        function showBdTooltip(e, rect) {
          var idx = parseInt(rect.getAttribute('data-bd-idx'));
          var d = bdTooltipData[idx + 1]; // +1 weil startpunkt bei -1
          if (!d) return;
          var lines = '<strong>' + d.label + '</strong>';
          lines += '<br>' + t('resultSaldo') + ': <strong>' + formatCurrency(d.balance) + '</strong>';
          if (d.ansparen > 0) {
            lines += '<br>+ ' + t('timelineAnsparen') + ': ' + formatCurrency(d.ansparen);
          }
          if (d.entnahme > 0) {
            lines += '<br>\u2212 ' + t('timelineEntnahme') + ': ' + formatCurrency(d.entnahme);
          }
          if (d.szHits && d.szHits.length > 0) {
            for (var si = 0; si < d.szHits.length; si++) {
              lines += '<br>+ ' + d.szHits[si].label + ': ' + formatCurrency(d.szHits[si].betrag);
            }
          }
          tipEl.innerHTML = lines;
          var svgRect = svgEl.getBoundingClientRect();
          var posX = e.clientX - svgRect.left;
          var posY = e.clientY - svgRect.top;
          tipEl.style.display = 'block';
          var tipW = tipEl.offsetWidth;
          if (posX + tipW + 10 > svgRect.width) {
            tipEl.style.left = (posX - tipW - 10) + 'px';
          } else {
            tipEl.style.left = (posX + 10) + 'px';
          }
          tipEl.style.top = (posY - 10) + 'px';
        }
        svgEl.querySelectorAll('.bd-hitarea').forEach(function(rect) {
          rect.addEventListener('mouseover', function(e) { showBdTooltip(e, rect); });
          rect.addEventListener('mousemove', function(e) { showBdTooltip(e, rect); });
          rect.addEventListener('click', function(e) { showBdTooltip(e, rect); });
        });
        svgEl.addEventListener('mouseleave', function() {
          tipEl.style.display = 'none';
        });
        if (bdDocClickHandler) document.removeEventListener('click', bdDocClickHandler);
        bdDocClickHandler = function(e) {
          if (!svgEl.contains(e.target)) {
            tipEl.style.display = 'none';
          }
        };
        document.addEventListener('click', bdDocClickHandler);
      }
    }

    // Expand-Button für Burndown-Chart
    var expandBtn = document.getElementById('bd-expand-btn');
    var chartContainer = document.getElementById('timeline-chart-container');
    if (expandBtn && chartContainer) {
      expandBtn.addEventListener('click', function() {
        var isExpanded = chartContainer.classList.toggle('bd-expanded');
        expandBtn.innerHTML = isExpanded ? '&#x2716;' : '&#x26F6;';
        document.body.style.overflow = isExpanded ? 'hidden' : '';
      });
      if (bdDocKeyHandler) document.removeEventListener('keydown', bdDocKeyHandler);
      bdDocKeyHandler = function(e) {
        if (e.key === 'Escape' && chartContainer.classList.contains('bd-expanded')) {
          chartContainer.classList.remove('bd-expanded');
          expandBtn.innerHTML = '&#x26F6;';
          document.body.style.overflow = '';
        }
      };
      document.addEventListener('keydown', bdDocKeyHandler);
    }
  }

  function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
  }

  function rebuildPage() {
    titleEl.textContent = t('title');
    subtitleEl.textContent = t('subtitle');

    var footer = document.querySelector('footer');
    if (footer) {
      footer.innerHTML =
        '<p class="footer-feedback">' + t('footerFeedback') + ' <a href="mailto:info@tfw-rechner.de">info@tfw-rechner.de</a></p>' +
        '<p class="footer-links">' +
        '<a href="#impressum" data-nav="impressum">' + t('footerImpressum') + '</a>' +
        '<span class="footer-sep">&middot;</span>' +
        '<a href="#datenschutz" data-nav="datenschutz">' + t('footerDatenschutz') + '</a>' +
        '<span class="footer-sep">&middot;</span>' +
        '<a href="https://github.com/markus-sanwald/tfw-rechner" target="_blank" rel="noopener">' + t('footerGithub') + '</a>' +
        '</p>';
      footer.querySelectorAll('[data-nav]').forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.hash = link.dataset.nav;
        });
      });
    }

    updateLangButtons();

    // Preserve values and rebuild calculator UI with new language
    var savedVon = vonDate;
    var savedBis = bisDate;
    var savedBrutto = bruttoValue;
    var savedGuthaben = guthabenValue;
    var savedWochenstunden = wochenstundenValue;
    var savedTfwStunden = tfwStundenValue;
    var savedTfwStartMonat = tfwStartMonatValue;
    var savedSonderzahlungen = { weihnachtsgeld: sonderzahlungen.weihnachtsgeld, urlaubsgeld: sonderzahlungen.urlaubsgeld, tzug: sonderzahlungen.tzug };

    calculatorEl = null;
    vonDate = null;
    bisDate = null;
    bruttoValue = null;
    guthabenValue = null;
    wochenstundenValue = 35;
    tfwStundenValue = null;
    tfwStartMonatValue = null;
    sonderzahlungen = { weihnachtsgeld: false, urlaubsgeld: false, tzug: false };
    handleHash();

    // Restore values after rebuild
    if (savedVon && vonPicker) {
      vonDate = savedVon;
      vonPicker.setDate(savedVon);
    }
    if (savedBis && bisPicker) {
      bisDate = savedBis;
      bisPicker.setDate(savedBis);
    }
    if (savedBrutto != null) {
      bruttoValue = savedBrutto;
      var bruttoInput = document.querySelector('#brutto');
      if (bruttoInput) bruttoInput.value = formatNumberDisplay(savedBrutto);
    }
    if (savedGuthaben != null) {
      guthabenValue = savedGuthaben;
      var guthabenInput = document.querySelector('#guthaben');
      if (guthabenInput) guthabenInput.value = formatNumberDisplay(savedGuthaben);
    }
    if (savedTfwStunden != null) {
      tfwStundenValue = savedTfwStunden;
      var tfwInput = document.querySelector('#tfwstunden');
      if (tfwInput) tfwInput.value = savedTfwStunden;
      var wsGroup = document.querySelector('#wochenstunden-group');
      if (wsGroup) wsGroup.style.display = '';
      var smGroup = document.querySelector('#tfw-startmonat-group');
      if (smGroup) {
        smGroup.style.display = '';
        // rebuild options, then restore
        if (typeof updateTfwStartMonatOptions === 'function') updateTfwStartMonatOptions();
      }
    }
    if (savedTfwStartMonat != null) {
      tfwStartMonatValue = savedTfwStartMonat;
      var smSel = document.querySelector('#tfw-startmonat');
      if (smSel) smSel.value = savedTfwStartMonat.year + '-' + savedTfwStartMonat.month;
    }
    if (savedWochenstunden !== 35) {
      wochenstundenValue = savedWochenstunden;
      var wsInput = document.querySelector('#wochenstunden');
      if (wsInput) wsInput.value = savedWochenstunden;
    }
    if (savedSonderzahlungen.urlaubsgeld) {
      sonderzahlungen.urlaubsgeld = true;
      var cb = document.querySelector('#sz-urlaubsgeld');
      if (cb) cb.checked = true;
    }
    if (savedSonderzahlungen.weihnachtsgeld) {
      sonderzahlungen.weihnachtsgeld = true;
      var cb2 = document.querySelector('#sz-weihnachtsgeld');
      if (cb2) cb2.checked = true;
    }
    if (savedSonderzahlungen.tzug) {
      sonderzahlungen.tzug = true;
      var cb3 = document.querySelector('#sz-tzug');
      if (cb3) cb3.checked = true;
    }

    updateResult();
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
        var form = app.querySelector('#contact-form');
        var success = app.querySelector('#contact-success');
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

    app.querySelectorAll('.back-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.hash = '';
      });
    });

    window.scrollTo(0, 0);
  }

  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    navigate(hash || 'home');
  }

  function initLangSwitch() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = btn.dataset.lang;
        if (lang !== getLang()) {
          setLang(lang);
          rebuildPage();
        }
      });
    });
    updateLangButtons();
  }

  document.querySelectorAll('[data-nav]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = link.dataset.nav;
    });
  });

  window.addEventListener('hashchange', handleHash);

  document.documentElement.lang = getLang();
  titleEl.textContent = t('title');
  subtitleEl.textContent = t('subtitle');
  initLangSwitch();
  handleHash();
})();
