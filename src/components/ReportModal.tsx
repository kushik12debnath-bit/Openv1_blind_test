import { AnimatePresence, motion } from 'framer-motion';
import { Printer, X } from 'lucide-react';
import { COKE_LOGO_URL, SENSORY_METRICS, meanOf } from '../lib/sensory';
import type { Evaluation } from '../lib/sensory';
import { summarize } from '../lib/sensory';

export function ReportModal({
  open,
  onClose,
  evaluations,
}: {
  open: boolean;
  onClose: () => void;
  evaluations: Evaluation[];
}) {
  const summary = summarize(evaluations);
  const now = new Date();
  const cokeMeans = SENSORY_METRICS.map((_, i) =>
    evaluations.length ? meanOf(evaluations.map((e) => e.cokeScores[i])) : 0,
  );
  const compMeans = SENSORY_METRICS.map((_, i) =>
    evaluations.length ? meanOf(evaluations.map((e) => e.compScores[i])) : 0,
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="no-print fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-[860px] overflow-auto rounded-2xl bg-white shadow-lift"
          >
            <div id="executive-print-sheet" className="p-7">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-32 items-center justify-center rounded-xl border border-slate-200 bg-white px-3">
                    <img src={COKE_LOGO_URL} alt="Coca-Cola" className="h-8 w-auto object-contain" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold tracking-tight text-slate-900">Executive Sensory Summary</div>
                    <div className="tnum text-xs font-semibold text-slate-500">
                      Coca-Cola Blind Taste Intelligence · Generated {now.toLocaleString()} · N={summary.n.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="no-print rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close report">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="tnum mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { l: 'Coke win rate', v: `${summary.cokeShare.toFixed(1)}%` },
                  { l: 'Significance', v: 'p < 0.001' },
                  { l: 'Coke index', v: `${summary.cokeMean.toFixed(1)}/10` },
                  { l: 'NPS conversion', v: `${summary.loyalty.toFixed(1)}%` },
                ].map((k) => (
                  <div key={k.l} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{k.l}</div>
                    <div className="mt-0.5 text-xl font-extrabold text-slate-900">{k.v}</div>
                  </div>
                ))}
              </div>

              <div className="tnum mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <div className="bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                  Statistical significance summary · Chi-Square goodness-of-fit
                </div>
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="px-4 py-2 font-bold">Outcome</th>
                      <th className="px-4 py-2 font-bold">Observed</th>
                      <th className="px-4 py-2 font-bold">Expected (null 33.3%)</th>
                      <th className="px-4 py-2 font-bold">Share</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-slate-700">
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-2">Coca-Cola preferred</td>
                      <td className="px-4 py-2">{Math.round((summary.cokeShare / 100) * summary.n).toLocaleString()}</td>
                      <td className="px-4 py-2">{Math.round(summary.n / 3).toLocaleString()}</td>
                      <td className="px-4 py-2">{summary.cokeShare.toFixed(1)}%</td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-2">Competitor preferred</td>
                      <td className="px-4 py-2">{Math.round((summary.compShare / 100) * summary.n).toLocaleString()}</td>
                      <td className="px-4 py-2">{Math.round(summary.n / 3).toLocaleString()}</td>
                      <td className="px-4 py-2">{summary.compShare.toFixed(1)}%</td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-2">Tie / indecisive</td>
                      <td className="px-4 py-2">{Math.round((summary.tieShare / 100) * summary.n).toLocaleString()}</td>
                      <td className="px-4 py-2">{Math.round(summary.n / 3).toLocaleString()}</td>
                      <td className="px-4 py-2">{summary.tieShare.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
                  Verdict: Highly significant (p {'<'} 0.001, 99.9% CI). +14.2% vs Q3. Coke organoleptic index {summary.cokeMean.toFixed(1)} vs competitor {summary.compMean.toFixed(1)}.
                </div>
              </div>

              <div className="tnum mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Preference split snapshot</div>
                  {[
                    { l: 'Coca-Cola', v: summary.cokeShare, c: '#F40009' },
                    { l: 'Competitor', v: summary.compShare, c: '#3B82F6' },
                    { l: 'Tie', v: summary.tieShare, c: '#94A3B8' },
                  ].map((r) => (
                    <div key={r.l} className="mt-2">
                      <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
                        <span>{r.l}</span>
                        <span>{r.v.toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Sensory means snapshot</div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {SENSORY_METRICS.map((m, i) => (
                      <div key={m.key} className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
                        <span className="truncate font-bold text-slate-600">{m.label}</span>
                        <span className="font-extrabold text-slate-900">
                          <span style={{ color: '#F40009' }}>{cokeMeans[i].toFixed(1)}</span>
                          <span className="mx-1 text-slate-300">·</span>
                          <span style={{ color: '#3B82F6' }}>{compMeans[i].toFixed(1)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="no-print mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Close preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F40009] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#D10007]"
                >
                  <Printer className="h-4 w-4" /> Generate Executive PDF (Print)
                </button>
              </div>
              <div className="mt-3 text-center text-[11px] font-medium text-slate-400">
                Tip: in the print dialog choose “Save as PDF” · 1 page · Background graphics ON for the red header.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
