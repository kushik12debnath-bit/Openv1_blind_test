import { motion } from 'framer-motion';
import { ArrowRight, Award, FlaskConical, Scale } from 'lucide-react';
import { COKE_LOGO_URL, NATIONAL_BASELINE_COMP, NATIONAL_BASELINE_COKES, SENSORY_METRICS, meanOf } from '../lib/sensory';
import type { TerminalDraft } from './Terminal';

export function Reveal({
  draft,
  onGoTerminal,
  onGoDashboard,
}: {
  draft: TerminalDraft | null;
  onGoTerminal: () => void;
  onGoDashboard: () => void;
}) {
  if (!draft) {
    return (
      <div className="bento-card mx-auto flex max-w-[720px] flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(244,0,9,0.08)] text-[#F40009]">
          <FlaskConical className="h-6 w-6" />
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">No sealed ballot yet</h2>
        <p className="max-w-[420px] text-sm font-medium text-slate-500">
          Complete a double-blind evaluation in the terminal. The cryptographic unblinding ceremony unlocks here — with a 3D spring reveal.
        </p>
        <button
          onClick={onGoTerminal}
          className="mt-2 rounded-xl bg-[#F40009] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#D10007]"
        >
          Open blind terminal →
        </button>
      </div>
    );
  }

  const { eval: e, displayA, displayB } = draft;
  const cokeCode = e.batchCoke;
  const compCode = e.batchComp;
  const pickedCode = draft.pickedDisplay === 'tie' ? null : draft.pickedDisplay === 'A' ? displayA : displayB;
  const pickedIsCoke = pickedCode === cokeCode;
  const pickedIsComp = pickedCode === compCode;
  const nationalCoke = meanOf(NATIONAL_BASELINE_COKES);
  const nationalComp = meanOf(NATIONAL_BASELINE_COMP);
  const aligned = e.preference === 'coca-cola';

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 rounded-2xl border border-zinc-800 bg-[#09090B] p-6 text-center text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">Cryptographic unblinding · SHA-sealed ballot {e.id}</div>
        <h2 className="tnum mt-2 text-2xl font-extrabold tracking-tight">Batch #{displayA} × Batch #{displayB} — truth revealed</h2>
        <p className="mx-auto mt-1 max-w-[640px] text-[13px] font-medium text-zinc-400">
          Sealed at {new Date(e.timestamp).toLocaleString()} · {e.location} · Age {e.ageCohort} · {e.frequency} drinker
        </p>
      </div>

      <div className="col-span-12 lg:col-span-6" style={{ perspective: 1200 }}>
        <motion.div
          initial={{ rotateY: 90, opacity: 0, scale: 0.96 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="overflow-hidden rounded-2xl border border-red-200 shadow-lift"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="bg-gradient-to-br from-[#F40009] via-[#c80007] to-[#7a0004] p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] backdrop-blur">
                Coca-Cola Original Taste
              </span>
              <Award className="h-5 w-5 text-white/80" />
            </div>
            <div className="mt-4 flex h-16 items-center justify-center rounded-2xl bg-white px-6 py-2">
              <img src={COKE_LOGO_URL} alt="Coca-Cola Original Taste" className="h-10 w-auto object-contain" />
            </div>
            <div className="tnum mt-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Secret batch code</div>
                <div className="text-4xl font-extrabold tracking-tight">#{cokeCode}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Your mean</div>
                <div className="text-3xl font-extrabold">{e.cokeMean.toFixed(1)}<span className="text-base font-bold text-white/70"> /10</span></div>
              </div>
            </div>
            {pickedIsCoke && (
              <div className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-center text-[13px] font-bold backdrop-blur">
                ✓ You picked this — your palate chose Coca-Cola
              </div>
            )}
          </div>
          <div className="tnum bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">You vs national baseline ({nationalCoke.toFixed(1)})</div>
            <div className="mt-3 flex flex-col gap-2">
              {SENSORY_METRICS.map((m, i) => (
                <div key={m.key} className="grid grid-cols-[150px_1fr_44px] items-center gap-2 text-xs">
                  <span className="truncate font-bold text-slate-700">{m.label}</span>
                  <span className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${(NATIONAL_BASELINE_COKES[i] / 10) * 100}%` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[#F40009]" style={{ width: `${(e.cokeScores[i] / 10) * 100}%`, opacity: 0.85 }} />
                  </span>
                  <span className="text-right font-extrabold text-slate-900">{e.cokeScores[i].toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="col-span-12 lg:col-span-6" style={{ perspective: 1200 }}>
        <motion.div
          initial={{ rotateY: -90, opacity: 0, scale: 0.96 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1d4ed8] p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] backdrop-blur">
                Leading cola competitor
              </span>
              <Scale className="h-5 w-5 text-white/70" />
            </div>
            <div className="mt-4 flex h-16 items-center justify-center rounded-2xl bg-white/10 px-6 ring-1 ring-white/20 backdrop-blur">
              <span className="text-xl font-extrabold italic tracking-tight text-white/90">Competitor Cola · Blind</span>
            </div>
            <div className="tnum mt-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">Secret batch code</div>
                <div className="text-4xl font-extrabold tracking-tight">#{compCode}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">Your mean</div>
                <div className="text-3xl font-extrabold">{e.compMean.toFixed(1)}<span className="text-base font-bold text-white/60"> /10</span></div>
              </div>
            </div>
            {pickedIsComp && (
              <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-[13px] font-bold ring-1 ring-white/20">
                You picked this — competitor won this ballot
              </div>
            )}
          </div>
          <div className="tnum bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">You vs national baseline ({nationalComp.toFixed(1)})</div>
            <div className="mt-3 flex flex-col gap-2">
              {SENSORY_METRICS.map((m, i) => (
                <div key={m.key} className="grid grid-cols-[150px_1fr_44px] items-center gap-2 text-xs">
                  <span className="truncate font-bold text-slate-700">{m.label}</span>
                  <span className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${(NATIONAL_BASELINE_COMP[i] / 10) * 100}%` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[#3B82F6]" style={{ width: `${(e.compScores[i] / 10) * 100}%`, opacity: 0.9 }} />
                  </span>
                  <span className="text-right font-extrabold text-slate-900">{e.compScores[i].toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="col-span-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bento-card tnum flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between ${aligned ? 'ring-2 ring-[#F40009]/20' : ''}`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Sensory alignment verdict</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
              {e.preference === 'tie'
                ? 'You called a tie — statistically rare (∼7% of ballots). Your two means are within tasting error.'
                : aligned
                  ? `Aligned with the nation — ${(68.4).toFixed(1)}% of ${1240}+ testers also preferred Coca-Cola.`
                  : 'Contrarian palate — you preferred the competitor while the national panel leans Coca-Cola (+1.8 pts).'}
            </div>
            <div className="mt-1 text-[13px] font-medium text-slate-500">
              Your gap: {(e.cokeMean - e.compMean).toFixed(1)} pts (Coke {e.cokeMean.toFixed(1)} vs Comp {e.compMean.toFixed(1)}) · National gap: {(nationalCoke - nationalComp).toFixed(1)} pts
            </div>
          </div>
          <button
            onClick={onGoDashboard}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-black"
          >
            See it in executive telemetry <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
