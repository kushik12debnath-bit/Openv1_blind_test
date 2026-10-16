import type { ModuleId } from './sensory';

export type Role = 'admin' | 'executive' | 'tester';

export interface DemoUser {
  username: string;
  password: string;
  role: Role;
  displayName: string;
}

export const DEMO_USERS: DemoUser[] = [
  { username: 'admin', password: 'admin123', role: 'admin', displayName: 'Platform Admin' },
  { username: 'executive', password: 'exec123', role: 'executive', displayName: 'Executive Viewer' },
  { username: 'tester', password: 'test123', role: 'tester', displayName: 'Sensory Panelist' },
];

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin · Full access',
  executive: 'Executive · BI view',
  tester: 'Tester · Evaluation only',
};

const MODULE_ACCESS: Record<ModuleId, Role[]> = {
  terminal: ['admin', 'tester'],
  reveal: ['admin', 'executive', 'tester'],
  dashboard: ['admin', 'executive'],
};

export function authenticate(username: string, password: string): DemoUser | null {
  const u = username.trim().toLowerCase();
  const found = DEMO_USERS.find((d) => d.username === u && d.password === password);
  return found ?? null;
}

export function canAccess(role: Role, module: ModuleId): boolean {
  return MODULE_ACCESS[module].includes(role);
}

export function allowedModules(role: Role): ModuleId[] {
  return (['terminal', 'reveal', 'dashboard'] as ModuleId[]).filter((m) => canAccess(role, m));
}

export function canExport(role: Role): boolean {
  return role === 'admin' || role === 'executive';
}

const SESSION_KEY = 'coca-sensory-session-v1';

export function saveSession(user: DemoUser): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username }));
  } catch {
    /* storage unavailable in some contexts */
  }
}

export function restoreSession(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { username?: string };
    if (!parsed.username) return null;
    return DEMO_USERS.find((d) => d.username === parsed.username) ?? null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}
