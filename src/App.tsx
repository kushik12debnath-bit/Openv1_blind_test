import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BlindTerminal } from './components/Terminal';
import type { TerminalDraft } from './components/Terminal';
import { Reveal } from './components/Reveal';
import { ExecutiveDashboard } from './components/Dashboard';
import { ReportModal } from './components/ReportModal';
import { LoginScreen } from './components/Login';
import { ToastStack } from './components/chrome';
import type { ToastItem } from './components/chrome';
import { TopNav } from './components/chrome';
import { applyFilters, generateSeedEvaluations } from './lib/sensory';
import type { Evaluation, Filters, ModuleId } from './lib/sensory';
import { downloadCsv, evaluationsToCsv } from './lib/export';
import { allowedModules, canAccess, canExport, clearSession, restoreSession, saveSession } from './lib/auth';
import type { DemoUser } from './lib/auth';

let toastSeq = 1;

export default function App() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => generateSeedEvaluations(1240));
  const [filters, setFilters] = useState<Filters>({ location: 'All', age: 'All', range: 'all' });
  const [active, setActive] = useState<ModuleId>('terminal');
  const [lastDraft, setLastDraft] = useState<TerminalDraft | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const restored = restoreSession();
    if (restored) {
      setUser(restored);
      const mods = allowedModules(restored.role);
      setActive(mods.includes('terminal') ? 'terminal' : mods[0]);
    }
  }, []);

  const filteredForExport = useMemo(() => applyFilters(evaluations, filters), [evaluations, filters]);
  const modules = useMemo(() => (user ? allowedModules(user.role) : []), [user]);

  const pushToast = useCallback((title: string, desc: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, title, desc }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  function handleLogin(u: DemoUser) {
    setUser(u);
    saveSession(u);
    const mods = allowedModules(u.role);
    setActive(mods.includes('terminal') ? 'terminal' : mods[0]);
    pushToast(`Signed in as ${u.username}`, `${u.displayName} · ${u.role} access granted`);
  }

  function handleLogout() {
    setUser(null);
    clearSession();
    setLastDraft(null);
    setReportOpen(false);
  }

  function handleModuleChange(m: ModuleId) {
    if (!user || !canAccess(user.role, m)) {
      pushToast('Access restricted', `${m} is not available for this role`);
      return;
    }
    setActive(m);
  }

  function handleTerminalSubmit(d: TerminalDraft) {
    setEvaluations((prev) => [d.eval, ...prev]);
    setLastDraft(d);
    setActive('reveal');
    pushToast('Blind test recorded', `${d.eval.id} · ${d.eval.location} · N=${(evaluations.length + 1).toLocaleString()}`);
  }

  function handleExportCsv() {
    if (!user || !canExport(user.role)) {
      pushToast('Export blocked', 'Testers cannot export telemetry');
      return;
    }
    const csv = evaluationsToCsv(filteredForExport);
    downloadCsv('coca-cola-blind-test-telemetry.csv', csv);
    pushToast('CSV telemetry exported', `${filteredForExport.length.toLocaleString()} rows · RFC-4180 · 6 sensory axes`);
  }

  function handleOpenReport() {
    if (!user || !canExport(user.role)) {
      pushToast('Report blocked', 'Testers cannot generate executive reports');
      return;
    }
    setReportOpen(true);
    pushToast('Executive report ready', 'Print preview generated · Save as PDF');
  }

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <TopNav
        active={active}
        onChange={handleModuleChange}
        hasPendingReveal={lastDraft !== null}
        totalN={evaluations.length}
        allowed={modules}
        username={user.username}
        role={user.role}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6">
        <div className="tnum mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
            Role: <span className="uppercase text-slate-900">{user.role}</span> · {user.displayName}
          </span>
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
            Modules: {modules.join(' · ')}
          </span>
          {!canExport(user.role) && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">
              Exports disabled for tester role
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${user.role}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {active === 'terminal' && canAccess(user.role, 'terminal') && (
              <BlindTerminal onSubmit={handleTerminalSubmit} />
            )}
            {active === 'reveal' && (
              <Reveal
                draft={lastDraft}
                onGoTerminal={() => handleModuleChange('terminal')}
                onGoDashboard={() => handleModuleChange('dashboard')}
              />
            )}
            {active === 'dashboard' && canAccess(user.role, 'dashboard') && (
              <ExecutiveDashboard
                evaluations={evaluations}
                filters={filters}
                onFilters={setFilters}
                onExportCsv={handleExportCsv}
                onOpenReport={handleOpenReport}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="tnum mt-8 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <span>
            <span className="font-extrabold text-slate-800">Coca-Cola Sensory Intelligence</span> · Executive demo build ·
            Double-blind ISO 8589 · Chi-Square p{'<'}0.001 · {user.username}/{user.role} session
          </span>
          <span className="font-bold">
            N={evaluations.length.toLocaleString()} · Coke {(68.4).toFixed(1)}% · Index 8.9 vs 7.1 · NPS 84.2%
          </span>
        </footer>
      </main>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} evaluations={filteredForExport} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
