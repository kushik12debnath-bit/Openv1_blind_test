import { SENSORY_METRICS } from './sensory';
import type { Evaluation } from './sensory';

function csvEscape(v: string | number): string {
  const s = String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function evaluationsToCsv(rows: Evaluation[]): string {
  const metricKeys = SENSORY_METRICS.map((m) => m.key);
  const header = [
    'session_id',
    'timestamp',
    'location',
    'age_cohort',
    'consumption_frequency',
    'batch_coke_code',
    'batch_competitor_code',
    ...metricKeys.map((k) => `coke_${k}`),
    ...metricKeys.map((k) => `competitor_${k}`),
    'coke_mean',
    'competitor_mean',
    'winning_brand',
  ];
  const lines = [header.join(',')];
  for (const e of rows) {
    const line = [
      e.id,
      e.timestamp,
      e.location,
      e.ageCohort,
      e.frequency,
      String(e.batchCoke),
      String(e.batchComp),
      ...e.cokeScores.map((s) => s.toFixed(1)),
      ...e.compScores.map((s) => s.toFixed(1)),
      e.cokeMean.toFixed(2),
      e.compMean.toFixed(2),
      e.preference,
    ].map(csvEscape);
    lines.push(line.join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function triggerPrint(): void {
  window.print();
}
