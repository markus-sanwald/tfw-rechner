// ── i18n translations ─────────────────────────────────────────────

const translations = {
  de: {
    title: 'TFW Rechner',
    subtitle: 'Tarifvertrag für die Fleischwirtschaft',
    labelVon: 'Zeitraum von',
    labelBis: 'Zeitraum bis',
    labelBrutto: 'Monatliches Bruttogehalt',
    bruttoPlaceholder: '0',
    bruttoTooltip: 'Sonderzahlungen wie Weihnachtsgeld, Urlaubsgeld oder Prämien spielen hier keine Rolle. Es zählt nur das reguläre monatliche Bruttogehalt.',
    resultZeitraum: 'Zeitraum',
    resultGanzeMonate: 'Ganze Monate',
    resultJa: 'Ja',
    resultNein: 'Nein',
    resultUngueltig: 'Ungültiger Zeitraum',
    resultUngueltigHint: 'Enddatum muss nach Startdatum liegen',
    breakdownTitle: 'Aufschlüsselung',
    breakdownVolleMonate: 'Anzahl voller Monate',
    breakdownResttageAnfang: 'Resttage am Anfang',
    breakdownVolleMonateLabel: 'Volle Monate',
    breakdownResttageEnde: 'Resttage am Ende',
    breakdownTage: 'Tage',
    breakdownGehalt: 'Anteiliges Bruttogehalt',
    labelGuthaben: 'Aktuelles TFW-Guthaben',
    guthabenPlaceholder: '0',
    breakdownRestguthaben: 'Verbleibendes TFW-Guthaben',
    dpToday: 'Heute',
    dpClear: 'Löschen',
    dpPrevYear: 'Vorheriges Jahr',
    dpNextYear: 'Nächstes Jahr',
    dpPrevMonth: 'Vorheriger Monat',
    dpNextMonth: 'Nächster Monat',
    dpPlaceholder: 'TT.MM.JJJJ',
    backToCalculator: '\u2190 Zurück zum Rechner',
    footerKontakt: 'Kontakt',
    footerImpressum: 'Impressum',
    footerDatenschutz: 'Datenschutz',
    kontaktTitle: 'Kontakt',
    kontaktIntro: 'Anregungen, Fehler oder Feedback? Schreib mir eine Nachricht:',
    kontaktName: 'Name',
    kontaktEmail: 'E-Mail',
    kontaktBetreff: 'Betreff',
    kontaktNachricht: 'Nachricht',
    kontaktSenden: 'Nachricht senden',
    kontaktFeedback: 'Feedback',
    kontaktBug: 'Fehler melden',
    kontaktFeature: 'Verbesserungsvorschlag',
    kontaktSonstiges: 'Sonstiges',
    kontaktSuccess: 'Danke für deine Nachricht! Sie wurde erfolgreich gesendet.',
  },
  en: {
    title: 'TFW Calculator',
    subtitle: 'Collective Agreement for the Meat Industry',
    labelVon: 'Period from',
    labelBis: 'Period to',
    labelBrutto: 'Monthly gross salary',
    bruttoPlaceholder: '0',
    bruttoTooltip: 'Special payments such as Christmas bonus, holiday pay or bonuses are not relevant here. Only the regular monthly gross salary counts.',
    resultZeitraum: 'Period',
    resultGanzeMonate: 'Full months',
    resultJa: 'Yes',
    resultNein: 'No',
    resultUngueltig: 'Invalid period',
    resultUngueltigHint: 'End date must be after start date',
    breakdownTitle: 'Breakdown',
    breakdownVolleMonate: 'Number of full months',
    breakdownResttageAnfang: 'Remaining days at start',
    breakdownVolleMonateLabel: 'Full months',
    breakdownResttageEnde: 'Remaining days at end',
    breakdownTage: 'days',
    breakdownGehalt: 'Proportional gross salary',
    labelGuthaben: 'Current TFW balance',
    guthabenPlaceholder: '0',
    breakdownRestguthaben: 'Remaining TFW balance',
    dpToday: 'Today',
    dpClear: 'Clear',
    dpPrevYear: 'Previous year',
    dpNextYear: 'Next year',
    dpPrevMonth: 'Previous month',
    dpNextMonth: 'Next month',
    dpPlaceholder: 'DD.MM.YYYY',
    backToCalculator: '\u2190 Back to calculator',
    footerKontakt: 'Contact',
    footerImpressum: 'Legal Notice',
    footerDatenschutz: 'Privacy Policy',
    kontaktTitle: 'Contact',
    kontaktIntro: 'Suggestions, bugs or feedback? Send me a message:',
    kontaktName: 'Name',
    kontaktEmail: 'Email',
    kontaktBetreff: 'Subject',
    kontaktNachricht: 'Message',
    kontaktSenden: 'Send message',
    kontaktFeedback: 'Feedback',
    kontaktBug: 'Report a bug',
    kontaktFeature: 'Feature request',
    kontaktSonstiges: 'Other',
    kontaktSuccess: 'Thank you for your message! It has been sent successfully.',
  }
};

let currentLang = localStorage.getItem('tfw-lang') || 'de';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('tfw-lang', lang);
  document.documentElement.lang = lang;
}

export function t(key) {
  return translations[currentLang][key] || translations.de[key] || key;
}
