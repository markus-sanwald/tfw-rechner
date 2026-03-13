import { describe, it, expect } from 'vitest';
import { greet } from '../src/rechner.js';

describe('greet', () => {
  it('gibt eine Begrüßung mit dem Namen zurück', () => {
    expect(greet('Welt')).toBe('Hallo, Welt!');
  });

  it('funktioniert mit beliebigen Namen', () => {
    expect(greet('TFW')).toBe('Hallo, TFW!');
  });
});
