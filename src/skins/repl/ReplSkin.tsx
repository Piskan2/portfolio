import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-mono/700.css';
import {
  profile,
  projects,
  writing,
  experience,
  skillGroups,
  displayedExperienceCount,
  contact,
} from '../../examples/content';
import './repl.css';

/**
 * Concept skin: "REPL" — a full-screen, non-scrolling typeable terminal.
 *
 * Layout is a single fixed viewport divided into three zones:
 *   1. <nav>  — title bar (host + section shortcut buttons)
 *   2. <main> — the screen: one terminal stream with a live prompt line
 *               as its last element (in-buffer, MS-DOS style; it scrolls
 *               with the content, it is not pinned chrome)
 *   3. <footer> — CLI status bar (credentials · path · counts · live clock)
 *
 * "home" (the hero, data-section="hero") is a neofetch-style info panel with
 * an ASCII terminal emblem and a live command transcript. Typing a section
 * command (projects / writing / …) swaps the active view; home commands
 * (help / whoami / date / ls / clear / sudo hire me) return to home and echo
 * into the transcript. No factual string is hardcoded — every name, company,
 * date and location comes from content.ts.
 *
 * On power-up the screen runs an MS-DOS-style BIOS POST (decorative chrome —
 * the counts inside it are derived from content.ts), with a CRT power-on
 * (thin line → overshoot → settle) and a blink cursor. Any keypress skips the
 * POST. The POST always runs — it is a text sequence with no spatial motion,
 * so it is safe under prefers-reduced-motion; that setting only kills the
 * power-on transforms and the caret blink. `reboot` reruns the sequence;
 * `shutdown` asks [y/N] and refuses politely. The POST adds no keyframes:
 * line reveals are JS timers and the power-on is one-shot transforms, so the
 * skin keeps exactly one @keyframes (the caret blink, shared with the boot
 * cursor). A `Motion` row on the home panel reports the active media state.
 */

// ── Derived identity ─────────────────────────────────────────────────────
// Initials for the prompt host: strip diacritics, first letter of each word,
// lowercase. Derived from profile.name (never hardcoded).
function deriveHost(): string {
  return profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '');
}

const HOST = deriveHost();
const PRIMARY_SKILLS = skillGroups
  .flatMap((g) => g.skills)
  .filter((s) => s.primary)
  .map((s) => s.name);

type View = 'home' | 'projects' | 'writing' | 'experience' | 'skills' | 'contact';
type SectionId = Exclude<View, 'home'>;

type CmdLine =
  | { kind: 'cmd'; cmd: string }
  | { kind: 'out'; text: string; tone?: 'normal' | 'warn'; link?: { href: string; label: string } }
  | { kind: 'help'; cmd: string; alias?: string; desc: string };

const MAX_LINES = 60;

// Map of accepted command spellings → the view they open.
const VIEW_COMMANDS: Record<string, View> = {
  projects: 'projects',
  ls: 'projects',
  writing: 'writing',
  blog: 'writing',
  experience: 'experience',
  resume: 'experience',
  skills: 'skills',
  stack: 'skills',
  contact: 'contact',
  mail: 'contact',
  home: 'home',
  '~': 'home',
  neofetch: 'home',
};

// "nothing printed yet" state for the on-demand print model; reused by
// `clear` and `reboot` (cold start).
const NO_PRINTED: Record<SectionId, boolean> = {
  projects: false,
  writing: false,
  experience: false,
  skills: false,
  contact: false,
};

// Section list used for the title-bar shortcuts and the `help` / `ls` output.
const SECTIONS: { id: View; label: string }[] = [
  { id: 'projects', label: 'projects' },
  { id: 'writing', label: 'writing' },
  { id: 'experience', label: 'experience' },
  { id: 'skills', label: 'skills' },
  { id: 'contact', label: 'contact' },
];

// One-line echo shown in the transcript when a section view opens.
function viewEcho(view: View): string {
  switch (view) {
    case 'projects':
      return `ls: ${projects.length} entries in ./projects`;
    case 'writing':
      return writing.length ? `ls: ${writing.length} entries in ./writing` : 'ls: ./writing is empty';
    case 'experience':
      return `cat: ${experience.length} records in ./experience`;
    case 'skills':
      return `env: ${skillGroups.length} groups loaded`;
    case 'contact':
      return 'open ./contact';
    default:
      return '~ (home)';
  }
}

// help table: primary command, optional alias(es), description. Rendered as
// an aligned 3-column grid (see .repl-helpline) so the wall of text is a
// scannable list.
const HELP_ITEMS: { cmd: string; alias?: string; desc: string }[] = [
  { cmd: 'projects', alias: 'ls', desc: 'list shipped projects' },
  { cmd: 'writing', alias: 'blog', desc: 'list published writing' },
  { cmd: 'experience', alias: 'resume', desc: 'work history (changelog)' },
  { cmd: 'skills', alias: 'stack', desc: 'skill groups (env)' },
  { cmd: 'contact', alias: 'mail', desc: 'how to reach me' },
  { cmd: 'whoami', desc: 'identity card' },
  { cmd: 'date', desc: 'current date & time' },
  { cmd: 'home', alias: '~ · neofetch', desc: 'return to this shell' },
  { cmd: 'clear', alias: 'cls', desc: 'clear the screen' },
  { cmd: 'reboot', desc: 'cold restart — reruns the boot sequence' },
  { cmd: 'shutdown', desc: 'power off (asks [y/N]; refuses politely)' },
  { cmd: 'sudo hire me', desc: 'attempt the front door (easter egg)' },
  { cmd: 'uname -a', desc: 'machine report' },
  { cmd: 'pwd', desc: 'print the current view' },
  { cmd: 'history', desc: 'what you have typed this session' },
];

function helpRows(): CmdLine[] {
  return [
    { kind: 'out', text: 'available commands:' },
    ...HELP_ITEMS.map((h): CmdLine => ({ kind: 'help', ...h })),
  ];
}

// ── Home: live mini-session (replaces the old empty ASCII emblem box) ────
// A tiny, live-typed terminal session in the neofetch left column. Every line
// is content-derived. It types command-by-command via JS timers (text only —
// vestibular-safe) and collapses to the finished state under
// prefers-reduced-motion. Presentational, so it is aria-hidden: the identity
// column carries the real facts for screen readers.
type SessionSeg = { text: string; tone: 'cmd' | 'out' };
type SessionFrame = { seg: number; chars: number };
type MiniSessionProps = { active: boolean; reduceMotion: boolean };

const SESSION_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtSessionDate(d: Date): string {
  return `${SESSION_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function buildSession(): SessionSeg[] {
  const d = new Date();
  const who = profile.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ')[0].toLowerCase();
  return [
    { text: 'whoami', tone: 'cmd' },
    { text: who, tone: 'out' },
    { text: 'uptime', tone: 'cmd' },
    { text: careerUptime(d.getTime()), tone: 'out' },
    { text: 'date', tone: 'cmd' },
    { text: fmtSessionDate(d), tone: 'out' },
  ];
}

function buildFrames(segs: SessionSeg[]): SessionFrame[] {
  const f: SessionFrame[] = [];
  segs.forEach((seg, i) => {
    if (seg.tone === 'cmd') {
      for (let c = 1; c <= seg.text.length; c++) f.push({ seg: i, chars: c });
    } else {
      f.push({ seg: i, chars: seg.text.length });
      f.push({ seg: i, chars: seg.text.length }); // one-tick beat after each output
    }
  });
  return f;
}

function MiniSession({ active, reduceMotion }: MiniSessionProps) {
  const session = useMemo(() => buildSession(), []);
  const frames = useMemo(() => buildFrames(session), [session]);
  const [step, setStep] = useState(reduceMotion ? frames.length : 0);

  // Type one frame per tick. The reset is handled by a key remount in the
  // parent; the only mutation here is inside the interval callback.
  useEffect(() => {
    if (!active || reduceMotion) return;
    const id = window.setInterval(() => {
      setStep((s) => (s >= frames.length ? s : s + 1));
    }, 55);
    return () => window.clearInterval(id);
  }, [active, reduceMotion, frames.length]);

  if (!active) return <div className="repl-session" aria-hidden="true" />;

  const cur = step === 0 ? -1 : frames[step - 1].seg;
  const curChars = step === 0 ? 0 : frames[step - 1].chars;
  const done = step >= frames.length;

  return (
    <div className="repl-session" aria-hidden="true">
      {session.map((seg, i) => {
        if (i > cur) return null;
        const shown = i < cur ? seg.text.length : curChars;
        return (
          <span className="repl-session-line" key={i}>
            {seg.tone === 'cmd' && <span className="repl-session-prompt">$ </span>}
            <span className={seg.tone === 'cmd' ? 'repl-cmdtext' : 'repl-out'}>
              {seg.text.slice(0, shown)}
            </span>
            {i === cur && !done && <span className="repl-caret">█</span>}
          </span>
        );
      })}
      {done && (
        <span className="repl-session-line">
          <span className="repl-session-prompt">$ </span>
          <span className="repl-caret">█</span>
        </span>
      )}
    </div>
  );
}

// Career uptime: years / months since the user entered IT. The start date is
// defined in content.ts and derived at runtime — never hardcoded in the skin.
const CAREER_START = (() => {
  const [y, m] = profile.careerStart.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, 1);
})();

function careerUptime(now: number): string {
  const d = new Date(now);
  const years = d.getFullYear() - CAREER_START.getFullYear();
  let months = d.getMonth() - CAREER_START.getMonth();
  if (d.getDate() < CAREER_START.getDate()) months -= 1;
  if (months < 0) months += 12;
  return `${years}y ${months}m`;
}

// neofetch-style info column (all values from content.ts; Career is derived
// from the live clock below, so this row list lives inside the component).
// Order follows the plan: Shell / Role / Company / Location / Experience /
// Stack / Projects / Education / Career / Motion / Status.
function buildInfoRows(
  now: number,
  motionReduced: boolean,
): { k: string; v: string }[] {
  return [
    { k: 'Shell', v: 'zsh' },
    { k: 'Role', v: profile.role },
    { k: 'Company', v: profile.currentCompany },
    { k: 'Location', v: profile.location },
    { k: 'Experience', v: profile.yearsExperience },
    { k: 'Stack', v: PRIMARY_SKILLS.slice(0, 5).join(' · ') },
    { k: 'Projects', v: `${projects.length} shipped` },
    { k: 'Education', v: profile.education[0] ? `${profile.education[0].degree} · ${profile.education[0].institution}` : '—' },
    { k: 'Career', v: careerUptime(now) },
    { k: 'Motion', v: motionReduced ? 'reduced' : 'full' },
    { k: 'Status', v: `happy at ${profile.currentCompany}` },
  ];
}

// Theme swatch strip: pairs of [css token, label]. Rendered as flat squares.
const SWATCHES: { token: string; label: string }[] = [
  { token: '--repl-bg', label: 'bg' },
  { token: '--repl-surface', label: 'surface' },
  { token: '--repl-border', label: 'border' },
  { token: '--repl-muted', label: 'muted' },
  { token: '--repl-ink', label: 'ink' },
  { token: '--repl-accent-1', label: 'accent-1' },
  { token: '--repl-accent-2', label: 'accent-2' },
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fmtClock(ts: number): string {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}


const BOOT_LINES: CmdLine[] = [
  { kind: 'cmd', cmd: 'whoami' },
  { kind: 'out', text: `${profile.name} — ${profile.role}` },
  { kind: 'cmd', cmd: 'ls' },
  { kind: 'out', text: SECTIONS.map((s) => s.label).join('   ') },
  { kind: 'out', text: "type 'help' for the full command list" },
];

// ── BIOS POST sequence ─────────────────────────────────────────────────
// Decorative chrome (same class as the 'REPL v1.0' status text) — the ONLY
// non-allowed literals. Every count inside it derives from content.ts.
type BootLine = { text: string; tone?: 'accent' | 'dim'; gap?: number };

function buildBootSequence(): BootLine[] {
  const subsys = (name: string, n: number, unit: string): string =>
    `  [ OK ] ${name.padEnd(14)} ${String(n).padStart(2)} ${unit}`;
  const bar = (n: number): string =>
    `[${'█'.repeat(n * 2)}${'░'.repeat(20 - n * 2)}]  ${n * 10}%`;
  return [
    { text: 'PORTFOLIO BIOS v1.0', tone: 'accent' },
    { text: `(c) ${new Date().getFullYear()}`, tone: 'dim', gap: 60 },
    { text: '' },
    { text: 'MEMORY TEST .......... 640K OK', gap: 120 },
    { text: 'DETECTING SUBSYSTEMS', tone: 'dim', gap: 140 },
    { text: subsys('projects.sys', projects.length, 'devices') },
    { text: subsys('writing.sys', writing.length, 'entries') },
    { text: subsys('experience.sys', experience.length, 'records') },
    { text: subsys('skills.sys', skillGroups.length, 'groups') },
    { text: 'LOADING KERNEL', tone: 'dim', gap: 160 },
    { text: bar(2), gap: 150 },
    { text: bar(4), gap: 120 },
    { text: bar(7), gap: 100 },
    { text: bar(10), gap: 220 },
    { text: 'BOOT COMPLETE', tone: 'accent', gap: 300 },
  ];
}
const BOOT_SEQ: BootLine[] = buildBootSequence();

export default function ReplSkin(): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  const [activeView, setActiveView] = useState<View>('home');
  // On-demand print: a section only appears in the stream once a command (or
  // a title-bar tab) prints it; the hero (home) is always present.
  const [printed, setPrinted] = useState<Record<SectionId, boolean>>(NO_PRINTED);
  // Pending scroll target (n = monotonic counter so re-prints re-scroll even
  // when the target is unchanged). target: 'prompt' = cursor at the bottom of
  // the stream (terminal semantics), 'top' = back to the hero (home semantics).
  const [scrollReq, setScrollReq] = useState<{ target: 'top' | 'prompt'; n: number }>({ target: 'prompt', n: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  // Scrollback review: true while the user is >40px above the bottom of the
  // stream (reading upward). Ref, not state — a scroll handler must not
  // re-render, and the auto-scroll effects read it to decide whether to snap.
  const userScrolledUpRef = useRef<boolean>(false);
  const [lines, setLines] = useState<CmdLine[]>(BOOT_LINES);
  const [input, setInput] = useState('');
  // The first-run hint above the prompt is gone once any real command is run.
  const [hintSeen, setHintSeen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const histIdxRef = useRef<number | null>(null);
  // Lazy init reads the clock once on mount; the interval below keeps it
  // ticking always — a per-second text update, not motion (no setState in
  // the effect body).
  const [now, setNow] = useState<number>(() => Date.now());
  const [reduceMotion] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // CRT power-on phase: thin line → overshoot → settle. Skipped (starts
  // 'settled') when the user prefers reduced motion.
  const [power, setPower] = useState<'off' | 'on' | 'settled'>(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'settled'
        : 'off',
  );
  // BIOS POST: booting = overlay up; bootIdx = index of the last revealed line
  // (-1 before the first line lands). The POST always runs on power-up — it
  // is text with no spatial motion, so it is kept even under
  // prefers-reduced-motion (which only disables the power-on transforms and
  // the caret blink, and the CSS reduced-motion block).
  const [booting, setBooting] = useState<boolean>(() => typeof window !== 'undefined');
  const [bootIdx, setBootIdx] = useState<number>(-1);
  // `shutdown` confirmation flow: when set, the next Enter is parsed as [y/N].
  const [pendingShutdown, setPendingShutdown] = useState<boolean>(false);

  // neofetch info column (Career derived from the live clock; Motion reports
  // the active prefers-reduced-motion state).
  const infoRows = buildInfoRows(now, reduceMotion);
  // The home mini-session types once per boot: the hero is always in the
  // stream now, so the key remount below fires when the POST lifts (and again
  // on `reboot`) — no replay on every home command.
  const sessionOn = !booting;

  // Keep the command input focused: on mount and after every view change, so
  // typing resumes without an extra click.
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeView]);

  // One scroll path: the cursor lives at the prompt (last line of the stream).
  const scrollToPrompt = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      promptRef.current?.scrollIntoView({ behavior, block: 'end' });
    },
    [],
  );

  // Explicit requests: section print / clear / boot end → prompt; home → top.
  useEffect(() => {
    if (scrollReq.n === 0) return; // no request yet (initial mount)
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';
    if (scrollReq.target === 'top') {
      viewportRef.current?.scrollTo({ top: 0, behavior });
    } else {
      scrollToPrompt(behavior);
    }
  }, [scrollReq, reduceMotion, scrollToPrompt]);

  // Typing always snaps back to the prompt — standard terminal-emulator
  // behavior: a keystroke abandons scrollback review. 'auto' (never smooth):
  // a lagging caret during typing feels broken.
  useEffect(() => {
    scrollToPrompt('auto');
  }, [input, scrollToPrompt]);

  // New output (command results, clear, boot reset) lands at the prompt —
  // unless the user has scrolled up to read, in which case we hold position.
  useEffect(() => {
    if (userScrolledUpRef.current) return;
    scrollToPrompt(reduceMotion ? 'auto' : 'smooth');
  }, [lines, reduceMotion, scrollToPrompt]);

  // Track scrollback review: >40px from the bottom = reading upward. Ref-only
  // write — no re-render, so programmatic scrolls can't loop back into here.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onScroll = (): void => {
      userScrolledUpRef.current = vp.scrollHeight - vp.scrollTop - vp.clientHeight > 40;
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // sync the initial position
    return () => vp.removeEventListener('scroll', onScroll);
  }, []);

  // Live clock + uptime: always tick once per second. A once-per-second text
  // update is not spatial motion (same rationale as the always-run BIOS POST),
  // so it is NOT gated on prefers-reduced-motion. (setNow lives inside the
  // interval callback, not the effect body.)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // CRT power-on: thin line → overshoot → settle (one-shot transforms, no
  // keyframes). Each phase is a timer; the effect cleans up on unmount/re-run.
  useEffect(() => {
    if (power === 'off') {
      const t = window.setTimeout(() => setPower('on'), 90);
      return () => window.clearTimeout(t);
    }
    if (power === 'on') {
      const t = window.setTimeout(() => setPower('settled'), 240);
      return () => window.clearTimeout(t);
    }
  }, [power]);

  // BIOS POST: reveal one line per timer tick (per-line gap), then hold and
  // drop the overlay.
  useEffect(() => {
    if (!booting) return;
    const last = BOOT_SEQ.length - 1;
    if (bootIdx < last) {
      const t = window.setTimeout(
        () => setBootIdx((i) => Math.min(last, i + 1)),
        BOOT_SEQ[bootIdx + 1].gap ?? 90,
      );
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setBooting(false);
      setLines(BOOT_LINES); // cold restart: fresh whoami/ls transcript
      setScrollReq((r) => ({ target: 'prompt', n: r.n + 1 })); // cursor at the prompt
    }, 450);
    return () => window.clearTimeout(t);
  }, [booting, bootIdx]);

  // Any keypress during the POST skips straight to the shell.
  useEffect(() => {
    if (!booting) return;
    const skip = (): void => {
      setBooting(false);
      setLines(BOOT_LINES); // cold restart: fresh whoami/ls transcript
      setScrollReq((r) => ({ target: 'prompt', n: r.n + 1 })); // cursor at the prompt
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [booting]);

  // When the overlay lifts, hand focus to the prompt (DOM sync — the state
  // reset happens at each boot-end callback above).
  useEffect(() => {
    if (booting) return;
    inputRef.current?.focus();
  }, [booting]);

  const focusInput = (): void => {
    inputRef.current?.focus();
  };

  const openView = (view: View): void => {
    setActiveView(view);
    if (view !== 'home') {
      // Print the section into the stream (idempotent). Terminal semantics:
      // the cursor sits BELOW the printed block, so we scroll to the prompt,
      // not the section top — the user scrolls up to re-read the block.
      // (Section ids skin-repl-* are kept for the contract, not for scrolling.)
      setPrinted((p) => (p[view] ? p : { ...p, [view]: true }));
      setScrollReq((r) => ({ target: 'prompt', n: r.n + 1 }));
    } else {
      // home = back to the top of the stream. This is return-home semantics
      // (the hero is the home screen), deliberately NOT terminal semantics.
      setScrollReq((r) => ({ target: 'top', n: r.n + 1 }));
    }
    focusInput();
  };

  const runCommand = (raw: string): void => {
    const cmd = raw.trim();
    const lower = cmd.toLowerCase();

    // A pending `shutdown [y/N]` prompt takes precedence over every command.
    if (pendingShutdown) {
      setPendingShutdown(false);
      setHintSeen(true);
      const out: CmdLine[] = [];
      if (lower === 'y' || lower === 'yes') {
        out.push({ kind: 'out', text: 'System halted.' });
        out.push({ kind: 'out', text: 'It is now safe to turn off the computer.' });
        out.push({ kind: 'out', text: "It's a portfolio — it never really powers off. Type 'reboot' to bring it back." });
      } else {
        out.push({ kind: 'out', text: 'shutdown: aborted' });
      }
      setLines((prev) => [...prev, ...out].slice(-MAX_LINES));
      setHistory((prev) => [...prev, raw]);
      histIdxRef.current = null;
      setInput('');
      return;
    }

    if (!cmd) return;

    setHintSeen(true);

    // `clear` wipes the whole screen — do not echo the command itself.
    if (lower === 'clear' || lower === 'cls') {
      setLines([]);
      setPrinted(NO_PRINTED);
      setActiveView('home');
      setScrollReq((r) => ({ target: 'prompt', n: r.n + 1 })); // cursor back at the prompt
      histIdxRef.current = null;
      setInput('');
      return;
    }

    const out: CmdLine[] = [];
    const cmdLine: CmdLine = { kind: 'cmd', cmd };
    let nextView: View | null = null;

    if (lower === 'sudo hire me' || lower === 'hire') {
      nextView = 'home';
      out.push({ kind: 'out', text: `[sudo] password for ${HOST}: ********` });
      out.push({ kind: 'out', text: `root@portfolio: nice try — happy at ${profile.currentCompany}, not looking` });
      out.push({ kind: 'out', text: 'good problems and referrals are still welcome:', link: { href: contact.linkedin, label: `→ ${contact.label}` } });
    } else if (lower === 'help' || lower === '?') {
      nextView = 'home';
      out.push(...helpRows());
    } else if (lower === 'whoami') {
      nextView = 'home';
      out.push({ kind: 'out', text: `${profile.name} <${profile.role}>` });
      out.push({ kind: 'out', text: `    @ ${profile.currentCompany} · ${profile.location}` });
    } else if (lower === 'date') {
      nextView = 'home';
      out.push({ kind: 'out', text: new Date().toLocaleString(undefined, { hour12: false }) });
    } else if (lower === 'uname' || lower === 'uname -a') {
      nextView = 'home';
      out.push({ kind: 'out', text: `portfolio v1.0 · ${profile.currentCompany} · ${profile.location} · ${profile.yearsExperience} · shell zsh` });
    } else if (lower === 'pwd') {
      nextView = 'home';
      out.push({ kind: 'out', text: activeView === 'home' ? '~' : `~/${activeView}` });
    } else if (lower === 'history') {
      nextView = 'home';
      if (history.length === 0) out.push({ kind: 'out', text: 'history: empty' });
      else out.push(...history.map((h, i) => ({ kind: 'out' as const, text: ` ${String(i + 1).padStart(3)}  ${h}` })));
    } else if (lower === 'reboot') {
      nextView = 'home';
      out.push({ kind: 'out', text: 'Broadcasting system message...' });
      out.push({ kind: 'out', text: 'Now rebooting.' });
      setPower('off');
      setBootIdx(-1);
      setPrinted(NO_PRINTED); // cold start: nothing printed yet
      setBooting(true);
    } else if (lower === 'shutdown' || lower === 'poweroff') {
      nextView = 'home';
      out.push({ kind: 'out', text: 'Are you sure you want to shut down? [y/N]' });
      setPendingShutdown(true);
    } else if (VIEW_COMMANDS[lower]) {
      nextView = VIEW_COMMANDS[lower];
      if (lower === 'neofetch') out.push({ kind: 'out', text: `neofetch: ${profile.name} profile loaded` });
      else out.push({ kind: 'out', text: viewEcho(nextView) });
    } else {
      out.push({ kind: 'out', text: `zsh: ${cmd}: command not found — type 'help'`, tone: 'warn' });
    }

    setLines((prev) => [...prev, cmdLine, ...out].slice(-MAX_LINES));
    if (nextView) openView(nextView);
    setHistory((prev) => [...prev, raw]);
    histIdxRef.current = null;
    setInput('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const prev = histIdxRef.current;
      const next = prev === null ? history.length - 1 : Math.max(0, prev - 1);
      histIdxRef.current = next;
      setInput(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = histIdxRef.current;
      if (prev === null) return;
      const next = prev + 1;
      if (next >= history.length) {
        histIdxRef.current = null;
        setInput('');
      } else {
        histIdxRef.current = next;
        setInput(history[next]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // no auto-complete; keep focus on the input
    }
  };

  const pathLabel = activeView === 'home' ? '~' : `~/${activeView}`;
  const powerClass = power === 'off' ? '' : ` is-${power}`;

  return (
    <div
      className={`skin-repl${powerClass}${booting ? ' is-booting' : ''}`}
      onClick={() => {
        if (booting) {
          setBooting(false);
          setLines(BOOT_LINES); // cold restart: fresh whoami/ls transcript
          setScrollReq((r) => ({ target: 'prompt', n: r.n + 1 })); // cursor at the prompt
        }
        focusInput();
      }}
    >
      {/* ── Title bar ─────────────────────────────────────────────── */}
      <nav className="repl-titlebar" aria-label="Sections">
        <span className="repl-titlebar-host">
          <span className="repl-titlebar-user">{HOST}@portfolio</span>
          <span className="repl-titlebar-path">:~$</span>
        </span>
        <div className="repl-titlebar-nav">
          <button
            type="button"
            className={`repl-tab${activeView === 'home' ? ' is-active' : ''}`}
            aria-current={activeView === 'home' ? 'page' : undefined}
            onClick={() => openView('home')}
          >
            home
          </button>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`repl-tab${activeView === s.id ? ' is-active' : ''}`}
              aria-current={activeView === s.id ? 'page' : undefined}
              onClick={() => openView(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Screen: one active view (scrolls) + persistent prompt ──── */}
      <main className="repl-screen">
        {/* BIOS POST overlay — decorative (aria-hidden); real content sits
            beneath it and becomes visible when the overlay lifts. */}
        {booting && (
          <div className="repl-boot" aria-hidden="true">
            {BOOT_SEQ.slice(0, bootIdx + 1).map((l, i) => (
              <p key={i} className={`repl-boot-line${l.tone ? ` is-${l.tone}` : ''}`}>
                {l.text}
              </p>
            ))}
            <span className="repl-boot-caret" aria-hidden="true">█</span>
          </div>
        )}
        <div className="repl-viewport" ref={viewportRef}>
          {/* HOME — neofetch panel + live transcript */}
          <section data-section="hero" className="repl-view repl-hero">
            <div className="repl-neofetch">
              <MiniSession
                key={`${sessionOn ? 1 : 0}${reduceMotion ? 1 : 0}`}
                active={sessionOn}
                reduceMotion={reduceMotion}
              />
              <div className="repl-neofetch-info">
                <div className="repl-neofetch-user">
                  <span className="repl-neofetch-user-name">{HOST}</span>
                  <span className="repl-neofetch-at">@</span>
                  <span className="repl-neofetch-host">portfolio</span>
                </div>
                <h1 className="repl-neofetch-name">{profile.name}</h1>
                <dl className="repl-neofetch-rows">
                  {infoRows.map((row) => (
                    <div className="repl-neofetch-row" key={row.k}>
                      <dt className="repl-neofetch-key">{row.k}</dt>
                      <dd className="repl-neofetch-val">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="repl-swatches" aria-hidden="true">
              {SWATCHES.map((sw) => (
                <span
                  key={sw.token}
                  className="repl-swatch"
                  title={sw.label}
                  style={{ backgroundColor: `var(${sw.token})` }}
                />
              ))}
            </div>

            <ol className="repl-transcript" aria-live="polite">
              {lines.map((line, i) =>
                line.kind === 'cmd' ? (
                  <li className="repl-line repl-cmdline" key={i}>
                    <span className="repl-prefix">
                      {HOST}@portfolio:~$
                    </span>
                    <span className="repl-cmdtext">{line.cmd}</span>
                  </li>
                ) : line.kind === 'help' ? (
                  <li className="repl-line repl-helpline" key={i}>
                    <span className="repl-help-cmd">{line.cmd}</span>
                    <span className="repl-help-alias">{line.alias ?? ''}</span>
                    <span className="repl-help-desc">{line.desc}</span>
                  </li>
                ) : line.link ? (
                  <li className="repl-line repl-out" key={i}>
                    <a className="repl-link" href={line.link.href}>
                      {line.link.label}
                    </a>
                  </li>
                ) : (
                  <li className={`repl-line repl-out${line.tone === 'warn' ? ' is-warn' : ''}`} key={i}>
                    {line.text}
                  </li>
                ),
              )}
            </ol>
          </section>

          {/* PROJECTS — directory listing */}
          <section
            data-section="projects"
            id="skin-repl-projects"
            className={`repl-view${printed.projects ? ' is-printed' : ''}`}
          >
            <p className="repl-view-head">
              <span className="repl-view-dollar">$</span> ls -la <span className="repl-view-target">./projects</span>
            </p>
            <p className="repl-listing-total">total {projects.length} entries</p>
            <ul className="repl-project-list">
              {projects.map((p, i) => (
                <li className="repl-project" key={`${p.title}-${i}`}>
                  <div className="repl-project-line">
                    <span className="repl-project-idx">{pad2(i + 1)}</span>
                    <span className="repl-project-name">{p.title}</span>
                    <span className="repl-project-meta">{p.company} · {p.period}</span>
                  </div>
                  <p className="repl-project-desc">{p.description}</p>
                  <p className="repl-project-stack">
                    <span className="repl-project-stack-key">stack</span>
                    {p.stack.map((t) => (
                      <span className="repl-chip" key={t}>{t}</span>
                    ))}
                  </p>
                  <p className="repl-project-source">
                    <span className="repl-project-source-key">src</span>
                    <span className="repl-project-source-path">{p.source}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* WRITING — empty state per contract */}
          <section
            data-section="writing"
            id="skin-repl-writing"
            className={`repl-view${printed.writing ? ' is-printed' : ''}`}
          >
            <p className="repl-view-head">
              <span className="repl-view-dollar">$</span> ls <span className="repl-view-target">./writing</span>
            </p>
            {writing.length === 0 ? (
              <p className="repl-empty">No published writing yet — engineering work is detailed in Experience.</p>
            ) : (
              <ul className="repl-writing-list">
                {writing.map((w, i) => (
                  <li className="repl-writing" key={`${w.title}-${i}`}>
                    <a className="repl-writing-link" href={w.href}>{w.title}</a>
                    <span className="repl-writing-date">{w.date}</span>
                    <p className="repl-writing-excerpt">{w.excerpt}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* EXPERIENCE — changelog */}
          <section
            data-section="experience"
            id="skin-repl-experience"
            className={`repl-view${printed.experience ? ' is-printed' : ''}`}
          >
            <p className="repl-view-head">
              <span className="repl-view-dollar">$</span> git log <span className="repl-view-target">--oneline ./experience</span>
            </p>
            <ul className="repl-exp-list">
              {experience.slice(0, displayedExperienceCount).map((e, i) => (
                <li className="repl-exp" key={`${e.company}-${e.role}-${i}`}>
                  <div className="repl-exp-head">
                    <span className="repl-exp-hash">#{pad2(experience.length - i)}</span>
                    <span className="repl-exp-company">{e.company}</span>
                    <span className="repl-exp-period">{e.period}</span>
                  </div>
                  <p className="repl-exp-role">{e.role} · {e.location}</p>
                  <p className="repl-exp-desc">{e.description}</p>
                  <ul className="repl-exp-points">
                    {e.achievements.map((a) => (
                      <li className="repl-exp-point" key={a}>
                        <span className="repl-exp-bullet" aria-hidden="true">- </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                  <p className="repl-project-stack">
                    <span className="repl-project-stack-key">stack</span>
                    {e.techStack.map((t) => (
                      <span className="repl-chip" key={t}>{t}</span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* SKILLS — env-style grouped key/value */}
          <section
            data-section="skills"
            id="skin-repl-skills"
            className={`repl-view${printed.skills ? ' is-printed' : ''}`}
          >
            <p className="repl-view-head">
              <span className="repl-view-dollar">$</span> env | <span className="repl-view-target">grep SKILL</span>
            </p>
            <div className="repl-skill-groups">
              {skillGroups.map((g) => (
                <div className="repl-skill-group" key={g.title}>
                  <p className="repl-skill-group-title">
                    <span className="repl-skill-group-sign" aria-hidden="true">#</span> {g.title}
                  </p>
                  <ul className="repl-skill-list">
                    {g.skills.map((s) => (
                      <li className={`repl-skill${s.primary ? ' is-primary' : ''}`} key={s.name}>
                        <span className="repl-skill-name">{s.name}</span>
                        <span className="repl-skill-flag">{s.primary ? '=primary' : '=ok'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT — CTA */}
          <section
            data-section="contact"
            id="skin-repl-contact"
            className={`repl-view${printed.contact ? ' is-printed' : ''}`}
          >
            <p className="repl-view-head">
              <span className="repl-view-dollar">$</span> cat <span className="repl-view-target">./contact</span>
            </p>
            <div className="repl-contact">
              <p className="repl-contact-line">{profile.name} — {profile.role} at {profile.currentCompany}, {profile.yearsExperience} years of shipping.</p>
              <p className="repl-contact-cta">
                <span className="repl-view-dollar">$</span> sudo hire me
              </p>
              <a className="repl-contact-link" href={contact.linkedin}>
                → {contact.label}
              </a>
              <p className="repl-contact-note">Currently {profile.location}.</p>
            </div>
          </section>

          {/* Live prompt — the last line of the stream (in-buffer, not
              pinned): it sits directly below the newest output and scrolls
              with the content. The opacity-0 input overlays just this line
              (the wrapper is position:relative), so any click on it focuses. */}
          {!hintSeen && (
            <p className="repl-hintline">
              <span className="repl-hint-sign" aria-hidden="true">#</span>{' '}
              this is a real terminal — type <span className="repl-hint-cmd">help</span> + enter, or use the tabs
            </p>
          )}
          <div className="repl-promptline" ref={promptRef}>
            <span className="repl-prompt-user">{HOST}@portfolio</span>
            <span className="repl-prompt-path">:~$</span>
            <span className="repl-prompt-spacer" />
            <span className="repl-prompt-echo">{input}</span>
            <span className="repl-caret" aria-hidden="true">█</span>
            {input === '' && !pendingShutdown && (
              <span className="repl-prompt-placeholder" aria-hidden="true">
                type “help” to explore
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              className="repl-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal command input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>
      </main>

      {/* ── Status bar ────────────────────────────────────────────── */}
      <footer className="repl-statusbar">
        <span className="repl-status-repl">{HOST}@portfolio:~</span>
        <span className="repl-status-path">{pathLabel}</span>
        <span className="repl-status-counts">
          {projects.length} projects · {skillGroups.length} groups · {profile.yearsExperience}
        </span>
        <span className="repl-status-clock">{fmtClock(now)}</span>
        <span className="repl-status-status">happy at {profile.currentCompany}</span>
        <span className="repl-status-version">REPL v1.0</span>
      </footer>
    </div>
  );
}

