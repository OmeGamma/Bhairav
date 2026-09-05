import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Network, Camera, Map, AlertTriangle, Eye, HeartPulse, FileSearch,
  ArrowRight, Shield, Sparkles, Layers, ChevronRight, Database, Cpu, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { statsService } from '../services/statsService';
import { useState } from 'react';
import { cn } from '../utils/cn';
import { DemoBanner } from '../components/common/DemoBanner';

interface FeatureSection {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: 'blue' | 'olive' | 'amber' | 'rose' | 'violet' | 'cyan';
  to: string;
  bullets: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }[];
  preview: 'kpis' | 'graph' | 'camera' | 'map' | 'alerts' | 'document' | 'welfare';
  reverse?: boolean;
}

const ACCENT: Record<string, { bg: string; text: string; border: string; ring: string; soft: string }> = {
  blue:   { bg: 'bg-[var(--color-bhairav-primary)]/10',   text: 'text-[var(--color-bhairav-primary)]',   border: 'border-[var(--color-bhairav-primary)]/30', ring: 'ring-[var(--color-bhairav-primary)]/20',  soft: 'bg-[var(--color-bhairav-primary-soft)]' },
  olive:  { bg: 'bg-[var(--color-bhairav-olive)]/10',     text: 'text-[var(--color-bhairav-olive)]',      border: 'border-[var(--color-bhairav-olive)]/30',   ring: 'ring-[var(--color-bhairav-olive)]/20',    soft: 'bg-[var(--color-bhairav-olive-soft)]' },
  amber:  { bg: 'bg-[var(--color-bhairav-warning)]/10',   text: 'text-[var(--color-bhairav-warning)]',    border: 'border-[var(--color-bhairav-warning)]/30', ring: 'ring-[var(--color-bhairav-warning)]/20',  soft: 'bg-[var(--color-bhairav-warning)]/10' },
  rose:   { bg: 'bg-[var(--color-bhairav-critical)]/10',  text: 'text-[var(--color-bhairav-critical)]',   border: 'border-[var(--color-bhairav-critical)]/30',ring: 'ring-[var(--color-bhairav-critical)]/20', soft: 'bg-[var(--color-bhairav-critical)]/10' },
  violet: { bg: 'bg-[#7C5BC9]/10',                          text: 'text-[#7C5BC9]',                          border: 'border-[#7C5BC9]/30',                       ring: 'ring-[#7C5BC9]/20',                       soft: 'bg-[#7C5BC9]/10' },
  cyan:   { bg: 'bg-[#3A8FA3]/10',                          text: 'text-[#3A8FA3]',                          border: 'border-[#3A8FA3]/30',                       ring: 'ring-[#3A8FA3]/20',                       soft: 'bg-[#3A8FA3]/10' },
};

const FEATURES: FeatureSection[] = [
  {
    id: 'command',
    eyebrow: 'Operations',
    title: 'Command Center — Situational awareness at a glance',
    description: 'A unified operations dashboard for live KPIs, active alerts, trend analytics, and the latest events across all your domains.',
    icon: Activity,
    accent: 'blue',
    to: '/command-center',
    bullets: [
      { icon: Zap, text: 'Real-time KPIs (alerts, cameras, persons, investigations)' },
      { icon: Layers, text: '12-hour event and alert trend charts' },
      { icon: Database, text: 'Direct drilldown into the underlying events' },
    ],
    preview: 'kpis',
  },
  {
    id: 'ibvap',
    eyebrow: 'Video Intelligence (IBVAP)',
    title: 'Border & CCTV analytics that actually see',
    description: 'Human detection and tracking, vehicle classification, ANPR, virtual-fence intrusion, suspicious-activity and night-movement detection — all logged as structured events you can query.',
    icon: Camera,
    accent: 'cyan',
    to: '/security/monitoring',
    reverse: true,
    bullets: [
      { icon: Eye, text: 'Human + vehicle detection with track IDs' },
      { icon: Shield, text: 'Virtual-fence intrusion & restricted-zone alerts' },
      { icon: Sparkles, text: 'Suspicious-activity and night-movement heuristics' },
    ],
    preview: 'camera',
  },
  {
    id: 'map',
    eyebrow: 'Geospatial',
    title: 'See it on the map',
    description: 'Cameras, events, zones, and case locations on a single interactive map. Click any pin to inspect the source feed or jump to its event detail.',
    icon: Map,
    accent: 'olive',
    to: '/security/map',
    bullets: [
      { icon: Map, text: 'Leaflet-based map with live event pins' },
      { icon: Shield, text: 'Restricted zones and fence overlays' },
      { icon: Camera, text: 'Click to open the camera or event detail' },
    ],
    preview: 'map',
  },
  {
    id: 'network',
    eyebrow: 'Criminal Network Analysis',
    title: 'Find the connectors, not just the connections',
    description: 'Interactive graph of people, vehicles, locations, cases, and communications. NLP-extracted entities, centrality-based influencer ranking, and anomaly detection on the relationships themselves.',
    icon: Network,
    accent: 'violet',
    to: '/network',
    reverse: true,
    bullets: [
      { icon: Cpu, text: 'NLP entity extraction (people, phones, plates, orgs, places)' },
      { icon: Network, text: 'Centrality-ranked key influencers' },
      { icon: AlertTriangle, text: 'Anomaly scoring on inferred relationships' },
    ],
    preview: 'graph',
  },
  {
    id: 'attention',
    eyebrow: 'Triage',
    title: 'Attention Center — what needs you, right now',
    description: 'High-priority alerts, overdue tasks, and items awaiting acknowledgement, all in one queue with severity badges and source provenance.',
    icon: AlertTriangle,
    accent: 'rose',
    to: '/attention',
    bullets: [
      { icon: AlertTriangle, text: 'Critical alerts with one-click acknowledgement' },
      { icon: FileSearch, text: 'Overdue task counter and recent activity timeline' },
      { icon: Shield, text: 'Provenance (source, confidence, status) preserved' },
    ],
    preview: 'alerts',
  },
  {
    id: 'document',
    eyebrow: 'Document Verification',
    title: 'Catch the forgery before it crosses the line',
    description: 'Upload a photo and a document. BHAIRAV runs readability, consistency, photo-match, and integrity checks, then shows the result with reasons that you can drill into.',
    icon: FileSearch,
    accent: 'amber',
    to: '/verification',
    reverse: true,
    bullets: [
      { icon: FileSearch, text: 'Document readability and integrity scoring' },
      { icon: Eye, text: 'Photo vs document consistency check' },
      { icon: Sparkles, text: 'LLM-assisted explanation of flagged fields' },
    ],
    preview: 'document',
  },
  {
    id: 'welfare',
    eyebrow: 'Personnel',
    title: 'Readiness, fatigue, and welfare — in one view',
    description: 'Aggregated check-in signals, recovery trend, and active support requests so you can spot a unit that needs help before it becomes an incident.',
    icon: HeartPulse,
    accent: 'olive',
    to: '/personnel',
    bullets: [
      { icon: HeartPulse, text: 'Workload and recovery trend indicators' },
      { icon: Sparkles, text: 'Active support requests queue' },
      { icon: Shield, text: 'Anonymized check-in signals with provenance' },
    ],
    preview: 'welfare',
  },
  {
    id: 'ai',
    eyebrow: 'BHAIRAV AI',
    title: 'Ask in plain English — get answers from your data',
    description: 'Natural-language queries against cameras, persons, vehicles, events, and cases. The assistant can also pull live public intelligence when the question calls for it.',
    icon: Sparkles,
    accent: 'blue',
    to: '/ask-bhairav',
    reverse: true,
    bullets: [
      { icon: Sparkles, text: 'LLM-backed chat grounded in BHAIRAV data' },
      { icon: Database, text: 'Inject cameras, persons, vehicles, events, cases' },
      { icon: Globe, text: 'Optional SearXNG-backed web search' },
    ],
    preview: 'kpis',
  },
];

function Preview({ kind }: { kind: FeatureSection['preview'] }) {
  if (kind === 'kpis') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: 'Active Alerts', v: '07', c: 'rose' },
          { l: 'Cameras Online', v: '23/24', c: 'amber' },
          { l: 'Persons Tracked', v: '142', c: 'cyan' },
          { l: 'Investigations', v: '12', c: 'olive' },
        ].map((k) => (
          <div key={k.l} className="glass-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">{k.l}</p>
            <p className="text-3xl font-bold font-mono mt-1 text-[var(--color-bhairav-text)]">{k.v}</p>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'graph') {
    const nodes = [
      { x: 50, y: 30, t: 'P' },
      { x: 80, y: 50, t: 'V' },
      { x: 30, y: 60, t: 'L' },
      { x: 65, y: 75, t: 'C' },
      { x: 20, y: 30, t: 'P' },
      { x: 90, y: 25, t: 'O' },
    ];
    const edges = [[0,1],[0,2],[1,3],[2,3],[0,4],[1,5],[4,2]];
    return (
      <div className="glass-card p-6 aspect-square">
        <svg viewBox="0 0 110 100" className="w-full h-full">
          {edges.map(([a,b], i) => (
            <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--color-bhairav-primary)" strokeOpacity="0.35" strokeWidth="1.5"/>
          ))}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r="6" fill="var(--color-bhairav-primary)" />
              <text x={n.x} y={n.y+2} textAnchor="middle" fontSize="6" fill="white" fontWeight="700">{n.t}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }
  if (kind === 'camera') {
    return (
      <div className="glass-card p-4 grid grid-cols-2 gap-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="aspect-video rounded-lg bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] flex items-center justify-center relative overflow-hidden">
            <Camera size={22} className="text-[var(--color-bhairav-text-muted)]" />
            <span className="absolute top-1.5 left-1.5 text-[9px] font-mono text-[var(--color-bhairav-verified)] bg-[var(--color-bhairav-verified)]/10 px-1.5 py-0.5 rounded">● LIVE</span>
            <span className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-[var(--color-bhairav-text-muted)]">CAM-0{i}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'map') {
    return (
      <div className="glass-card p-2 aspect-[4/3] relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'linear-gradient(var(--color-bhairav-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-bhairav-border) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-[var(--color-bhairav-critical)] shadow-[0_0_0_6px_var(--color-bhairav-critical)]/20" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[var(--color-bhairav-warning)] shadow-[0_0_0_6px_var(--color-bhairav-warning)]/20" />
        <div className="absolute top-2/3 left-3/4 w-3 h-3 rounded-full bg-[var(--color-bhairav-primary)] shadow-[0_0_0_6px_var(--color-bhairav-primary)]/20" />
        <div className="absolute top-1/2 left-1/3 w-24 h-16 border-2 border-dashed border-[var(--color-bhairav-critical)]/40 rounded-lg" />
        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-[var(--color-bhairav-text-muted)]">BHAIRAV MAP</span>
      </div>
    );
  }
  if (kind === 'alerts') {
    return (
      <div className="glass-card p-4 space-y-2">
        {[
          { s: 'CRITICAL', t: 'Perimeter breach — Sector X', c: 'rose' },
          { s: 'WARNING',  t: 'Vehicle at restricted zone',  c: 'amber' },
          { s: 'INFO',     t: 'New entity relationship',     c: 'blue' },
        ].map((a, i) => (
          <div key={i} className={cn('flex items-center gap-3 p-3 rounded-lg border', `border-[var(--color-bhairav-${a.c === 'rose' ? 'critical' : a.c === 'amber' ? 'warning' : 'primary'})]/30 bg-[var(--color-bhairav-${a.c === 'rose' ? 'critical' : a.c === 'amber' ? 'warning' : 'primary'})]/5`)}>
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', `text-[var(--color-bhairav-${a.c === 'rose' ? 'critical' : a.c === 'amber' ? 'warning' : 'primary'})]`)}>{a.s}</span>
            <p className="text-sm text-[var(--color-bhairav-text)]">{a.t}</p>
            <ChevronRight size={14} className="ml-auto text-[var(--color-bhairav-text-muted)]" />
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'document') {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="aspect-video rounded-lg border-2 border-dashed border-[var(--color-bhairav-border)] flex items-center justify-center">
          <FileSearch size={32} className="text-[var(--color-bhairav-text-muted)]" />
        </div>
        <div className="space-y-1.5">
          {[
            { l: 'Document readability', v: 100, c: 'verified' },
            { l: 'Information consistency', v: 94, c: 'verified' },
            { l: 'Photo consistency', v: 86, c: 'warning' },
            { l: 'Document integrity', v: 73, c: 'critical' },
          ].map((m) => (
            <div key={m.l}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-bhairav-text-muted)]">{m.l}</span>
                <span className="font-mono text-[var(--color-bhairav-text)]">{m.v}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-bhairav-surface-hover)] overflow-hidden">
                <div className={cn('h-full', `bg-[var(--color-bhairav-${m.c})]`)} style={{ width: `${m.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === 'welfare') {
    return (
      <div className="glass-card p-4 space-y-3">
        {[
          { l: 'Workload trend', v: 'INCREASING', c: 'amber' },
          { l: 'Recovery trend', v: 'DECREASING', c: 'rose' },
          { l: 'Aggregated fatigue', v: 'MEDIUM', c: 'amber' },
        ].map((m) => (
          <div key={m.l} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bhairav-surface-hover)]">
            <span className="text-sm text-[var(--color-bhairav-text)]">{m.l}</span>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', `text-[var(--color-bhairav-${m.c})] border-[var(--color-bhairav-${m.c})]/30`)}>{m.v}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    ref.current.querySelectorAll('.scroll-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Globe({ size }: { size?: number }) {
  return (
    <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

export default function PostLoginHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Officer';
  const containerRef = useReveal();

  const [stats, setStats] = useState<any>({
    active_alerts: 0, cameras_online: 0, cameras_total: 0, persons_count: 0,
    cases_active: 0, events_today: 0,
  });
  useEffect(() => {
    (async () => {
      try {
        const s = await statsService.getDashboardStats();
        setStats(s);
      } catch {}
    })();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <DemoBanner />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 10%, var(--color-bhairav-primary-soft), transparent 40%), radial-gradient(circle at 80% 80%, var(--color-bhairav-olive-soft), transparent 50%)',
        }} />
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 scroll-reveal">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-primary)] mb-4">
                BHAIRAV · Defence & Security Intelligence
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-[var(--color-bhairav-text)]">
                Welcome back, <span className="text-[var(--color-bhairav-primary)]">{firstName}</span>.
              </h1>
              <p className="mt-6 text-lg text-[var(--color-bhairav-text-muted)] max-w-2xl leading-relaxed">
                Two engines, one mission. Live video intelligence across the perimeter, and graph-based
                criminal-network analysis on the people and events inside it. Scroll to see what
                BHAIRAV can do today.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/command-center"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] shadow-sm transition-colors"
                >
                  Open Command Center <ArrowRight size={16} />
                </Link>
                <Link
                  to="/ask-bhairav"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-[var(--color-bhairav-text)] border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary)] transition-colors"
                >
                  <Sparkles size={16} /> Ask BHAIRAV
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 scroll-reveal">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Active Alerts', v: stats.active_alerts, c: 'rose', icon: AlertTriangle },
                  { l: 'Cameras Online', v: `${stats.cameras_online}/${stats.cameras_total}`, c: 'amber', icon: Camera },
                  { l: 'Persons Tracked', v: stats.persons_count, c: 'cyan', icon: Eye },
                  { l: 'Investigations', v: stats.cases_active, c: 'olive', icon: FileSearch },
                ].map((kpi) => {
                  const a = ACCENT[kpi.c];
                  return (
                    <div key={kpi.l} className="glass-card p-5">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', a.bg, a.text)}>
                        <kpi.icon size={20} />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
                        {kpi.l}
                      </p>
                      <p className="text-3xl font-bold font-mono mt-1 text-[var(--color-bhairav-text)]">
                        {kpi.v}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTIONS — one per capability, vertically scrollable */}
      {FEATURES.map((f) => {
        const a = ACCENT[f.accent];
        return (
          <section
            key={f.id}
            className={cn(
              'border-t border-[var(--color-bhairav-border)] py-16 lg:py-24',
              f.reverse ? 'bg-[var(--color-bhairav-bg-elevated)]' : '',
            )}
          >
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
              <div className={cn(
                'grid grid-cols-1 lg:grid-cols-12 gap-10 items-center',
                f.reverse && 'lg:[&>*:first-child]:order-2',
              )}>
                <div className="lg:col-span-6 scroll-reveal">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', a.bg, a.text)}>
                      <f.icon size={22} />
                    </div>
                    <p className={cn('text-[10px] uppercase tracking-[0.3em] font-bold', a.text)}>
                      {f.eyebrow}
                    </p>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
                    {f.title}
                  </h2>
                  <p className="mt-4 text-base text-[var(--color-bhairav-text-muted)] leading-relaxed">
                    {f.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {f.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={cn('shrink-0 w-7 h-7 rounded-md flex items-center justify-center', a.bg, a.text)}>
                          <b.icon size={14} />
                        </div>
                        <span className="text-sm text-[var(--color-bhairav-text)] leading-relaxed pt-0.5">
                          {b.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={f.to}
                    className={cn(
                      'mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      'bg-[var(--color-bhairav-primary)] text-white hover:bg-[var(--color-bhairav-primary-hover)]',
                    )}
                  >
                    Open {f.title.split(' — ')[0]} <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="lg:col-span-6 scroll-reveal">
                  <Preview kind={f.preview} />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="border-t border-[var(--color-bhairav-border)] py-20">
        <div className="max-w-3xl mx-auto px-4 text-center scroll-reveal">
          <Shield className="mx-auto text-[var(--color-bhairav-primary)] mb-4" size={40} />
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
            Ready when you are
          </h2>
          <p className="mt-3 text-[var(--color-bhairav-text-muted)]">
            Jump straight into the operations dashboard or talk to BHAIRAV.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/command-center"
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors"
            >
              Open Command Center
            </Link>
            <Link
              to="/ask-bhairav"
              className="px-6 py-3 rounded-lg text-sm font-semibold text-[var(--color-bhairav-text)] border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary)] transition-colors inline-flex items-center gap-2"
            >
              <Sparkles size={16} /> Ask BHAIRAV
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
