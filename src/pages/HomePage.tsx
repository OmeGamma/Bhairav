import { Shield, Map, Eye, Search, HeartPulse, BrainCircuit, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { cn } from '../utils/cn';

export default function HomePage() {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'Officer';

  const features = [
    {
      title: 'Command Centre',
      description: 'National security intelligence overview and active alerts.',
      icon: Activity,
      path: '/command-center',
      color: 'text-[var(--color-bhairav-primary)]',
      bg: 'bg-[var(--color-bhairav-primary)]/10',
      border: 'hover:border-[var(--color-bhairav-primary)]/50',
    },
    {
      title: 'Security Intelligence',
      description: 'Monitor real-time security events and intelligence feeds.',
      icon: Shield,
      path: '/intelligence/events',
      color: 'text-[var(--color-bhairav-ochre)]',
      bg: 'bg-[var(--color-bhairav-ochre)]/10',
      border: 'hover:border-[var(--color-bhairav-ochre)]/50',
    },
    {
      title: 'Maps & Analytics',
      description: 'Geospatial intelligence map with live asset tracking.',
      icon: Map,
      path: '/security/map',
      color: 'text-[var(--color-bhairav-steel)]',
      bg: 'bg-[var(--color-bhairav-steel)]/10',
      border: 'hover:border-[var(--color-bhairav-steel)]/50',
    },
    {
      title: 'Document Verification',
      description: 'AI-powered forgery detection and document analysis.',
      icon: Eye,
      path: '/verification',
      color: 'text-[var(--color-bhairav-primary)]',
      bg: 'bg-[var(--color-bhairav-primary)]/10',
      border: 'hover:border-[var(--color-bhairav-primary)]/50',
    },
    {
      title: 'Network Intelligence',
      description: 'Analyze threat networks and entity relationships.',
      icon: Search,
      path: '/network',
      color: 'text-[var(--color-bhairav-verified)]',
      bg: 'bg-[var(--color-bhairav-verified)]/10',
      border: 'hover:border-[var(--color-bhairav-verified)]/50',
    },
    {
      title: 'Personnel Welfare',
      description: 'Track team readiness and perform welfare check-ins.',
      icon: HeartPulse,
      path: '/personnel',
      color: 'text-[var(--color-bhairav-ember)]',
      bg: 'bg-[var(--color-bhairav-ember)]/10',
      border: 'hover:border-[var(--color-bhairav-ember)]/50',
    },
    {
      title: 'AI Assistant',
      description: 'Context-aware intelligence querying via natural language.',
      icon: BrainCircuit,
      path: '/ask-bhairav',
      color: 'text-[#a855f7]',
      bg: 'bg-[#a855f7]/10',
      border: 'hover:border-[#a855f7]/50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Welcome, {userName}</h1>
        <p className="text-[var(--color-bhairav-text-muted)] text-lg max-w-2xl mx-auto">
          Select a module below to begin operations. Bhairav Secure Intelligence Portal is active and monitoring.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <Link key={idx} to={feature.path} className="block group h-full">
            <Card className={cn(
              "h-full transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
              feature.border
            )}>
              <div className="p-2">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5", feature.bg, feature.color)}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-bhairav-text)] mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
