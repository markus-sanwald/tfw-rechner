var TFW = window.TFW || {};

(function () {
  /**
   * Prüft ob ein Datum der erste Tag eines Monats ist.
   */
  function isFirstOfMonth(date) {
    return date.getDate() === 1;
  }

  /**
   * Prüft ob ein Datum der letzte Tag eines Monats ist.
   */
  function isLastOfMonth(date) {
    var nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return nextDay.getDate() === 1;
  }

  /**
   * Analysiert einen Zeitraum und ermittelt, ob es sich um ganze Monate handelt.
   */
  function analysiereZeitraum(von, bis) {
    if (!(von instanceof Date) || !(bis instanceof Date) || isNaN(von) || isNaN(bis)) {
      return null;
    }
    if (bis < von) {
      return null;
    }

    var startIstErster = isFirstOfMonth(von);
    var endeIstLetzter = isLastOfMonth(bis);
    var ganzeMonateFlag = startIstErster && endeIstLetzter;

    var anzahlMonate = 0;
    var restTageVor = 0;
    var restTageNach = 0;
    // Arbeitstage-Infos für anteilige Monate
    var arbeitstageVor = 0;
    var arbeitstageVorGesamt = 0;
    var arbeitstageNach = 0;
    var arbeitstageNachGesamt = 0;
    var restVonDatum = null;
    var restBisDatumVor = null;
    var restVonDatumNach = null;
    var restBisDatum = null;

    if (ganzeMonateFlag) {
      anzahlMonate = (bis.getFullYear() - von.getFullYear()) * 12
        + (bis.getMonth() - von.getMonth()) + 1;
    } else {
      var ersterVollerMonat;
      if (startIstErster) {
        ersterVollerMonat = new Date(von.getFullYear(), von.getMonth(), 1);
      } else {
        ersterVollerMonat = new Date(von.getFullYear(), von.getMonth() + 1, 1);
        var endeMonatVon = new Date(von.getFullYear(), von.getMonth() + 1, 0);
        restTageVor = endeMonatVon.getDate() - von.getDate() + 1;
        restVonDatum = new Date(von.getFullYear(), von.getMonth(), von.getDate());
        restBisDatumVor = endeMonatVon;
        arbeitstageVor = arbeitstageZwischen(von, endeMonatVon);
        arbeitstageVorGesamt = arbeitstageImMonat(von.getFullYear(), von.getMonth());
      }

      var letztesVollesMonatsende;
      if (endeIstLetzter) {
        letztesVollesMonatsende = new Date(bis.getFullYear(), bis.getMonth() + 1, 0);
      } else {
        letztesVollesMonatsende = new Date(bis.getFullYear(), bis.getMonth(), 0);
        restTageNach = bis.getDate();
        restVonDatumNach = new Date(bis.getFullYear(), bis.getMonth(), 1);
        restBisDatum = new Date(bis.getFullYear(), bis.getMonth(), bis.getDate());
        arbeitstageNach = arbeitstageZwischen(restVonDatumNach, bis);
        arbeitstageNachGesamt = arbeitstageImMonat(bis.getFullYear(), bis.getMonth());
      }

      if (letztesVollesMonatsende >= ersterVollerMonat) {
        anzahlMonate = (letztesVollesMonatsende.getFullYear() - ersterVollerMonat.getFullYear()) * 12
          + (letztesVollesMonatsende.getMonth() - ersterVollerMonat.getMonth()) + 1;
      }
    }

    return {
      ganzeMonateFlag: ganzeMonateFlag,
      anzahlMonate: anzahlMonate,
      restTageVor: restTageVor,
      restTageNach: restTageNach,
      arbeitstageVor: arbeitstageVor,
      arbeitstageVorGesamt: arbeitstageVorGesamt,
      arbeitstageNach: arbeitstageNach,
      arbeitstageNachGesamt: arbeitstageNachGesamt,
      restVonDatum: restVonDatum,
      restBisDatumVor: restBisDatumVor,
      restVonDatumNach: restVonDatumNach,
      restBisDatum: restBisDatum,
    };
  }

  /**
   * Formatiert ein Datum als TT.MM.JJJJ
   */
  function formatDate(date) {
    var d = date.getDate().toString().padStart(2, '0');
    var m = (date.getMonth() + 1).toString().padStart(2, '0');
    var y = date.getFullYear();
    return d + '.' + m + '.' + y;
  }

  /**
   * Parst ein Datum im Format TT.MM.JJJJ
   */
  function parseDate(str) {
    var parts = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!parts) return null;
    var day = parseInt(parts[1]);
    var month = parseInt(parts[2]) - 1;
    var year = parseInt(parts[3]);
    var date = new Date(year, month, day);
    if (isNaN(date) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
    return date;
  }

  /**
   * Gibt die Anzahl Tage in einem Monat zurück.
   */
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Zählt Arbeitstage (Mo-Fr) zwischen zwei Daten (inklusive).
   */
  function arbeitstageZwischen(von, bis) {
    var count = 0;
    var current = new Date(von.getFullYear(), von.getMonth(), von.getDate());
    var end = new Date(bis.getFullYear(), bis.getMonth(), bis.getDate());
    while (current <= end) {
      var day = current.getDay(); // 0=So, 1=Mo, ..., 5=Fr, 6=Sa
      if (day >= 1 && day <= 5) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  /**
   * Zählt Arbeitstage (Mo-Fr) in einem ganzen Monat.
   */
  function arbeitstageImMonat(year, month) {
    var erster = new Date(year, month, 1);
    var letzter = new Date(year, month + 1, 0);
    return arbeitstageZwischen(erster, letzter);
  }

  TFW.isFirstOfMonth = isFirstOfMonth;
  TFW.isLastOfMonth = isLastOfMonth;
  TFW.analysiereZeitraum = analysiereZeitraum;
  TFW.formatDate = formatDate;
  TFW.parseDate = parseDate;
  TFW.daysInMonth = daysInMonth;
  TFW.arbeitstageZwischen = arbeitstageZwischen;
  TFW.arbeitstageImMonat = arbeitstageImMonat;
})();

window.TFW = TFW;
