import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  ArrowRight,
  Eye,
  Target,
  Database,
  Map as MapIcon,
  Users,
  Network,
  Heart,
  Mic,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const FEATURES = [
  {
    id: '01',
    title: 'Security Intelligence',
    subtitle: 'AI-Powered Threat Detection',
    description:
      'Real-time video analytics, perimeter monitoring, and anomaly detection across all security feeds.',
    icon: Eye,
    color: '#ef4444',
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-critical)] animate-pulse" />
          <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">LIVE FEED — CAM-17</span>
        </div>
        <div className="h-24 bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-border)] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bhairav-critical)]/5 to-transparent" />
          <Eye size={32} className="text-[var(--color-bhairav-critical)]/60" />
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded text-[10px] font-mono bg-[var(--color-bhairav-critical)]/10 text-[var(--color-bhairav-critical)] border border-[var(--color-bhairav-critical)]/20">
            PERSON 98%
          </span>
          <span className="px-2 py-1 rounded text-[10px] font-mono bg-[var(--color-bhairav-warning)]/10 text-[var(--color-bhairav-warning)] border border-[var(--color-bhairav-warning)]/20">
            VEHICLE 87%
          </span>
        </div>
      </div>
    ),
  },
  {
    id: '02',
    title: 'Identity Verification',
    subtitle: 'Multi-Modal Credential Analysis',
    description:
      'Advanced document verification, facial recognition, and biometric matching at critical checkpoints.',
    icon: Target,
    color: '#3b82f6',
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-primary)] animate-pulse" />
          <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">VERIFICATION IN PROGRESS</span>
        </div>
        <div className="h-24 bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-border)] flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 flex items-center justify-center">
            <Users size={20} className="text-[var(--color-bhairav-primary)]" />
          </div>
          <div className="w-12 h-12 rounded-lg bg-[var(--color-bhairav-verified)]/10 border border-[var(--color-bhairav-verified)]/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-bhairav-verified)]">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <div className="h-2 bg-[var(--color-bhairav-bg)] rounded-full overflow-hidden border border-[var(--color-bhairav-border)]">
          <div className="h-full bg-[var(--color-bhairav-primary)] rounded-full w-4/5" />
        </div>
      </div>
    ),
  },
  {
    id: '03',
    title: 'Network Intelligence',
    subtitle: 'Entity Relationship Mapping',
    description:
      'Relational mapping of security events, persons, vehicles, locations, and threat vectors.',
    icon: Network,
    color: '#10b981',
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-verified)] animate-pulse" />
          <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">GRAPH ACTIVE — 24 NODES</span>
        </div>
        <div className="h-24 bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-border)] flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30" />
          <div className="absolute top-6 left-10 w-3 h-3 rounded-full bg-[var(--color-bhairav-critical)] border border-[var(--color-bhairav-border)]" />
          <div className="absolute top-10 right-12 w-3 h-3 rounded-full bg-[var(--color-bhairav-warning)] border border-[var(--color-bhairav-border)]" />
          <div className="absolute bottom-8 left-16 w-3 h-3 rounded-full bg-[var(--color-bhairav-verified)] border border-[var(--color-bhairav-border)]" />
          <div className="absolute bottom-6 right-10 w-3 h-3 rounded-full bg-[var(--color-bhairav-primary)] border border-[var(--color-bhairav-border)]" />
        </div>
      </div>
    ),
  },
  {
    id: '04',
    title: 'Maps & Analytics',
    subtitle: 'Geospatial Situational Awareness',
    description:
      'Live tracking, heatmaps, and geospatial analysis for comprehensive operational oversight.',
    icon: MapIcon,
    color: '#f59e0b',
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-warning)] animate-pulse" />
          <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">SECTOR X — 3 ACTIVE ZONES</span>
        </div>
        <div className="h-24 bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-border)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[var(--color-bhairav-warning)]/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[var(--color-bhairav-critical)]/40" />
          </div>
          <MapIcon size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-bhairav-warning)]/60" />
        </div>
      </div>
    ),
  },
  {
    id: '05',
    title: 'AI Assistant',
    subtitle: 'Natural Language Intelligence',
    description:
      'Voice-enabled assistant for natural language querying, report generation, and command operations.',
    icon: Mic,
    color: '#3b82f6',
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-primary)] animate-pulse" />
          <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">BHAIRAV AI — READY</span>
        </div>
        <div className="h-24 bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-border)] flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bhairav-surface)] rounded-full border border-[var(--color-bhairav-border)]">
            <Mic size={16} className="text-[var(--color-bhairav-primary)]" />
            <span className="text-xs text-[var(--color-bhairav-text-muted)]">Ask anything...</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: '06',
    title: 'Personnel Welfare',
    subtitle: 'Operational Readiness Tracking',
    description:
      'Automated welfare follow-ups, fatigue monitoring, and support request management for personnel.',
    icon: Heart,
    color: '#10b981',
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-verified)] animate-pulse" />
          <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">ALL UNITS — NOMINAL</span>
        </div>
        <div className="h-24 bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-border)] flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--color-bhairav-verified)]">94%</div>
            <div className="text-[10px] text-[var(--color-bhairav-text-muted)]">READINESS</div>
          </div>
          <div className="w-px h-8 bg-[var(--color-bhairav-border)]" />
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--color-bhairav-primary)]">12</div>
            <div className="text-[10px] text-[var(--color-bhairav-text-muted)]">CHECK-INS</div>
          </div>
        </div>
      </div>
    ),
  },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();

  return (
    <div
      ref={ref}
      className={cn('scroll-reveal', className)}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  // For the showcase, we show one feature at a time.

  return (
    <div className="min-h-screen bg-[#080B10] text-[var(--color-bhairav-text)] overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#080B10]/70 backdrop-blur-xl border-b border-[var(--color-bhairav-border)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="text-[var(--color-bhairav-primary)]" size={28} />
                {scrolled && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-bhairav-verified)] rounded-full animate-pulse" />}
              </div>
              <span className="text-xl font-bold tracking-widest">BHAIRAV</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('benefits')} className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                Benefits
              </button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#080B10]/95 backdrop-blur-xl border-b border-[var(--color-bhairav-border)]">
            <div className="px-6 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors py-2">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors py-2">
                How It Works
              </button>
              <button onClick={() => scrollToSection('benefits')} className="block w-full text-left text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors py-2">
                Benefits
              </button>
              <div className="pt-3 border-t border-[var(--color-bhairav-border)] flex flex-col gap-3">
                <Link to="/login" className="block text-center text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors py-2">
                  Login
                </Link>
                <Link to="/register" className="block text-center bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080B10] via-[#0B1018] to-[#080B10] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-bhairav-primary)]/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--color-bhairav-verified)]/8 rounded-full blur-[100px] animate-float-delayed" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-bhairav-primary)]/30 bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)] text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-[var(--color-bhairav-primary)] animate-pulse" />
              Active Intelligence Platform
            </div>
          </div>

          <h1 className="animate-fade-in-up text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.95]" style={{ animationDelay: '0.1s' }}>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Defence Intelligence
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-bhairav-primary)] to-[var(--color-bhairav-verified)] animate-gradient">
              Reimagined
            </span>
          </h1>

          <p className="animate-fade-in-up text-lg md:text-xl text-[var(--color-bhairav-text-muted)] font-light max-w-2xl mx-auto mb-12 leading-relaxed" style={{ animationDelay: '0.2s' }}>
            AI-powered security platform for next-generation threat detection, geospatial analysis, identity verification, and mission readiness.
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white px-8 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] hover:-translate-y-0.5"
            >
              <Lock size={18} /> Secure Login
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-[#10151D] hover:bg-[#10151D]/80 border border-[var(--color-bhairav-border)] text-white px-8 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all hover:border-[var(--color-bhairav-primary)]/50 hover:-translate-y-0.5"
            >
              Request Access <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ANIMATED FEATURE SHOWCASE */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Intelligence Fusion <span className="text-[var(--color-bhairav-primary)]">Architecture</span>
              </h2>
              <p className="text-[var(--color-bhairav-text-muted)] max-w-2xl mx-auto text-lg">
                A unified security intelligence platform designed for advanced threat detection and mission readiness.
              </p>
            </ScrollReveal>
          </div>

          {/* Single-row horizontal showcase */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080B10] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080B10] to-transparent z-10 pointer-events-none" />
            
            <div className="relative mx-auto max-w-5xl">
              <AnimatePresence mode="popLayout" custom={activeFeature}>
                {FEATURES.map((feature, idx) => {
                  const Icon = feature.icon;
                  if (idx !== activeFeature) return null;

                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ x: 600, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -600, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 300,
                        opacity: { duration: 0.25 },
                      }}
                      className="relative bg-[#0D1118] border border-[var(--color-bhairav-primary)]/50 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(59,130,246,0.08)]"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${feature.color}15`, borderColor: `${feature.color}30` }}>
                          <Icon size={24} style={{ color: feature.color }} />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[var(--color-bhairav-text-muted)] tracking-widest">FEATURE {feature.id}</div>
                          <div className="text-xl font-bold">{feature.title}</div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bhairav-primary)] animate-pulse" />
                          <span className="text-[10px] font-mono text-[var(--color-bhairav-primary)] tracking-widest">ACTIVE</span>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed mb-6 max-w-3xl">
                        {feature.description}
                      </p>

                      <div className="bg-[#080B10]/80 border border-[var(--color-bhairav-border)] rounded-xl p-5">
                        {feature.visual}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bhairav-surface)]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Complete Security <span className="text-[var(--color-bhairav-primary)]">Ecosystem</span>
              </h2>
              <p className="text-[var(--color-bhairav-text-muted)] max-w-2xl mx-auto">
                Every tool you need to detect, analyze, and respond to security threats in one unified platform.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.id} delay={idx * 0.1}>
                  <div className="h-full bg-[#0D1118]/80 backdrop-blur-xl border border-[#1a1f2e] rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-[var(--color-bhairav-primary)]/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: `${feature.color}15`,
                          borderColor: `${feature.color}30`,
                        }}
                      >
                        <Icon size={24} style={{ color: feature.color }} />
                      </div>
                      <span className="text-xs font-mono text-[var(--color-bhairav-text-muted)]">0{feature.id}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-[var(--color-bhairav-primary)] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                How It <span className="text-[var(--color-bhairav-primary)]">Works</span>
              </h2>
              <p className="text-[var(--color-bhairav-text-muted)] max-w-2xl mx-auto text-lg">
                From deployment to decision-making in four streamlined phases.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Deploy',
                desc: 'Install cameras, sensors, and verification nodes across operational zones.',
                icon: MapIcon,
              },
              {
                step: '02',
                title: 'Detect',
                desc: 'AI models analyze feeds in real-time, flagging anomalies and threats instantly.',
                icon: Eye,
              },
              {
                step: '03',
                title: 'Analyze',
                desc: 'Network intelligence maps relationships. Verification confirms identities.',
                icon: Network,
              },
              {
                step: '04',
                title: 'Act',
                desc: 'Operators receive actionable intelligence. Welfare and support systems stay aligned.',
                icon: Shield,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.step} delay={idx * 0.15}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon size={28} className="text-[var(--color-bhairav-primary)]" />
                    </div>
                    <div className="text-xs font-mono text-[var(--color-bhairav-primary)] tracking-widest mb-2">STEP {item.step}</div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-8 -right-4 w-8 text-[var(--color-bhairav-border)]">
                      <ChevronRight size={20} />
                    </div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section id="benefits" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bhairav-surface)]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Why <span className="text-[var(--color-bhairav-primary)]">Bhairav</span>
              </h2>
              <p className="text-[var(--color-bhairav-text-muted)] max-w-2xl mx-auto text-lg">
                Built for the operators who need it most.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Real-Time Situational Awareness',
                desc: 'Live feeds, geospatial tracking, and instant alerts keep operators informed across every operational layer.',
                icon: Eye,
              },
              {
                title: 'Multi-Source Intelligence Fusion',
                desc: 'Correlate events, identities, networks, and maps into a single coherent operational picture.',
                icon: Database,
              },
              {
                title: 'Automated Threat Detection',
                desc: 'AI-powered video analytics and anomaly detection reduce manual monitoring burden significantly.',
                icon: Shield,
              },
              {
                title: 'Secure & Compliant',
                desc: 'Enterprise-grade authentication, encrypted communications, and audit-ready logging built in.',
                icon: Lock,
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <ScrollReveal key={benefit.title} delay={idx * 0.1}>
                  <div className="h-full bg-[#0D1118]/80 backdrop-blur-xl border border-[#1a1f2e] rounded-2xl p-8 transition-all duration-300 hover:border-[var(--color-bhairav-primary)]/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Icon size={24} className="text-[var(--color-bhairav-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--color-bhairav-primary)] transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bhairav-primary)]/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-bhairav-primary)]/10 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-bhairav-primary)]/30 bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)] text-xs font-semibold tracking-widest uppercase mb-8">
              <Shield size={12} />
              Get Started
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Ready to Secure Your <span className="text-[var(--color-bhairav-primary)]">Operations</span>?
            </h2>
            <p className="text-lg text-[var(--color-bhairav-text-muted)] max-w-xl mx-auto mb-10">
              Join the next generation of defence and security intelligence. Request access or sign in to the platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white px-8 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] hover:-translate-y-0.5"
              >
                <Lock size={18} /> Login
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-[#10151D] hover:bg-[#10151D]/80 border border-[var(--color-bhairav-border)] text-white px-8 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all hover:border-[var(--color-bhairav-primary)]/50 hover:-translate-y-0.5"
              >
                Create Account <ArrowRight size={18} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
