import { describe, it, expect } from 'vitest';
import {
  isFirstOfMonth,
  isLastOfMonth,
  analysiereZeitraum,
  formatDate,
  parseDate,
  daysInMonth,
} from '../src/rechner.js';

describe('isFirstOfMonth', () => {
  it('erkennt den 1. eines Monats', () => {
    expect(isFirstOfMonth(new Date(2025, 0, 1))).toBe(true);
    expect(isFirstOfMonth(new Date(2025, 5, 1))).toBe(true);
  });

  it('erkennt andere Tage als nicht-erster', () => {
    expect(isFirstOfMonth(new Date(2025, 0, 2))).toBe(false);
    expect(isFirstOfMonth(new Date(2025, 0, 31))).toBe(false);
  });
});

describe('isLastOfMonth', () => {
  it('erkennt den letzten Tag eines Monats', () => {
    expect(isLastOfMonth(new Date(2025, 0, 31))).toBe(true); // 31. Jan
    expect(isLastOfMonth(new Date(2025, 1, 28))).toBe(true);  // 28. Feb (kein Schaltjahr)
    expect(isLastOfMonth(new Date(2024, 1, 29))).toBe(true);  // 29. Feb (Schaltjahr)
    expect(isLastOfMonth(new Date(2025, 3, 30))).toBe(true);  // 30. Apr
  });

  it('erkennt nicht-letzte Tage', () => {
    expect(isLastOfMonth(new Date(2025, 0, 30))).toBe(false);
    expect(isLastOfMonth(new Date(2025, 1, 27))).toBe(false);
  });
});

describe('analysiereZeitraum', () => {
  it('erkennt ganze Monate (ein Monat)', () => {
    const result = analysiereZeitraum(new Date(2025, 0, 1), new Date(2025, 0, 31));
    expect(result.ganzeMonateFlag).toBe(true);
    expect(result.anzahlMonate).toBe(1);
    expect(result.restTageVor).toBe(0);
    expect(result.restTageNach).toBe(0);
  });

  it('erkennt ganze Monate (mehrere Monate)', () => {
    const result = analysiereZeitraum(new Date(2025, 0, 1), new Date(2025, 2, 31));
    expect(result.ganzeMonateFlag).toBe(true);
    expect(result.anzahlMonate).toBe(3);
  });

  it('erkennt ganze Monate über Jahreswechsel', () => {
    const result = analysiereZeitraum(new Date(2024, 10, 1), new Date(2025, 1, 28));
    expect(result.ganzeMonateFlag).toBe(true);
    expect(result.anzahlMonate).toBe(4);
  });

  it('erkennt unvollständigen Zeitraum (Start nicht am 1.)', () => {
    const result = analysiereZeitraum(new Date(2025, 0, 15), new Date(2025, 2, 31));
    expect(result.ganzeMonateFlag).toBe(false);
    expect(result.restTageVor).toBe(17); // 15.–31. Jan = 17 Tage
    expect(result.anzahlMonate).toBe(2);  // Feb + Mär
    expect(result.restTageNach).toBe(0);
  });

  it('erkennt unvollständigen Zeitraum (Ende nicht am Letzten)', () => {
    const result = analysiereZeitraum(new Date(2025, 0, 1), new Date(2025, 2, 15));
    expect(result.ganzeMonateFlag).toBe(false);
    expect(result.restTageVor).toBe(0);
    expect(result.anzahlMonate).toBe(2); // Jan + Feb
    expect(result.restTageNach).toBe(15);
  });

  it('erkennt unvollständigen Zeitraum (beide Seiten)', () => {
    const result = analysiereZeitraum(new Date(2025, 0, 10), new Date(2025, 2, 15));
    expect(result.ganzeMonateFlag).toBe(false);
    expect(result.restTageVor).toBe(22); // 10.–31. Jan = 22 Tage
    expect(result.anzahlMonate).toBe(1);  // Feb
    expect(result.restTageNach).toBe(15);
  });

  it('gibt null bei ungültigem Zeitraum zurück', () => {
    expect(analysiereZeitraum(new Date(2025, 2, 1), new Date(2025, 0, 1))).toBeNull();
  });

  it('gibt null bei ungültigen Daten zurück', () => {
    expect(analysiereZeitraum(null, new Date())).toBeNull();
    expect(analysiereZeitraum(new Date(), 'abc')).toBeNull();
  });
});

describe('formatDate', () => {
  it('formatiert ein Datum als TT.MM.JJJJ', () => {
    expect(formatDate(new Date(2025, 0, 5))).toBe('05.01.2025');
    expect(formatDate(new Date(2025, 11, 31))).toBe('31.12.2025');
  });
});

describe('parseDate', () => {
  it('parst ein Datum im Format TT.MM.JJJJ', () => {
    const d = parseDate('15.03.2025');
    expect(d.getDate()).toBe(15);
    expect(d.getMonth()).toBe(2);
    expect(d.getFullYear()).toBe(2025);
  });

  it('gibt null bei ungültigem Format zurück', () => {
    expect(parseDate('2025-03-15')).toBeNull();
    expect(parseDate('abc')).toBeNull();
  });
});

describe('daysInMonth', () => {
  it('gibt die korrekte Anzahl Tage zurück', () => {
    expect(daysInMonth(2025, 0)).toBe(31);  // Jan
    expect(daysInMonth(2025, 1)).toBe(28);  // Feb
    expect(daysInMonth(2024, 1)).toBe(29);  // Feb Schaltjahr
    expect(daysInMonth(2025, 3)).toBe(30);  // Apr
  });
});
