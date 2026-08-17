import { describe, expect, it } from 'vitest';
import { recordsToCsv } from './csv';
import { escapeHtml } from './html';
import { parseImportedSimulations } from './simulationGuard';

describe('escapeHtml', () => {
  it('escapa caracteres peligrosos', () => {
    expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    );
  });
});

describe('recordsToCsv', () => {
  it('serializa filas y escapa comas', () => {
    const csv = recordsToCsv([{ name: 'Pared, ladrillo', q: 432 }]);
    expect(csv).toContain('name,q');
    expect(csv).toContain('"Pared, ladrillo"');
    expect(csv).toContain('432');
  });
});

describe('parseImportedSimulations', () => {
  const sample = {
    id: 'a',
    name: 'Prueba',
    module: 'conduction',
    practice: 'P1',
    timestamp: '2026-01-01T00:00:00.000Z',
    parameters: { length: 0.2 },
    results: { q: 432 },
  };

  it('acepta un objeto o un arreglo válido', () => {
    expect(parseImportedSimulations(JSON.stringify(sample))).toHaveLength(1);
    expect(parseImportedSimulations(JSON.stringify([sample, sample]))).toHaveLength(2);
  });

  it('rechaza JSON ajeno', () => {
    expect(() => parseImportedSimulations('{"foo":1}')).toThrow(/ThermaLab/);
  });
});
