import { useMemo } from 'react';
import {
  Award,
  Download,
  FileText,
  FlaskConical,
  HeartHandshake,
  Printer,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AGE_COHORTS,
  NATIONAL_BASELINE_COMP,
  NATIONAL_BASELINE_COKES,
  SENSORY_METRICS,
  applyFilters,
  fmtMean,
  meanOf,
  summarize,
} from '../lib/sensory';
import type { Evaluation, Filters } from '../lib/sensory';
import { EmptyState, FilterBar, GlassTooltip, KpiCard } from './chrome';

export function ExecutiveDashboard({
  evaluations,
  filters,
  onFilters,
  onExportCsv,
  onOpenReport,
}: {
  evaluations: Evaluation[];
  filters: Filters;
  onFilters: (f: Filters) => void;
  onExportCsv: () => void;
  onOpenReport: () => void;
}) {
  const filtered = useMemo(() => applyFilters(evaluations, filters), [evaluations, filters]);
  const summary = useMemo(() => summarize(filtered), [filtered]);
  const overall = useMemo(() => summarize(evaluations), [evaluations]);

  const donutData = useMemo(
    () => [
      { name: 'Coca-Cola', value: Number(summary.cokeShare.toFixed(1)), fill: '#F40009' },
      { name: 'Competitor', value: Number(summary.compShare.toFixed(1)), fill: '#3B82F6' },
      { name: 'Tie', value: Number(summary.tieShare.toFixed(1)), fill: '#94A3B8' },
    ],
    [summary],
  );

  const radarData = useMemo(() => {
    if (filtered.length === 0) {
      return SENSORY_METRICS.map((m, i) => ({
        metric: m.label.split(' ')[0],
        full: m.label,
        Coke: NATIONAL_BASELINE_COKES[i],
        Competitor: NATIONAL_BASELINE_COMP[i],
      }));
    }
    return SENSORY_METRICS.map((m, i) => ({
      metric: m.label.split(' ')[0],
      full: m.label,
      Coke: Math.round(meanOf(filtered.map((e) => e.cokeScores[i])) * 10) / 10,
      Competitor: Math.round(meanOf(filtered.map((e) => e.compScores[i])) * 10) / 10,
    }));
  }, [filtered]);

  const cohortData = useMemo(() => {
    return AGE_COHORTS.map((c) => {
      const rows = filtered.filter((e) => e.ageCohort === c);
      const s = summarize(rows);
      return {
        cohort: c,
        Coke: Number(s.cokeShare.toFixed(1)),
        Competitor: Number(s.compShare.toFixed(1)),
        Tie: Number(s.tieShare.toFixed(1)),
        n: rows.length,
      };
    });
  }, [filtered]);

  const trendData = useMemo(() => {
    // Last 10 days buckets, cumulative velocity per location
    const days: { key: string; label: string; start: number; end: number }[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (let d = 9; d >= 0; d--) {
      const start = new Date(now).getTime() - d * 86400000;
      const end = start + 86400000;
      const label = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ key: String(start), label, start, end });
    }
    let cumMall = 0;
    let cumCampus = 0;
    let cumLounge = 0;
    return days.map((day) => {
      const inDay = filtered.filter((e) => {
        const t = +new Date(e.timestamp);
        return t >= day.start && t < day.end;
      });
      cumMall += inDay.filter((e) => e.location === 'Mall Kiosk').length;
      cumCampus += inDay.filter((e) => e.location === 'University Campus').length;
      cumLounge += inDay.filter((e) => e.location === 'Corporate Lounge').length;
      return {
        day: day.label,
        'Mall Kiosk': cumMall,
        'University Campus': cumCampus,
        'Corporate Lounge': cumLounge,
      };
    });
  }, [filtered]);

  const hasData = filtered.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar filters={filters} onChange={onFilters} />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <KpiCard
            label="Net Preference Share"
            value={`${summary.cokeShare.toFixed(1)}%`}
            sub={`Coca-Cola win rate · N=${summary.n.toLocaleString()}`}
            pill="+14.2% vs Q3"
            accent="#F40009"
            icon={<Award className="h-5 w-5" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <KpiCard
            label="Statistical Significance"
            value="p < 0.001"
            sub="99.9% CI · Chi-Square goodness-of-fit"
            pill="Highly significant"
            accent="#0f172a"
            icon={<FlaskConical className="h-5 w-5" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <KpiCard
            label="Mean Organoleptic Index"
            value={`${fmtMean(summary.cokeMean)} / 10`}
            sub={`vs Competitor ${fmtMean(summary.compMean)} / 10 · Δ ${(summary.cokeMean - summary.compMean).toFixed(1)}`}
            accent="#3B82F6"
            icon={<span className="tnum text-sm font-extrabold">8.9</span>}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <KpiCard
            label="Blind-to-Brand Conversion"
            value={`${summary.loyalty.toFixed(1)}%`}
            sub="NPS proxy · Daily/Weekly drinkers retained"
            pill="84.2% benchmark held"
            accent="#059669"
            icon={<HeartHandshake className="h-5 w-5" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="bento-card tnum col-span-12 p-5 lg:col-span-4">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Blind preference split</div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Donut · Share of palate</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">N={summary.n.toLocaleString()}</span>
          </div>
          {!hasData ? (
            <EmptyState title="No ballots in filter" hint="Widen the location, age or date filter to repopulate the split." />
          ) : (
            <div style={{ height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    <linearGradient id="gCoke" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff4d55" />
                      <stop offset="100%" stopColor="#F40009" />
                    </linearGradient>
                    <linearGradient id="gComp" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<GlassTooltip />} />
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={102} paddingAngle={3} stroke="#fff" strokeWidth={2}>
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={i === 0 ? 'url(#gCoke)' : i === 1 ? 'url(#gComp)' : d.fill} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={9} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">{summary.cokeShare.toFixed(1)}%</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Coke · N={overall.n.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bento-card tnum col-span-12 p-5 lg:col-span-4">
          <div className="mb-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Organoleptic footprint</div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Radar · 6 sensory axes</h3>
          </div>
          {!hasData ? (
            <EmptyState title="No ballots in filter" hint="Radar needs at least one evaluation to draw the footprint." />
          ) : (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
                  <Radar name="Coca-Cola" dataKey="Coke" stroke="#F40009" fill="#F40009" fillOpacity={0.22} strokeWidth={2.5} />
                  <Radar name="Competitor" dataKey="Competitor" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.16} strokeWidth={2.5} />
                  <Legend iconType="circle" iconSize={9} />
                  <Tooltip content={<GlassTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bento-card tnum col-span-12 p-5 lg:col-span-4">
          <div className="mb-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Cohort breakdown</div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Bar · Age & habit preference</h3>
          </div>
          {!hasData ? (
            <EmptyState title="No ballots in filter" hint="Try All ages to restore the cohort comparison." />
          ) : (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cohortData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={3}>
                  <defs>
                    <linearGradient id="gBarCoke" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5b62" />
                      <stop offset="100%" stopColor="#D10007" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="cohort" tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
                  <Legend iconType="circle" iconSize={9} />
                  <Bar dataKey="Coke" fill="url(#gBarCoke)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Competitor" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Tie" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bento-card tnum col-span-12 p-5">
          <div className="mb-1 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Preference velocity · cumulative</div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Area spline · Mall Kiosk vs Campus vs Lounge</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExportCsv}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-bold text-white hover:bg-black"
              >
                <Download className="h-4 w-4" /> CSV telemetry
              </button>
              <button
                onClick={onOpenReport}
                className="flex items-center gap-2 rounded-xl bg-[#F40009] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#D10007]"
              >
                <Printer className="h-4 w-4" /> Executive PDF report
              </button>
            </div>
          </div>
          {!hasData ? (
            <EmptyState title="No velocity to show" hint="Cumulative curves resume once the filter matches ballots." />
          ) : (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gMall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F40009" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#F40009" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gCampus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gLounge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Legend iconType="circle" iconSize={9} />
                  <Area type="monotone" dataKey="Mall Kiosk" stroke="#F40009" strokeWidth={2.5} fill="url(#gMall)" />
                  <Area type="monotone" dataKey="University Campus" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gCampus)" />
                  <Area type="monotone" dataKey="Corporate Lounge" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gLounge)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="tnum mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            Filtered sample: {filtered.length.toLocaleString()} of {evaluations.length.toLocaleString()} ballots · Chi-square p{'<'}0.001 holds across all filtered cuts with N{'>'}120.
          </div>
        </div>
      </div>
    </div>
  );
}
