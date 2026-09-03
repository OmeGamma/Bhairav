import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, ArrowRight, Eye, Network, Camera, Map as MapIcon,
  FileSearch, HeartPulse, Sparkles, ChevronRight, Globe, Database, Cpu, Zap,
  ShieldCheck, ScanLine, AlertTriangle, Car, Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

interface FeatureSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: 'blue' | 'olive' | 'amber' | 'rose' | 'violet' | 'cyan';
  visual: React.ReactNode;
}

const ACCENT: Record<string, { text: string; bg: string; border: string; ring: string; soft: string; chip: string }> = {
  blue:   { text: 'text-[var(--color-bhairav-primary)]',   bg: 'bg-[var(--color-bhairav-primary)]/10',   border: 'border-[var(--color-bhairav-primary)]/30',  ring: 'ring-[var(--color-bhairav-primary)]/20',  soft: 'bg-[var(--color-bhairav-primary-soft)]',  chip: 'bg-[var(--color-bhairav-primary-soft)] text-[var(--color-bhairav-primary)]' },
  olive:  { text: 'text-[var(--color-bhairav-olive)]',      bg: 'bg-[var(--color-bhairav-olive)]/10',      border: 'border-[var(--color-bhairav-olive)]/30',     ring: 'ring-[var(--color-bhairav-olive)]/20',     soft: 'bg-[var(--color-bhairav-olive-soft)]',     chip: 'bg-[var(--color-bhairav-olive-soft)] text-[var(--color-bhairav-olive)]' },
  amber:  { text: 'text-[var(--color-bhairav-warning)]',    bg: 'bg-[var(--color-bhairav-warning)]/10',    border: 'border-[var(--color-bhairav-warning)]/30',  ring: 'ring-[var(--color-bhairav-warning)]/20',   soft: 'bg-[var(--color-bhairav-warning)]/10',     chip: 'bg-[var(--color-bhairav-warning)]/10 text-[var(--color-bhairav-warning)]' },
  rose:   { text: 'text-[var(--color-bhairav-critical)]',   bg: 'bg-[var(--color-bhairav-critical)]/10',   border: 'border-[var(--color-bhairav-critical)]/30', ring: 'ring-[var(--color-bhairav-critical)]/20',  soft: 'bg-[var(--color-bhairav-critical)]/10',    chip: 'bg-[var(--color-bhairav-critical)]/10 text-[var(--color-bhairav-critical)]' },
  violet: { text: 'text-[#7C5BC9]',                          bg: 'bg-[#7C5BC9]/10',                          border: 'border-[#7C5BC9]/30',                        ring: 'ring-[#7C5BC9]/20',                        soft: 'bg-[#7C5BC9]/10',                          chip: 'bg-[#7C5BC9]/10 text-[#7C5BC9]' },
  cyan:   { text: 'text-[#3A8FA3]',                          bg: 'bg-[#3A8FA3]/10',                          border: 'border-[#3A8FA3]/30',                        ring: 'ring-[#3A8FA3]/20',                        soft: 'bg-[#3A8FA3]/10',                          chip: 'bg-[#3A8FA3]/10 text-[#3A8FA3]' },
};

// =========================================================
// SLIDE VISUALS — one per feature, all themed
// =========================================================
const VideoIntelligenceVisual = (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[var(--color-bhairav-critical)] animate-pulse" />
      <span className="text-[10px] text-[var(--color-bhairav-text-muted)] font-mono uppercase tracking-widest">Live · CAM-17</span>
    </div>
    <div className="aspect-video rounded-lg bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bhairav-critical)]/5 to-transparent" />
      <Camera size={36} className="text-[var(--color-bhairav-critical)]/60" />
      <span className="absolute top-2 left-2 text-[9px] font-mono text-[var(--color-bhairav-verified)] bg-[var(--color-bhairav-verified)]/10 px-1.5 py-0.5 rounded">● LIVE</span>
      <span className="absolute bottom-2 right-2 text-[9px] font-mono text-[var(--color-bhairav-text-muted)]">BOP-01</span>
    </div>
    <div className="flex gap-2 flex-wrap">
      {[
        { l: 'Person 98%', c: 'critical' },
        { l: 'Vehicle 87%', c: 'warning' },
        { l: 'Track 17', c: 'primary' },
      ].map((t) => (
        <span key={t.l} className={cn('px-2 py-1 rounded text-[10px] font-mono border', ACCENT[t.c === 'critical' ? 'rose' : t.c === 'warning' ? 'amber' : 'blue'].chip, 'border-current/20')}>
          {t.l}
        </span>
      ))}
    </div>
  </div>
);

const NetworkVisual = (
  <div className="aspect-square">
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {[
        [100, 30], [40, 70], [160, 70], [60, 140], [140, 140], [100, 100],
      ].map((p, i, arr) => (
        arr.slice(i + 1).map((q, j) => (
          <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="var(--color-bhairav-primary)" strokeOpacity={0.18 + (i + j) * 0.05} strokeWidth="1.2" />
        ))
      ))}
      {[
        [100, 30, '#7C5BC9', 'P'], [40, 70, '#3E6E9E', 'V'], [160, 70, '#5B6650', 'L'],
        [60, 140, '#C0392B', 'C'], [140, 140, '#3A8FA3', 'E'], [100, 100, '#7C5BC9', 'P'],
      ].map(([x, y, c, t], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="11" fill={c} fillOpacity="0.15" />
          <circle cx={x} cy={y} r="7" fill={c} />
          <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">{t}</text>
        </g>
      ))}
    </svg>
  </div>
);

const MapVisual = (
  <div className="aspect-[4/3] relative overflow-hidden rounded-lg border border-[var(--color-bhairav-border)]">
    <div className="absolute inset-0 opacity-40" style={{
      backgroundImage: 'linear-gradient(var(--color-bhairav-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-bhairav-border) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }} />
    <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-[var(--color-bhairav-critical)] shadow-[0_0_0_6px_var(--color-bhairav-critical)]/20" />
    <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[var(--color-bhairav-warning)] shadow-[0_0_0_6px_var(--color-bhairav-warning)]/20" />
    <div className="absolute top-2/3 left-3/4 w-3 h-3 rounded-full bg-[var(--color-bhairav-primary)] shadow-[0_0_0_6px_var(--color-bhairav-primary)]/20" />
    <div className="absolute top-1/3 left-1/2 w-28 h-16 border-2 border-dashed border-[var(--color-bhairav-critical)]/40 rounded-lg" />
    <div className="absolute top-2 right-2 glass-sm px-2 py-1 text-[9px] font-mono">BHAIRAV MAP</div>
  </div>
);

const DocumentVisual = (
  <div className="space-y-3">
    <div className="aspect-video rounded-lg border-2 border-dashed border-[var(--color-bhairav-border)] flex items-center justify-center bg-[var(--color-bhairav-bg)]">
      <FileSearch size={32} className="text-[var(--color-bhairav-text-muted)]" />
    </div>
    <div className="space-y-1.5">
      {[
        { l: 'Readability', v: 100, c: 'verified' },
        { l: 'Consistency', v: 94, c: 'verified' },
        { l: 'Photo match', v: 86, c: 'warning' },
        { l: 'Integrity', v: 73, c: 'critical' },
      ].map((m) => (
        <div key={m.l}>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-[var(--color-bhairav-text-muted)] uppercase tracking-widest font-mono">{m.l}</span>
            <span className={cn('font-mono', `text-[var(--color-bhairav-${m.c})]`)}>{m.v}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-bhairav-surface-hover)] overflow-hidden">
            <div className={cn('h-full', `bg-[var(--color-bhairav-${m.c})]`)} style={{ width: `${m.v}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WelfareVisual = (
  <div className="space-y-3">
    {[
      { l: 'Workload', v: 'INCREASING', c: 'amber' },
      { l: 'Recovery', v: 'DECREASING', c: 'rose' },
      { l: 'Fatigue', v: 'MEDIUM', c: 'amber' },
    ].map((m) => (
      <div key={m.l} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bhairav-surface-hover)]">
        <span className="text-sm text-[var(--color-bhairav-text)]">{m.l}</span>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', `text-[var(--color-bhairav-${m.c})] border-[var(--color-bhairav-${m.c})]/30`)}>{m.v}</span>
      </div>
    ))}
  </div>
);

const AIAssistantVisual = (
  <div className="space-y-3">
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-primary)] flex items-center justify-center text-white shrink-0">
        <Sparkles size={14} />
      </div>
      <div className="flex-1 p-3 rounded-lg bg-[var(--color-bhairav-surface-hover)] text-sm text-[var(--color-bhairav-text)]">
        Show me the latest events near Sector X in the last 24 hours.
      </div>
    </div>
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-olive)]/20 flex items-center justify-center text-[var(--color-bhairav-olive)] shrink-0">
        <Shield size={14} />
      </div>
      <div className="flex-1 p-3 rounded-lg bg-[var(--color-bhairav-primary-soft)] text-sm text-[var(--color-bhairav-text)]">
        <p>3 events match in Sector X (last 24h):</p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-[var(--color-bhairav-text-muted)]">
          <li>• BH-104 — Restricted-zone entry (CRITICAL)</li>
          <li>• BH-103 — Vehicle checkpoint anomaly (WARNING)</li>
          <li>• BH-101 — Personnel ID mismatch (INFO)</li>
        </ul>
      </div>
    </div>
  </div>
);

const SLIDES: FeatureSlide[] = [
  {
    id: 'video',
    eyebrow: 'Engine 1 · Video Intelligence (IBVAP)',
    title: 'See the perimeter',
    subtitle: 'Live CCTV, ANPR, and fence analytics',
    description: 'Human and vehicle detection, multi-object tracking, virtual-fence intrusion, suspicious-activity and night-movement detection — all logged as structured events that you can query, not frames you have to scrub through.',
    icon: Camera,
    accent: 'cyan',
    visual: VideoIntelligenceVisual,
  },
  {
    id: 'network',
    eyebrow: 'Engine 2 · Criminal Network Analysis',
    title: 'Find the connectors',
    subtitle: 'NLP-extracted entities, centrality-ranked',
    description: 'From incident reports, FIRs, and analyst notes, BHAIRAV extracts people, phones, vehicles, orgs, and locations, then builds a graph. Centrality scores tell you who the influencers are. Anomaly scores tell you which edges deserve a second look.',
    icon: Network,
    accent: 'violet',
    visual: NetworkVisual,
  },
  {
    id: 'map',
    eyebrow: 'Geospatial',
    title: 'Pin it on the map',
    subtitle: 'Cameras, events, and zones, together',
    description: 'A single interactive map of every camera, every event, and every restricted zone. Click any pin to open the source feed or jump to the event detail. Overlay a fence and see exactly what crossed it.',
    icon: MapIcon,
    accent: 'olive',
    visual: MapVisual,
  },
  {
    id: 'doc',
    eyebrow: 'Document Verification',
    title: 'Catch the forgery',
    subtitle: 'Document + photo consistency',
    description: 'Upload a photo and a document. BHAIRAV runs readability, photo-match, and integrity checks, surfaces a verdict with reasons, and lets you drill into the flagged fields.',
    icon: FileSearch,
    accent: 'amber',
    visual: DocumentVisual,
  },
  {
    id: 'welfare',
    eyebrow: 'Personnel',
    title: 'Care for the team',
    subtitle: 'Readiness, fatigue, and welfare',
    description: 'Aggregated, anonymized check-in signals and active support requests. Spot a unit that needs help before fatigue becomes an incident.',
    icon: HeartPulse,
    accent: 'olive',
    visual: WelfareVisual,
  },
  {
    id: 'ai',
    eyebrow: 'BHAIRAV AI',
    title: 'Ask in plain English',
    subtitle: 'LLM grounded in your data',
    description: 'Type a question. BHAIRAV injects the relevant cameras, persons, vehicles, events, and cases as context, then answers. Optional SearXNG-backed web search for questions about the outside world.',
    icon: Sparkles,
    accent: 'blue',
    visual: AIAssistantVisual,
  },
];

// =========================================================
// MAIN
// =========================================================
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Track which slide is in view as the user scrolls
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll('[data-slide]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            const idx = Number((e.target as HTMLElement).dataset.slide);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        });
      },
      { root: track, threshold: [0.5, 0.7] },
    );
    slides.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToSlide = (i: number) => {
    const el = trackRef.current?.querySelectorAll('[data-slide]')[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 18% 12%, var(--color-bhairav-primary-soft), transparent 45%), radial-gradient(circle at 82% 80%, var(--color-bhairav-olive-soft), transparent 50%)',
        }} />
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-sm mb-6">
                <Shield size={14} className="text-[var(--color-bhairav-primary)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-bhairav-text)]">
                  Bhairav · Defence & Security Intelligence
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-[var(--color-bhairav-text)]">
                Two engines.<br />
                <span className="text-[var(--color-bhairav-primary)]">One mission.</span>
              </h1>
              <p className="mt-6 text-lg text-[var(--color-bhairav-text-muted)] max-w-2xl leading-relaxed">
                Bhairav fuses live video intelligence across the perimeter with
                graph-based criminal-network analysis on the people and events inside it.
                Built for defence, security, and intelligence operators who need answers,
                not dashboards.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link
                    to="/home"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] shadow-sm transition-colors"
                  >
                    Open the platform <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] shadow-sm transition-colors"
                    >
                      Sign in <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-[var(--color-bhairav-text)] border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary)] transition-colors"
                    >
                      Request access
                    </Link>
                  </>
                )}
                <Link
                  to="/ask-bhairav"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-[var(--color-bhairav-text)] hover:text-[var(--color-bhairav-primary)] transition-colors"
                >
                  <Sparkles size={16} /> Talk to BHAIRAV
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                {[
                  { v: '24/7', l: 'Ingest' },
                  { v: '2', l: 'Engines' },
                  { v: '1', l: 'Mission' },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-2xl font-extrabold font-mono text-[var(--color-bhairav-text)]">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-6 -z-10 rounded-3xl bg-[var(--color-bhairav-primary-soft)] opacity-50 blur-2xl" />
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-bhairav-text-muted)] font-mono">Live preview</p>
                    <span className="text-[10px] font-mono text-[var(--color-bhairav-verified)] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bhairav-verified)] animate-pulse" /> ALL SYSTEMS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--color-bhairav-border)] aspect-video flex items-center justify-center bg-[var(--color-bhairav-bg)] relative">
                      <Camera size={20} className="text-[var(--color-bhairav-text-muted)]" />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono text-[var(--color-bhairav-verified)] bg-[var(--color-bhairav-verified)]/10 px-1.5 py-0.5 rounded">● LIVE</span>
                    </div>
                    <div className="rounded-lg border border-[var(--color-bhairav-border)] aspect-video flex items-center justify-center bg-[var(--color-bhairav-bg)] relative">
                      <Eye size={20} className="text-[var(--color-bhairav-text-muted)]" />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono text-[var(--color-bhairav-verified)] bg-[var(--color-bhairav-verified)]/10 px-1.5 py-0.5 rounded">● LIVE</span>
                    </div>
                    <div className="col-span-2 p-3 rounded-lg border border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg)]">
                      <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono mb-2">Network</p>
                      <svg viewBox="0 0 200 60" className="w-full h-12">
                        {[[20,30,90,30],[90,30,160,30],[50,15,50,45],[150,15,150,45]].map(([x1,y1,x2,y2], i) => (
                          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-bhairav-primary)" strokeOpacity="0.3" strokeWidth="1" />
                        ))}
                        {[[20,30],[90,30],[160,30],[50,15],[150,15],[50,45],[150,45]].map(([x,y], i) => (
                          <circle key={i} cx={x} cy={y} r="5" fill="var(--color-bhairav-primary)" />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDING FEATURE STRIP — horizontal-snap on desktop, vertical stack on mobile */}
      <section className="border-t border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg-elevated)]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-16 pb-8">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-primary)] mb-2">What's inside</p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
                Every capability, one scroll away
              </h2>
            </div>
            <p className="text-sm text-[var(--color-bhairav-text-muted)] max-w-md">
              Swipe or scroll. Each card is a real, working module — not a mock.
            </p>
          </div>

          {/* Dots / pager */}
          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto scrollbar-themed pb-2">
            {SLIDES.map((s, i) => {
              const a = ACCENT[s.accent];
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSlide(i)}
                  className={cn(
                    'shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border',
                    active === i
                      ? `${a.soft} ${a.text} border-current/30`
                      : 'text-[var(--color-bhairav-text-muted)] border-[var(--color-bhairav-border)] hover:text-[var(--color-bhairav-text)]',
                  )}
                >
                  <s.icon size={12} />
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* The track: snap horizontally on lg+, stack on small */}
        <div
          ref={trackRef}
          className="overflow-x-auto lg:overflow-x-auto snap-x snap-mandatory flex gap-6 px-4 lg:px-8 pb-12 scrollbar-themed"
          style={{ scrollPadding: '0 2rem' }}
        >
          {SLIDES.map((s, i) => {
            const a = ACCENT[s.accent];
            return (
              <article
                key={s.id}
                data-slide={i}
                className={cn(
                  'snap-center shrink-0 w-[88vw] sm:w-[70vw] lg:w-[820px] max-w-full',
                  'glass-card p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center',
                )}
              >
                <div className="lg:col-span-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', a.bg, a.text)}>
                      <s.icon size={22} />
                    </div>
                    <p className={cn('text-[10px] uppercase tracking-[0.3em] font-bold', a.text)}>
                      {s.eyebrow}
                    </p>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
                    {s.title}
                  </h3>
                  <p className={cn('text-sm font-medium mt-1', a.text)}>{s.subtitle}</p>
                  <p className="mt-4 text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed">
                    {s.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(s.id === 'video' ? ['Human+vehicle detection', 'ANPR', 'Fence analytics', 'Night mode'] :
                      s.id === 'network' ? ['NLP extraction', 'Centrality ranking', 'Anomaly scoring', 'Graph traversal'] :
                      s.id === 'map' ? ['Live pins', 'Zone overlays', 'Click-to-open'] :
                      s.id === 'doc' ? ['Readability', 'Photo match', 'Integrity', 'LLM explain'] :
                      s.id === 'welfare' ? ['Trend signals', 'Support queue', 'Anonymized'] :
                      ['Injected context', 'Web search', 'Streaming']).map((t) => (
                      <span key={t} className={cn('px-2.5 py-1 rounded-full text-[10px] font-mono border', a.chip, 'border-current/20')}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <div className="glass-card p-5">
                    {s.visual}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* TWO-ENGINE EXPLAINER */}
      <section className="border-t border-[var(--color-bhairav-border)] py-20">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-primary)] mb-2">The two engines</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
              Independent. Complementary.
            </h2>
            <p className="mt-3 text-[var(--color-bhairav-text-muted)] max-w-2xl mx-auto">
              Each engine works on its own. Together, they let you trace a person from a
              camera ping to a network cluster and back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Video Intelligence (IBVAP)',
                desc: 'Sees what is happening at the perimeter right now — and turns it into events.',
                bullets: ['Human + vehicle detection with track IDs', 'ANPR (license plate recognition)', 'Virtual-fence intrusion', 'Suspicious-activity & night-movement'],
                icon: Camera,
                accent: 'cyan',
                to: '/security/monitoring',
              },
              {
                title: 'Criminal Network Analysis',
                desc: 'Sees the relationships between people, vehicles, places, and events.',
                bullets: ['NLP entity extraction', 'Graph construction + traversal', 'Centrality-based key-influencer ranking', 'Anomaly detection on inferred relationships'],
                icon: Network,
                accent: 'violet',
                to: '/network',
              },
            ].map((card) => {
              const a = ACCENT[card.accent];
              return (
                <div key={card.title} className="glass-card p-7">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', a.bg, a.text)}>
                    <card.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-bhairav-text)]">{card.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed">{card.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-bhairav-text)]">
                        <span className={cn('w-1.5 h-1.5 rounded-full mt-2 shrink-0', a.text.replace('text-', 'bg-'))} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={card.to}
                    className={cn('mt-6 inline-flex items-center gap-1.5 text-sm font-semibold', a.text, 'hover:underline')}
                  >
                    Open module <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECURITY & COMPLIANCE */}
      <section className="border-t border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg-elevated)] py-20">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-olive)] mb-2">Security & compliance</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
              Built for sensitive environments
            </h2>
            <p className="mt-4 text-[var(--color-bhairav-text-muted)] leading-relaxed">
              BHAIRAV is designed for defence, security, and intelligence operators.
              Every record carries source, confidence, and status. Every action is auditable.
              Every entity is scoped to an investigation.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Lock, label: 'Encrypted in transit' },
                { icon: ShieldCheck, label: 'Role-based access' },
                { icon: Database, label: 'Audit logs' },
                { icon: ScanLine, label: 'Provenance on every record' },
              ].map((it) => (
                <div key={it.label} className="glass-sm p-3 flex items-center gap-2.5">
                  <it.icon size={16} className="text-[var(--color-bhairav-olive)]" />
                  <span className="text-sm text-[var(--color-bhairav-text)]">{it.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-bhairav-text-muted)] font-mono mb-3">Provenance example</p>
            <div className="space-y-3 text-sm">
              {[
                { l: 'Subject Alpha ↔ Subject Beta', s: 'ASSOCIATED_WITH', src: 'ANALYST', conf: '0.62', st: 'INFERRED' },
                { l: 'Vehicle UP32AB1234 ↔ Subject Alpha', s: 'USES', src: 'CCTV', conf: '0.81', st: 'OBSERVED' },
                { l: 'Case BH-1024 ↔ Subject Alpha', s: 'MENTIONED_IN', src: 'ANALYST', conf: '1.00', st: 'CONFIRMED' },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--color-bhairav-surface-hover)]">
                  <p className="text-[var(--color-bhairav-text)] font-medium">{r.l}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="text-[var(--color-bhairav-text-muted)]">{r.s}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--color-bhairav-primary-soft)] text-[var(--color-bhairav-primary)]">{r.src}</span>
                    <span className="text-[var(--color-bhairav-text-muted)]">conf {r.conf}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--color-bhairav-olive-soft)] text-[var(--color-bhairav-olive)]">{r.st}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Shield className="mx-auto text-[var(--color-bhairav-primary)] mb-5" size={48} />
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
            Step into the operations view
          </h2>
          <p className="mt-3 text-[var(--color-bhairav-text-muted)]">
            Bhairav is for authorized personnel. Sign in or request access if you don't have an account yet.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/home"
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors"
              >
                Open the platform
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-[var(--color-bhairav-text)] border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary)] transition-colors"
                >
                  Request access
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
