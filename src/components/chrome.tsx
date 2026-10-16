import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { COKE_LOGO_URL } from '../lib/sensory';
import type { Filters, ModuleId } from '../lib/sensory';
import { AGE_COHORTS, LOCATIONS } from '../lib/sensory';

export interface ToastItem {
  id: number;
  title: string;
  desc: string;
}

export function CokeLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-24 items-center justify-center overflow-hidden rounded-lg bg-white px-2">
        <img
          src={COKE_LOGO_URL}
          alt="Coca-Cola"
          className="h-6 w-auto object-contain"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = 'none';
            const fallback = t.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          style={{ display: 'none', background: '#F40009' }}
          className="h-7 w-full items-center justify-center rounded-md text-[11px] font-extrabold italic tracking-tight text-white"
        >
          Coca-Cola
        </div>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-tight text-white">
            Sensory Intelligence
          </div>
          <div className="text-[11px] font-medium text-zinc-400">
            Blind Taste Test Platform
          </div>
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS: { id: ModuleId; label: string; hint: string; icon: typeof Activity }[] = [
  { id: 'terminal', label: 'Blind Evaluation', hint: 'Tester View', icon: FlaskConical },
  { id: 'reveal', label: 'Unblinding Reveal', hint: 'Brand moment', icon: Sparkles },
  { id: 'dashboard', label: 'Executive Telemetry', hint: 'BI View', icon: BarChart3 },
];

export function TopNav({
  active,
  onChange,
  hasPendingReveal,
  totalN,
  allowed,
  username,
  role,
  onLogout,
}: {
  active: ModuleId;
  onChange: (m: ModuleId) => void;
  hasPendingReveal: boolean;
  totalN: number;
  allowed: ModuleId[];
  username: string;
  role: string;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#09090B]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <CokeLogo />
          <div className="tnum hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            LIVE · <span className="font-bold text-white">{totalN.toLocaleString()}</span>&nbsp;evaluations
          </div>
        </div>
        <nav className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1.5 sm:flex">
          {NAV_ITEMS.filter((item) => allowed.includes(item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const showDot = item.id === 'reveal' && hasPendingReveal && !isActive;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-left transition-all ${
                  isActive ? 'bg-white text-zinc-900 shadow' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="leading-tight">
                  <span className="block text-[13px] font-bold">{item.label}</span>
                  <span className={`block text-[11px] ${isActive ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {item.hint}
                  </span>
                </span>
                {showDot && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F40009] opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#09090B] bg-[#F40009]" />
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute inset-x-6 -bottom-[7px] h-[3px] rounded-full bg-[#F40009]"
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div className="tnum flex items-center justify-between gap-2 border-t border-zinc-800 pt-2 lg:border-t-0 lg:pt-0">
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-200 ring-1 ring-zinc-800">
            {username} · <span className="uppercase text-white">{role}</span>
          </span>
          <button
            onClick={onLogout}
            data-testid="logout-btn"
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  pill,
  icon,
  accent = '#F40009',
}: {
  label: string;
  value: string;
  sub: string;
  pill?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bento-card micro-highlight tnum p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">{sub}</div>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: accent }}
        >
          {icon}
        </div>
      </div>
      {pill && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
          <Activity className="h-3.5 w-3.5" />
          {pill}
        </div>
      )}
    </motion.div>
  );
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lift"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[13px] font-bold text-slate-900">{t.title}</span>
              <span className="block text-[12px] font-medium text-slate-500">{t.desc}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const btn = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-bold transition-all ring-1 ${
      active
        ? 'bg-slate-900 text-white ring-slate-900'
        : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
    }`;
  return (
    <div className="bento-card tnum flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Location</span>
        {(['All', ...LOCATIONS] as const).map((l) => (
          <button key={l} className={btn(filters.location === l)} onClick={() => onChange({ ...filters, location: l })}>
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Age</span>
        {(['All', ...AGE_COHORTS] as const).map((a) => (
          <button key={a} className={btn(filters.age === a)} onClick={() => onChange({ ...filters, age: a })}>
            {a}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Range</span>
        {(
          [
            ['all', 'All time'],
            ['24h', '24H'],
            ['7d', '7D'],
            ['30d', '30D'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} className={btn(filters.range === k)} onClick={() => onChange({ ...filters, range: k })}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GlassTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="recharts-tooltip-glass tnum min-w-[160px]">
      {label !== undefined && label !== '' && (
        <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">{String(label)}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((p: { name?: string; value?: number | string; color?: string; payload?: { fill?: string } }, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: p.color ?? p.payload?.fill ?? '#0f172a' }}
              />
              {p.name}
            </span>
            <span className="font-extrabold text-slate-900">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
      <BarChart3 className="h-8 w-8 text-slate-300" />
      <div className="text-sm font-bold text-slate-700">{title}</div>
      <div className="max-w-[320px] text-xs font-medium text-slate-500">{hint}</div>
    </div>
  );
}
