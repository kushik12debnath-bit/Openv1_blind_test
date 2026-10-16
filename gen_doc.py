"""Generate Openv1_blind_test process-flow PDF with fpdf2 (ASCII-safe)."""
import os
from fpdf import FPDF

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")
os.makedirs(OUT_DIR, exist_ok=True)
OUT = os.path.join(OUT_DIR, "Openv1_blind_test_Process_Flow.pdf")

RED = (244, 0, 9)
DARK = (9, 9, 11)
SLATE = (71, 85, 105)


class Doc(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 12, "F")
        self.set_xy(10, 3)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(255, 255, 255)
        self.cell(0, 6, "Coca-Cola Sensory Intelligence  |  Openv1_blind_test  |  Process Flow & Connections")
        self.set_xy(10, 16)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*SLATE)
        self.cell(0, 6, f"Page {self.page_no()}/{{nb}}   |   Generated 2026-10-16   |   Demo auth is client-side only", align="C")

    def h1(self, t):
        self.set_x(10)
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(*RED)
        self.multi_cell(190, 8, t, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*RED)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def h2(self, t):
        self.set_x(10)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*DARK)
        self.set_fill_color(248, 250, 252)
        self.multi_cell(190, 7, t, fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, t):
        self.set_x(10)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 41, 59)
        self.multi_cell(190, 5.2, t, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def bullets(self, items):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 41, 59)
        for it in items:
            self.set_x(10)
            self.multi_cell(190, 5.2, "-  " + it, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def table(self, head, rows):
        self.set_font("Helvetica", "B", 8.5)
        self.set_fill_color(*DARK)
        self.set_text_color(255, 255, 255)
        widths = [52, 48, 90] if len(head) == 3 else [38, 38, 38, 76]
        if len(head) == 5:
            widths = [30, 34, 30, 40, 56]
        for i, h in enumerate(head):
            self.cell(widths[i], 7, h, border=1, fill=True)
        self.ln()
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(30, 41, 59)
        for r in rows:
            for i, c in enumerate(r):
                self.cell(widths[i], 6.5, c, border=1)
            self.ln()
        self.ln(2)


pdf = Doc()
pdf.alias_nb_pages("{nb}")
pdf.set_auto_page_break(True, 16)

# COVER
pdf.add_page()
pdf.set_fill_color(*RED)
pdf.rect(0, 0, 210, 92, "F")
pdf.set_xy(12, 14)
pdf.set_text_color(255, 255, 255)
pdf.set_font("Helvetica", "B", 11)
pdf.cell(0, 6, "COCA-COLA  |  SENSORY & BLIND TASTE INTELLIGENCE PLATFORM")
pdf.ln(10)
pdf.set_font("Helvetica", "B", 26)
pdf.multi_cell(0, 11, "Openv1_blind_test\nProcess Flow,\nConnections & Runbook")
pdf.set_font("Helvetica", "", 11)
pdf.cell(0, 7, "Website end-to-end flow  |  Role-wise access  |  Deployments  |  Verification log")
pdf.set_xy(12, 100)
pdf.set_text_color(30, 41, 59)
pdf.set_font("Helvetica", "B", 10)
pdf.cell(0, 6, "Live endpoints")
pdf.ln(6)
pdf.set_font("Helvetica", "", 10)
pdf.multi_cell(0, 6, "Local dev : http://localhost:5174/\nProduction (Vercel) : https://coca-sensory.vercel.app\nMirror : https://coca-sensory-3yh4wxwil-kushik12debnath-bits-projects.vercel.app\nGitHub : https://github.com/kushik12debnath-bit/Openv1_blind_test\nDesktop copy : C:\\Users\\Kaushik\\Desktop\\Openv1_blind test\\\nSource repo : C:\\Users\\Kaushik\\coca-sensory\\")
pdf.ln(2)
pdf.set_font("Helvetica", "B", 10)
pdf.cell(0, 6, "Demo credentials (role-wise)")
pdf.ln(6)
pdf.table(["Username", "Password", "Role + access"],
          [["admin", "admin123", "Admin: Terminal + Reveal + Dashboard + CSV/PDF"],
           ["executive", "exec123", "Executive: Reveal + Dashboard + exports"],
           ["tester", "test123", "Tester: Terminal + Reveal only"]])
pdf.body("Auth is demo-grade client-side only (src/lib/auth.ts, sessionStorage). Invalid logins are rejected with an inline error. This document describes every screen flow, every connection between code, data, and deployments, and the exact verification performed.")

# 1 SYSTEM MAP
pdf.add_page()
pdf.h1("1. System map (what connects to what)")
pdf.h2("1.1 One-picture architecture")
pdf.body("Browser (React SPA, Vite)  -->  In-memory state (evaluations[1240 + new], filters, session)\n  |--> Charts render from filtered state (Recharts, no backend calls)\n  |--> CSV export serializes filtered state to a downloaded file\n  |--> PDF report opens a print sheet from filtered state (window.print)\n  |--> Auth gate reads src/lib/auth.ts role table + sessionStorage\nBuild (tsc + vite) --> dist/ --> Vercel CDN (production URL)\nSource (C:\\Users\\Kaushik\\coca-sensory) --> git --> GitHub Openv1_blind_test --> Vercel project coca-sensory\nSource --> robocopy --> Desktop copy Openv1_blind test (source-only, needs npm install)")
pdf.h2("1.2 Ports & environments")
pdf.table(["Env", "URL", "Notes"],
          [["Local Vite", "http://localhost:5174/", "npm run dev -- --port 5174"],
           ["Prod Vercel", "https://coca-sensory.vercel.app", "READY, HTTP 200 verified"],
           ["Prod mirror", "https://coca-sensory-...vercel.app", "Direct deployment URL"],
           ["GitHub", "github.com/.../Openv1_blind_test", "Public, branch main"]])
pdf.h2("1.3 Code map (file -> responsibility)")
pdf.bullets([
    "src/App.tsx: session restore, role gating, module switch, toast bus, CSV/PDF handlers.",
    "src/lib/auth.ts: DEMO_USERS, authenticate(), canAccess(), allowedModules(), canExport(), session save/restore.",
    "src/components/Login.tsx: login form, quick-fill role buttons, invalid-credential error.",
    "src/components/chrome.tsx: TopNav (role-filtered nav + user badge + logout), KpiCard, FilterBar, GlassTooltip, ToastStack.",
    "src/components/Terminal.tsx: Module A blind terminal (batch codes, 6 sliders x2, 15s rinse, forced choice, metadata).",
    "src/components/Reveal.tsx: Module B spring flip (stiffness 260, damping 20), Coke vs Competitor cards, baseline bars.",
    "src/components/Dashboard.tsx: Module C KPIs + Donut/Radar/Bar/Area (ResponsiveContainer 100%x320) + export buttons.",
    "src/components/ReportModal.tsx: executive print sheet (#executive-print-sheet) with KPIs, chi-square table, snapshots.",
    "src/lib/sensory.ts: types, seed dataset N=1240 (68.4% Coke), filters, summaries, baselines 8.9 vs 7.1.",
    "src/lib/export.ts: RFC-4180 CSV builder + browser download, print trigger.",
    "vercel.json / vite.config.ts / tailwind.config.js: SPA rewrites, build, brand tokens (#F40009, #09090B, #F8FAFC).",
])

# 2 AUTH FLOW
pdf.add_page()
pdf.h1("2. Auth & role-wise access flow")
pdf.h2("2.1 Login sequence")
pdf.body("1) App boots -> restoreSession() checks sessionStorage key coca-sensory-session-v1.\n2) No session -> <LoginScreen/> (branded split panel, username + password, quick-fill buttons).\n3) Submit -> authenticate(username, password) exact-matches DEMO_USERS (case-insensitive username).\n4) Fail -> inline error: 'Invalid credentials. Use one of the demo role accounts below.' Session stays logged-out.\n5) Success -> saveSession(), allowedModules(role) computed, landing = terminal if allowed else first allowed module, toast 'Signed in as X'. TopNav shows 'username - ROLE' + Log out.")
pdf.h2("2.2 Permission matrix (enforced in UI)")
pdf.table(["Capability", "admin", "executive", "tester"],
          [["Terminal submit", "YES", "NO (hidden)", "YES"],
           ["Reveal view", "YES", "YES", "YES"],
           ["Dashboard BI", "YES", "YES", "NO (hidden)"],
           ["CSV export", "YES", "YES", "BLOCKED+toast"],
           ["PDF report", "YES", "YES", "BLOCKED+toast"]])
pdf.body("Nav is filtered: NAV_ITEMS.filter(item => allowed.includes(item.id)). Direct module changes go through handleModuleChange() which re-checks canAccess() and toasts 'Access restricted' on violation. Dashboard/Terminal bodies double-check canAccess before rendering. Tester banner shows 'Exports disabled for tester role'. Logout clears sessionStorage, lastDraft, and report modal.")
pdf.h2("2.3 Verified login test log (browser automation, 2026-10-16)")
pdf.table(["Test", "Input", "Observed", "Result"],
          [["Admin login", "admin/admin123", "ADMIN, modules terminal-reveal-dashboard, N=1,240", "PASS"],
           ["Executive login", "executive/exec123", "EXECUTIVE, modules reveal-dashboard, no terminal", "PASS"],
           ["Tester login", "tester/test123", "TESTER, modules terminal-reveal, exports disabled", "PASS"],
           ["Invalid login", "hacker/wrong", "Inline invalid-credentials error, stays on login", "PASS"],
           ["Logout", "Log out button", "Returns to Executive demo portal login", "PASS"]])

# 3 MODULE FLOWS
pdf.add_page()
pdf.h1("3. Module flows (A / B / C)")
pdf.h2("Module A - Live Blind Evaluation Terminal (tester + admin)")
pdf.body("Entry: TopNav 'Blind Evaluation'. Two masked samples Batch #AAA and #BBB (random 100-999, distinct; secret cokeIsA flag decides which hides Coca-Cola). Each sample card has six 1-10 sliders: Carbonation Bite, Brix/Sweetness, Acidity/Citrus, Caramel/Spice Aroma, Mouthfeel/Viscosity, Aftertaste Cleanliness, with live badge + card mean. Center Palate Cleanser card runs a 15s countdown (Start/Restart rinse, progress bar, Ready state) encouraging a water rinse between samples. Forced-choice offers Batch #A / Batch #B / Tie; metadata offers Age (18-24, 25-34, 35-44, 45+), Frequency (Daily/Weekly/Occasional), Location (Mall Kiosk, University Campus, Corporate Lounge). Submit is disabled until a choice is picked. On submit the secret mapping converts display pick to BrandChoice (coca-cola/competitor/tie), computes cokeMean/compMean, prepends the Evaluation (id SES-xxxxxx, ISO timestamp), opens Reveal, fires toast, and mints a fresh batch pair.")
pdf.h2("Module B - Unblinding & Brand Reveal (all roles)")
pdf.body("Entry: TopNav 'Unblinding Reveal' (pulsing dot when a fresh ballot is pending). Empty state ('No sealed ballot yet' + CTA) shows if nothing was submitted this session. Otherwise a dark header shows ballot id, timestamp, location, age, frequency. Two cards flip in with Framer Motion spring (type spring, stiffness 260, damping 20, second card delayed 0.12s, perspective 1200): left red-gradient Coca-Cola Original Taste card (official SVG logo on white, secret #cokeCode, your coke mean, per-metric you-vs-baseline bars) and right slate-blue Competitor card (secret #compCode, your comp mean, same bars). Verdict strip compares your gap to the national gap (8.9 vs 7.1 = 1.8 pts): tie message, aligned message (68.4% also chose Coke), or contrarian message, plus CTA into telemetry.")
pdf.h2("Module C - Executive Telemetry Dashboard (admin + executive)")
pdf.body("Entry: TopNav 'Executive Telemetry'. FilterBar (Location / Age / 24H-7D-30D-All) drives applyFilters() -> summarize() for every KPI and chart. KPI ribbon: Net Preference Share (cokeShare %, +14.2% vs Q3 pill), Statistical Significance (p<0.001, 99.9% CI chi-square), Mean Organoleptic Index (cokeMean vs compMean, delta), Blind-to-Brand Conversion (loyalty %). Charts (each in fixed 320px parent + ResponsiveContainer 100%x320): Donut (Coke #F40009 / Competitor #3B82F6 / Tie #94A3B8, center cokeShare% + N), Radar (6 axes, Coke vs Competitor means), Bar (per-cohort Coke/Competitor/Tie %), Area spline (10-day cumulative counts per location). Empty-state guards replace every chart when filters match zero rows. Export row offers CSV telemetry + Executive PDF report buttons (export-gated by role).")

# 4 DATA + EXPORTS
pdf.add_page()
pdf.h1("4. Data, exports & report engine")
pdf.h2("4.1 Seed dataset (src/lib/sensory.ts)")
pdf.body("generateSeedEvaluations(1240) uses a mulberry32 PRNG (seed 20260214) so the demo is stable: 68.4% coca-cola / 24.6% competitor / ~7% tie; locations 38/33/29; ages 28/34/22/16; frequencies 42/38/20; timestamps spread over 14 days, sorted newest-first. Per-metric scores jitter around NATIONAL_BASELINE_COKES [8.8,9.0,8.7,8.9,8.8,9.1] and NATIONAL_BASELINE_COMP [7.0,7.3,6.9,7.2,7.0,7.2] with winner-dependent offsets, clamped 1-10. New terminal submissions prepend live and instantly move every KPI/chart because they derive from the same evaluations array.")
pdf.h2("4.2 Evaluation record")
pdf.body("id, timestamp (ISO), location, ageCohort, frequency, batchCoke (secret Coke code), batchComp (secret competitor code), cokeScores[6], compScores[6], preference (coca-cola|competitor|tie), cokeMean, compMean.")
pdf.h2("4.3 CSV export (evaluationsToCsv, RFC-4180)")
pdf.body("Header: session_id, timestamp, location, age_cohort, consumption_frequency, batch_coke_code, batch_competitor_code, coke_carbonation..coke_aftertaste (6), competitor_* (6), coke_mean, competitor_mean, winning_brand. Values quoted per RFC-4180, CRLF line endings. Filename: coca-cola-blind-test-telemetry.csv. Exports the currently filtered set; toast confirms row count. Testers are blocked with an 'Export blocked' toast.")
pdf.h2("4.4 Executive PDF report (ReportModal + print CSS)")
pdf.body("Button 'Executive PDF report' (dashboard) or 'Generate Executive PDF' opens #executive-print-sheet modal: logo header, generation timestamp, N, 4 KPI tiles, chi-square summary table (observed vs null-33.3% expected per outcome + verdict line), preference-split bars snapshot, per-metric means snapshot. Print button calls window.print(); @media print CSS isolates the sheet (body hidden, sheet absolute, .no-print controls removed). Operator picks 'Save as PDF', 1 page, background graphics ON. Testers are blocked with a 'Report blocked' toast.")

# 5 DEPLOY + RUNBOOK
pdf.add_page()
pdf.h1("5. Deployments, runbook & verification")
pdf.h2("5.1 Connection pipeline")
pdf.bullets([
    "Local source C:\\Users\\Kaushik\\coca-sensory --npm run dev--> http://localhost:5174 (HMR, verified).",
    "Local source --npm run build (tsc -b + vite, 2913 modules, ~5s)--> dist/ (git-ignored).",
    "Local source --git init/add/commit--> GitHub kushik12debnath-bit/Openv1_blind_test, branch main (public).",
    "Local source --robocopy (excl. node_modules/.git/dist)--> Desktop Openv1_blind test (needs npm install to run).",
    "Local source --vercel --prod --yes--> Vercel project coca-sensory --> https://coca-sensory.vercel.app (READY).",
    "Vercel build mirrors local: npm install (148 pkgs) + npm run build on 2-core/8GB iad1 runner.",
    "Git auto-link showed 'Failed to connect Openv1_blind_test' warning; upload deploy succeeded. Link manually in Vercel Dashboard > coca-sensory > Settings > Git for auto-deploys.",
])
pdf.h2("5.2 Run locally (either copy)")
pdf.body("1) cd into C:\\Users\\Kaushik\\coca-sensory OR C:\\Users\\Kaushik\\Desktop\\Openv1_blind test\n2) npm install\n3) npm run dev -- --port 5174  (open http://localhost:5174)\n4) Sign in: admin/admin123 (full), executive/exec123 (BI), tester/test123 (terminal).\n5) Terminal -> pick a batch -> Submit -> Reveal flip -> Dashboard telemetry moves. Dashboard -> CSV / PDF buttons.")
pdf.h2("5.3 Verification log (this session)")
pdf.table(["Check", "Command / action", "Evidence", "OK?"],
          [["Build", "npm run build", "tsc+vite, 2913 modules, 4.98s, no TS errors", "YES"],
           ["Local HTTP", "curl localhost:5174", "status:200, correct title", "YES"],
           ["Prod HTTP", "curl coca-sensory.vercel.app", "status:200", "YES"],
           ["GitHub push", "gh repo create+push", "Openv1_blind_test, HEAD->main", "YES"],
           ["Desktop copy", "robocopy+rename", "Desktop\\Openv1_blind test, 31 files", "YES"]])
pdf.h2("5.4 Limits & next steps")
pdf.bullets([
    "Auth is demo-only (plaintext demo passwords in src/lib/auth.ts). For production add a real backend (OAuth/OIDC), hashed passwords, and server-side role checks.",
    "Telemetry lives in browser memory; refresh resets to the 1240 seed. Persist via API + database for multi-user panels.",
    "Bundle is ~850KB JS (Recharts + Framer). Code-split Dashboard/Terminal/Reveal with React.lazy for faster first paint if needed.",
    "To re-deploy: edit -> npm run build -> git add/commit/push -> vercel --prod --yes (or auto-deploy once Git is linked).",
])

pdf.output(OUT)
print("WROTE:" + OUT)
