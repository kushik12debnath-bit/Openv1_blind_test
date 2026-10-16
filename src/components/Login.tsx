import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { COKE_LOGO_URL } from '../lib/sensory';
import { DEMO_USERS, authenticate } from '../lib/auth';
import type { DemoUser } from '../lib/auth';

export function LoginScreen({ onLogin }: { onLogin: (u: DemoUser) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = authenticate(username, password);
    if (!user) {
      setError('Invalid credentials. Use one of the demo role accounts below.');
      return;
    }
    setError('');
    onLogin(user);
  }

  function quickFill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B] p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-[920px] overflow-hidden rounded-2xl bg-white shadow-lift lg:grid-cols-2"
      >
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#F40009] via-[#c80007] to-[#5c0003] p-8 text-white">
          <div className="flex h-14 w-40 items-center justify-center rounded-xl bg-white px-4">
            <img src={COKE_LOGO_URL} alt="Coca-Cola" className="h-8 w-auto object-contain" />
          </div>
          <div className="mt-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
              Sensory & Blind Taste Intelligence
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Executive demo portal</h1>
            <p className="mt-2 max-w-[360px] text-[13px] font-medium text-white/80">
              Role-gated access: Admins run everything, Executives see BI telemetry, Testers run blind evaluations only.
            </p>
            <div className="tnum mt-6 flex flex-col gap-2 text-[12px] font-bold">
              {DEMO_USERS.map((d) => (
                <button
                  key={d.username}
                  onClick={() => quickFill(d.username, d.password)}
                  className="flex items-center justify-between rounded-xl bg-white/12 px-3 py-2 text-left ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
                >
                  <span className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    {d.username} / {d.password}
                  </span>
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] uppercase tracking-wide">{d.role}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-white/60">
            <ShieldCheck className="h-4 w-4" /> Demo auth is client-side only · sessions clear on tab close
          </div>
        </div>

        <form onSubmit={submit} className="tnum flex flex-col justify-center gap-4 p-8">
          <div className="flex items-center gap-2 text-slate-900">
            <FlaskConical className="h-5 w-5 text-[#F40009]" />
            <span className="text-lg font-extrabold tracking-tight">Sign in by role</span>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Username</span>
            <input
              data-testid="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, executive, tester"
              autoComplete="username"
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#F40009] focus:ring-2 focus:ring-[rgba(244,0,9,0.15)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Password</span>
            <input
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#F40009] focus:ring-2 focus:ring-[rgba(244,0,9,0.15)]"
            />
          </label>
          {error && (
            <div data-testid="login-error" className="rounded-xl bg-red-50 px-3 py-2 text-[13px] font-bold text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}
          <button
            data-testid="login-submit"
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F40009] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#D10007] active:scale-[0.99]"
          >
            <Lock className="h-4 w-4" /> Sign in securely
          </button>
          <div className="text-[11px] font-medium leading-relaxed text-slate-400">
            Test matrix: admin unlocks Terminal + Reveal + Dashboard + CSV/PDF · executive unlocks Reveal + Dashboard + exports · tester unlocks Terminal + Reveal only.
          </div>
        </form>
      </motion.div>
    </div>
  );
}
