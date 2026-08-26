import { Link } from 'react-router-dom';
import { Shield, Target, Eye, Database, Cpu, Lock, ArrowRight, Map as MapIcon } from 'lucide-react';
import { Footer } from '../../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bhairav-bg)] flex flex-col text-[var(--color-bhairav-text)]">
      {/* Public Navbar */}
      <nav className="h-20 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 md:px-16">
        <div className="flex items-center gap-3">
          <Shield className="text-[var(--color-bhairav-primary)]" size={32} />
          <span className="text-2xl font-bold tracking-widest">BHAIRAV</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
            Secure Login
          </Link>
          <Link to="/onboarding" className="bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-md transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            Explore Platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-40 overflow-hidden flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bhairav-bg)] via-[var(--color-bhairav-surface)] to-[var(--color-bhairav-bg)] opacity-50"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-bhairav-primary)]/30 bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)] text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-[var(--color-bhairav-primary)] animate-pulse"></span>
              Active Deployment
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500">
              BHAIRAV
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--color-bhairav-text-muted)] font-light tracking-wide mb-12 max-w-2xl mx-auto">
              AI-Powered Defence & Security Intelligence
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white px-8 py-4 rounded-md font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                Secure Login <Lock size={18} />
              </Link>
              <Link to="/onboarding" className="w-full sm:w-auto bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-white px-8 py-4 rounded-md font-medium text-lg flex items-center justify-center gap-2 transition-colors">
                Explore Platform <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Intelligence Fusion Features */}
        <section className="py-24 px-8 md:px-16 bg-[var(--color-bhairav-surface)] border-y border-[var(--color-bhairav-border)]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Intelligence Fusion Architecture</h2>
              <p className="text-[var(--color-bhairav-text-muted)] max-w-2xl mx-auto">
                A unified security intelligence platform designed for advanced threat detection, geospatial analysis, and mission readiness.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Eye, title: "Security Intelligence", desc: "Real-time AI video analytics, perimeter monitoring, and anomaly detection." },
                { icon: Target, title: "Identity Verification", desc: "Multi-modal verification and credential analysis at critical checkpoints." },
                { icon: Database, title: "Network Intelligence", desc: "Relational mapping of security events, entities, and threat vectors." },
                { icon: MapIcon, title: "Maps & Analytics", desc: "Geospatial situational awareness with heatmaps and live tracking." },
                { icon: Cpu, title: "AI Assistant", desc: "Natural language intelligence querying and voice-command operations." },
                { icon: Shield, title: "Personnel Welfare", desc: "Operational readiness tracking and automated welfare follow-ups." },
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-xl bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]/50 transition-colors group">
                  <div className="w-12 h-12 bg-[var(--color-bhairav-primary)]/10 rounded-lg flex items-center justify-center text-[var(--color-bhairav-primary)] mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-[var(--color-bhairav-text-muted)] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
