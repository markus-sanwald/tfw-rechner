/**
 * Prüft ob ein Datum der erste Tag eines Monats ist.
 */
export function isFirstOfMonth(date) {
  return date.getDate() === 1;
}

/**
 * Prüft ob ein Datum der letzte Tag eines Monats ist.
 */
export function isLastOfMonth(date) {
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return nextDay.getDate() === 1;
}

/**
 * Analysiert einen Zeitraum und ermittelt, ob es sich um ganze Monate handelt.
 *
 * Ein Zeitraum besteht aus ganzen Monaten, wenn:
 * - Das Startdatum der 1. eines Monats ist
 * - Das Enddatum der letzte Tag eines Monats ist
 *
 * @param {Date} von - Startdatum
 * @param {Date} bis - Enddatum
 * @returns {{ ganzeMonateFlag: boolean, anzahlMonate: number, restTageVor: number, restTageNach: number }}
 */
export function analysiereZeitraum(von, bis) {
  if (!(von instanceof Date) || !(bis instanceof Date) || isNaN(von) || isNaN(bis)) {
    return null;
  }
  if (bis < von) {
    return null;
  }

  const startIstErster = isFirstOfMonth(von);
  const endeIstLetzter = isLastOfMonth(bis);
  const ganzeMonateFlag = startIstErster && endeIstLetzter;

  // Anzahl ganzer Monate im Zeitraum berechnen
  let anzahlMonate = 0;
  let restTageVor = 0;
  let restTageNach = 0;

  if (ganzeMonateFlag) {
    // Einfacher Fall: Differenz der Monate
    anzahlMonate = (bis.getFullYear() - von.getFullYear()) * 12
      + (bis.getMonth() - von.getMonth()) + 1;
  } else {
    // Ermittle den ersten vollen Monatsbeginn ab/nach von
    let ersterVollerMonat;
    if (startIstErster) {
      ersterVollerMonat = new Date(von.getFullYear(), von.getMonth(), 1);
    } else {
      ersterVollerMonat = new Date(von.getFullYear(), von.getMonth() + 1, 1);
      // Resttage am Anfang: von bis Ende des Monats von von
      const endeMonatVon = new Date(von.getFullYear(), von.getMonth() + 1, 0);
      restTageVor = endeMonatVon.getDate() - von.getDate() + 1;
    }

    // Ermittle das letzte volle Monatsende vor/bei bis
    let letztesVollesMonatsende;
    if (endeIstLetzter) {
      letztesVollesMonatsende = new Date(bis.getFullYear(), bis.getMonth() + 1, 0);
    } else {
      letztesVollesMonatsende = new Date(bis.getFullYear(), bis.getMonth(), 0);
      // Resttage am Ende: 1. des Monats von bis bis bis
      restTageNach = bis.getDate();
    }

    // Ganze Monate zwischen ersterVollerMonat und letztesVollesMonatsende
    if (letztesVollesMonatsende >= ersterVollerMonat) {
      anzahlMonate = (letztesVollesMonatsende.getFullYear() - ersterVollerMonat.getFullYear()) * 12
        + (letztesVollesMonatsende.getMonth() - ersterVollerMonat.getMonth()) + 1;
    }
  }

  return {
    ganzeMonateFlag,
    anzahlMonate,
    restTageVor,
    restTageNach,
  };
}

/**
 * Formatiert ein Datum als TT.MM.JJJJ
 */
export function formatDate(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

/**
 * Parst ein Datum im Format TT.MM.JJJJ
 */
export function parseDate(str) {
  const parts = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!parts) return null;
  const date = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  if (isNaN(date)) return null;
  return date;
}

/**
 * Gibt die Anzahl Tage in einem Monat zurück.
 */
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
