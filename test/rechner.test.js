import { describe, it, expect, beforeAll } from 'vitest';

// Set up global TFW before loading rechner.js
beforeAll(async () => {
  window.TFW = window.TFW || {};
  await import('../src/rechner.js');
});

describe('isFirstOfMonth', () => {
  it('erkennt den 1. eines Monats', () => {
    expect(TFW.isFirstOfMonth(new Date(2025, 0, 1))).toBe(true);
    expect(TFW.isFirstOfMonth(new Date(2025, 5, 1))).toBe(true);
  });

  it('erkennt andere Tage als nicht-erster', () => {
    expect(TFW.isFirstOfMonth(new Date(2025, 0, 2))).toBe(false);
    expect(TFW.isFirstOfMonth(new Date(2025, 0, 31))).toBe(false);
  });
});

describe('isLastOfMonth', () => {
  it('erkennt den letzten Tag eines Monats', () => {
    expect(TFW.isLastOfMonth(new Date(2025, 0, 31))).toBe(true); // 31. Jan
    expect(TFW.isLastOfMonth(new Date(2025, 1, 28))).toBe(true);  // 28. Feb (kein Schaltjahr)
    expect(TFW.isLastOfMonth(new Date(2024, 1, 29))).toBe(true);  // 29. Feb (Schaltjahr)
    expect(TFW.isLastOfMonth(new Date(2025, 3, 30))).toBe(true);  // 30. Apr
  });

  it('erkennt nicht-letzte Tage', () => {
    expect(TFW.isLastOfMonth(new Date(2025, 0, 30))).toBe(false);
    expect(TFW.isLastOfMonth(new Date(2025, 1, 27))).toBe(false);
  });
});

describe('analysiereZeitraum', () => {
  it('erkennt ganze Monate (ein Monat)', () => {
    const result = TFW.analysiereZeitraum(new Date(2025, 0, 1), new Date(2025, 0, 31));
    expect(result.ganzeMonateFlag).toBe(true);
    expect(result.anzahlMonate).toBe(1);
    expect(result.restTageVor).toBe(0);
    expect(result.restTageNach).toBe(0);
  });

  it('erkennt ganze Monate (mehrere Monate)', () => {
    const result = TFW.analysiereZeitraum(new Date(2025, 0, 1), new Date(2025, 2, 31));
    expect(result.ganzeMonateFlag).toBe(true);
    expect(result.anzahlMonate).toBe(3);
  });

  it('erkennt ganze Monate über Jahreswechsel', () => {
    const result = TFW.analysiereZeitraum(new Date(2024, 10, 1), new Date(2025, 1, 28));
    expect(result.ganzeMonateFlag).toBe(true);
    expect(result.anzahlMonate).toBe(4);
  });

  it('erkennt unvollständigen Zeitraum (Start nicht am 1.)', () => {
    const result = TFW.analysiereZeitraum(new Date(2025, 0, 15), new Date(2025, 2, 31));
    expect(result.ganzeMonateFlag).toBe(false);
    expect(result.restTageVor).toBe(17); // 15.–31. Jan = 17 Tage
    expect(result.anzahlMonate).toBe(2);  // Feb + Mär
    expect(result.restTageNach).toBe(0);
    // 15.01.2025 (Mi) – 31.01.2025 (Fr): 13 Arbeitstage, Jan hat 23 Arbeitstage
    expect(result.arbeitstageVor).toBe(13);
    expect(result.arbeitstageVorGesamt).toBe(23);
  });

  it('erkennt unvollständigen Zeitraum (Ende nicht am Letzten)', () => {
    const result = TFW.analysiereZeitraum(new Date(2025, 0, 1), new Date(2025, 2, 15));
    expect(result.ganzeMonateFlag).toBe(false);
    expect(result.restTageVor).toBe(0);
    expect(result.anzahlMonate).toBe(2); // Jan + Feb
    expect(result.restTageNach).toBe(15);
    // 01.03.2025 (Sa) – 15.03.2025 (Sa): 10 Arbeitstage, Mär hat 21 Arbeitstage
    expect(result.arbeitstageNach).toBe(10);
    expect(result.arbeitstageNachGesamt).toBe(21);
  });

  it('erkennt unvollständigen Zeitraum (beide Seiten)', () => {
    const result = TFW.analysiereZeitraum(new Date(2025, 0, 10), new Date(2025, 2, 15));
    expect(result.ganzeMonateFlag).toBe(false);
    expect(result.restTageVor).toBe(22); // 10.–31. Jan = 22 Tage
    expect(result.anzahlMonate).toBe(1);  // Feb
    expect(result.restTageNach).toBe(15);
    // 10.01.2025 (Fr) – 31.01.2025 (Fr): 16 Arbeitstage
    expect(result.arbeitstageVor).toBe(16);
    expect(result.arbeitstageVorGesamt).toBe(23);
    // 01.03.2025 (Sa) – 15.03.2025 (Sa): 10 Arbeitstage
    expect(result.arbeitstageNach).toBe(10);
    expect(result.arbeitstageNachGesamt).toBe(21);
  });

  it('gibt null bei ungültigem Zeitraum zurück', () => {
    expect(TFW.analysiereZeitraum(new Date(2025, 2, 1), new Date(2025, 0, 1))).toBeNull();
  });

  it('gibt null bei ungültigen Daten zurück', () => {
    expect(TFW.analysiereZeitraum(null, new Date())).toBeNull();
    expect(TFW.analysiereZeitraum(new Date(), 'abc')).toBeNull();
  });
});

describe('formatDate', () => {
  it('formatiert ein Datum als TT.MM.JJJJ', () => {
    expect(TFW.formatDate(new Date(2025, 0, 5))).toBe('05.01.2025');
    expect(TFW.formatDate(new Date(2025, 11, 31))).toBe('31.12.2025');
  });
});

describe('parseDate', () => {
  it('parst ein Datum im Format TT.MM.JJJJ', () => {
    const d = TFW.parseDate('15.03.2025');
    expect(d.getDate()).toBe(15);
    expect(d.getMonth()).toBe(2);
    expect(d.getFullYear()).toBe(2025);
  });

  it('gibt null bei ungültigem Format zurück', () => {
    expect(TFW.parseDate('2025-03-15')).toBeNull();
    expect(TFW.parseDate('abc')).toBeNull();
  });
});

describe('arbeitstageZwischen', () => {
  it('zählt Arbeitstage korrekt (volle Woche Mo-Fr)', () => {
    // 06.01.2025 (Mo) – 10.01.2025 (Fr)
    expect(TFW.arbeitstageZwischen(new Date(2025, 0, 6), new Date(2025, 0, 10))).toBe(5);
  });

  it('überspringt Wochenenden', () => {
    // 06.01.2025 (Mo) – 12.01.2025 (So) = 5 Arbeitstage
    expect(TFW.arbeitstageZwischen(new Date(2025, 0, 6), new Date(2025, 0, 12))).toBe(5);
  });

  it('zählt auch bei Start am Wochenende korrekt', () => {
    // 04.01.2025 (Sa) – 10.01.2025 (Fr) = 5 Arbeitstage (Mo-Fr)
    expect(TFW.arbeitstageZwischen(new Date(2025, 0, 4), new Date(2025, 0, 10))).toBe(5);
  });

  it('gibt 0 für reines Wochenende', () => {
    // 04.01.2025 (Sa) – 05.01.2025 (So)
    expect(TFW.arbeitstageZwischen(new Date(2025, 0, 4), new Date(2025, 0, 5))).toBe(0);
  });
});

describe('arbeitstageImMonat', () => {
  it('zählt Arbeitstage im Januar 2025 (23)', () => {
    expect(TFW.arbeitstageImMonat(2025, 0)).toBe(23);
  });

  it('zählt Arbeitstage im Februar 2025 (20)', () => {
    expect(TFW.arbeitstageImMonat(2025, 1)).toBe(20);
  });

  it('zählt Arbeitstage im Februar 2024 Schaltjahr (21)', () => {
    expect(TFW.arbeitstageImMonat(2024, 1)).toBe(21);
  });
});

describe('daysInMonth', () => {
  it('gibt die korrekte Anzahl Tage zurück', () => {
    expect(TFW.daysInMonth(2025, 0)).toBe(31);  // Jan
    expect(TFW.daysInMonth(2025, 1)).toBe(28);  // Feb
    expect(TFW.daysInMonth(2024, 1)).toBe(29);  // Feb Schaltjahr
    expect(TFW.daysInMonth(2025, 3)).toBe(30);  // Apr
  });
});
