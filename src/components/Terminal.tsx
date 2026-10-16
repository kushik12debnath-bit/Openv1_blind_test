import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CupSoda, Droplets, Timer, UserRound } from 'lucide-react';
import { SENSORY_METRICS, meanOf, randomBatchCode } from '../lib/sensory';
import type { AgeCohort, Evaluation, Frequency, TestLocation } from '../lib/sensory';
import { AGE_COHORTS, FREQUENCIES, LOCATIONS } from '../lib/sensory';

export interface TerminalDraft {
  eval: Evaluation;
  displayA: number;
  displayB: number;
  pickedDisplay: string;
}

function newBatchPair(): { a: number; b: number; cokeIsA: boolean } {
  let a = randomBatchCode();
  let b = randomBatchCode();
  while (b === a) b = randomBatchCode();
  return { a, b, cokeIsA: Math.random() < 0.5 };
}

export function BlindTerminal({ onSubmit }: { onSubmit: (d: TerminalDraft) => void }) {
  const [pair, setPair] = useState(newBatchPair);
  const [scoresA, setScoresA] = useState<number[]>([7, 7, 7, 7, 7, 7]);
  const [scoresB, setScoresB] = useState<number[]>([7, 7, 7, 7, 7, 7]);
  const [age, setAge] = useState<AgeCohort>('25-34');
  const [frequency, setFrequency] = useState<Frequency>('Weekly');
  const [location, setLocation] = useState<TestLocation>('Mall Kiosk');
  const [pick, setPick] = useState<string>('');
  const [rinseLeft, setRinseLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  const meanA = useMemo(() => meanOf(scoresA), [scoresA]);
  const meanB = useMemo(() => meanOf(scoresB), [scoresB]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function startRinse() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRinseLeft(15);
    timerRef.current = window.setInterval(() => {
      setRinseLeft((v) => {
        if (v <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  function setScore(setter: (v: number[]) => void, arr: number[], idx: number, v: number) {
    const next = [...arr];
    next[idx] = v;
    setter(next);
  }

  function handleSubmit() {
    if (!pick) return;
    const cokeScores = pair.cokeIsA ? scoresA : scoresB;
    const compScores = pair.cokeIsA ? scoresB : scoresA;
    const preference = pick === 'tie' ? 'tie' : pick === 'A' ? (pair.cokeIsA ? 'coca-cola' : 'competitor') : pair.cokeIsA ? 'competitor' : 'coca-cola';
    const evalRow: Evaluation = {
      id: `SES-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      location,
      ageCohort: age,
      frequency,
      batchCoke: pair.cokeIsA ? pair.a : pair.b,
      batchComp: pair.cokeIsA ? pair.b : pair.a,
      cokeScores: [...cokeScores],
      compScores: [...compScores],
      preference,
      cokeMean: Math.round(meanOf(cokeScores) * 100) / 100,
      compMean: Math.round(meanOf(compScores) * 100) / 100,
    };
    onSubmit({ eval: evalRow, displayA: pair.a, displayB: pair.b, pickedDisplay: pick });
    setPair(newBatchPair());
    setScoresA([7, 7, 7, 7, 7, 7]);
    setScoresB([7, 7, 7, 7, 7, 7]);
    setPick('');
    setRinseLeft(0);
  }

  const canSubmit = pick !== '';

  function ScoreCard({
    title,
    code,
    color,
    scores,
    onScore,
    comp,
  }: {
    title: string;
    code: number;
    color: string;
    scores: number[];
    onScore: (idx: number, v: number) => void;
    comp?: boolean;
  }) {
    return (
      <div className="bento-card micro-highlight tnum p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: color }}>
              <CupSoda className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{title}</div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">Batch #{code}</div>
            </div>
          </div>
          <div className="rounded-full px-3 py-1 text-sm font-extrabold text-white" style={{ background: color }}>
            {meanOf(scores).toFixed(1)}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {SENSORY_METRICS.map((m, i) => (
            <div key={m.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="text-[13px] font-bold text-slate-800">
                  {m.label} <span className="ml-1 font-medium text-slate-400">· {m.hint}</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-extrabold text-white"
                  style={{ background: color }}
                >
                  {scores[i].toFixed(0)}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={scores[i]}
                onChange={(e) => onScore(i, Number(e.target.value))}
                className={`sensory-range ${comp ? 'comp' : ''}`}
                style={{ ['--fill' as string]: `${((scores[i] - 1) / 9) * 100}%` }}
                aria-label={`${title} ${m.label}`}
              />
              <div className="mt-0.5 flex justify-between text-[10px] font-bold text-slate-400">
                <span>1 · Weak</span>
                <span>10 · Exceptional</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 rounded-2xl border border-red-100 bg-gradient-to-r from-[#F40009] to-[#8f0005] p-5 text-white lg:col-span-12">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Double-blind protocol · ISO 8589</div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">Taste first. No logos. No bias.</h2>
            <p className="mt-1 max-w-[720px] text-[13px] font-medium text-white/80">
              Both pours are masked as 3-digit batch codes. Score all six organoleptic dimensions, rinse between samples, then lock your forced-choice preference.
            </p>
          </div>
          <div className="tnum mt-3 flex shrink-0 items-center gap-2 rounded-2xl bg-black/25 px-4 py-2.5 text-sm font-bold lg:mt-0">
            <Timer className="h-4 w-4" />
            Rinse protocol: 15s water
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <ScoreCard
          title="Sample 1 of 2"
          code={pair.a}
          color="#0f172a"
          scores={scoresA}
          onScore={(i, v) => setScore(setScoresA, scoresA, i, v)}
        />
      </div>
      <div className="col-span-12 lg:col-span-6">
        <ScoreCard
          title="Sample 2 of 2"
          code={pair.b}
          color="#334155"
          scores={scoresB}
          onScore={(i, v) => setScore(setScoresB, scoresB, i, v)}
          comp
        />
      </div>

      <div className="col-span-12">
        <div className="bento-card tnum flex flex-col items-stretch gap-4 p-5 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Droplets className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-slate-900">Palate Cleanser Timer</div>
              <div className="text-xs font-medium text-slate-500">Still water rinse between samples · 15 seconds</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#3B82F6] transition-all"
                  style={{ width: `${rinseLeft === 0 ? (0 as number) : (rinseLeft / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="tnum min-w-[72px] text-center text-2xl font-extrabold text-slate-900">
              {rinseLeft > 0 ? `0:${String(rinseLeft).padStart(2, '0')}` : rinseLeft === 0 ? 'Ready' : 'Ready'}
            </div>
            <button
              onClick={startRinse}
              className="rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-95 active:scale-[0.98]"
            >
              {rinseLeft > 0 ? 'Restart rinse' : 'Start 15s rinse'}
            </button>
            {rinseLeft === 0 && (
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 sm:flex">
                <Check className="h-3.5 w-3.5" /> Palate neutral
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div className="bento-card tnum p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Forced-choice preference</div>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">Which batch wins your palate?</h3>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                { id: 'A', label: `Batch #${pair.a}`, mean: meanA, style: 'dark' },
                { id: 'B', label: `Batch #${pair.b}`, mean: meanB, style: 'blue' },
                { id: 'tie', label: 'No preference / Tie', mean: null, style: 'ghost' },
              ] as const
            ).map((o) => {
              const selected = pick === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setPick(o.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.99] ${
                    selected
                      ? 'border-[#F40009] bg-[rgba(244,0,9,0.08)] shadow-ambient'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">{o.label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-[#F40009] bg-[#F40009] text-white' : 'border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {o.mean === null ? 'Scores within 0.3 pts' : `Your mean: ${o.mean.toFixed(1)} / 10`}
                  </div>
                </button>
              );
            })}
          </div>
          {!canSubmit && (
            <div className="mt-3 text-xs font-semibold text-slate-400">Select one to enable submission — ties are valid data.</div>
          )}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <div className="bento-card tnum flex h-full flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Tester metadata</span>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold text-slate-600">Age cohort</div>
            <div className="flex flex-wrap gap-1.5">
              {AGE_COHORTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                    age === a ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold text-slate-600">Consumption frequency</div>
            <div className="flex flex-wrap gap-1.5">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                    frequency === f ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold text-slate-600">Test location</div>
            <div className="flex flex-wrap gap-1.5">
              {LOCATIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocation(l)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                    location === l ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`mt-auto rounded-2xl px-5 py-3.5 text-sm font-extrabold text-white transition ${
              canSubmit ? 'bg-[#F40009] shadow-lift hover:bg-[#D10007]' : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            Submit blind evaluation →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
