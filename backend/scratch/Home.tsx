import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Command, 
  AlertTriangle, 
  FileCheck, 
  Network, 
  Map, 
  Users, 
  Mic,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { cn } from '../utils/cn';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
  notch: string;
}

export const Home: React.FC = () => {
  const features: FeatureCard[] = [
    {
      title: 'Command Centre',
      description: 'Unified operational dashboard with real-time alerts and security monitoring',
      icon: <Command size={32} />,
      path: '/command-center',
      color: 'text-[var(--color-bhairav-steel)]',
      bgColor: 'bg-[var(--color-bhairav-steel)]/10',
      notch: 'primary'
    },
    {
      title: 'Security Intelligence',
      description: 'Monitor events, incidents, and threat assessments across jurisdictions',
      icon: <AlertTriangle size={32} />,
      path: '/security/events',
      color: 'text-[var(--color-bhairav-ember)]',
      bgColor: 'bg-[var(--color-bhairav-ember)]/10',
      notch: 'critical'
    },
    {
      title: 'Document Verification',
      description: 'Identity verification and document analysis workspace',
      icon: <FileCheck size={32} />,
      path: '/verification',
      color: 'text-[var(--color-bhairav-verified)]',
      bgColor: 'bg-[var(--color-bhairav-verified)]/10',
      notch: 'verified'
    },
    {
      title: 'Network Intelligence',
      description: 'Understand relationships between authorized entities and networks',
      icon: <Network size={32} />,
      path: '/network',
      color: 'text-[var(--color-bhairav-primary)]',
      bgColor: 'bg-[var(--color-bhairav-primary)]/10',
      notch: 'primary'
    },
    {
      title: 'Maps & Analytics',
      description: 'Geospatial intelligence and operational analytics',
      icon: <Map size={32} />,
      path: '/security/map',
      color: 'text-[var(--color-bhairav-ochre)]',
      bgColor: 'bg-[var(--color-bhairav-ochre)]/10',
      notch: 'warning'
    },
    {
      title: 'Personnel Welfare',
      description: 'Welfare check-ins and personnel management systems',
      icon: <Users size={32} />,
      path: '/personnel',
      color: 'text-[var(--color-bhairav-verified)]',
      bgColor: 'bg-[var(--color-bhairav-verified)]/10',
      notch: 'verified'
    },
    {
      title: 'AI Assistant',
      description: 'Unified AI assistant for defence and security intelligence',
      icon: <Mic size={32} />,
      path: '/ask-bhairav',
      color: 'text-[var(--color-bhairav-primary)]',
      bgColor: 'bg-[var(--color-bhairav-primary)]/10',
      notch: 'primary'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Bhairav Command Suite</h1>
        <p className="text-lg text-[var(--color-bhairav-text-muted)]">Secure intelligence and operations platform</p>
      </div>

      {/* Featured Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Primary Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.slice(0, 2).map((feature, idx) => (
            <Link key={idx} to={feature.path}>
              <Card className={cn(`severity-notch-${feature.notch}`, "group h-full hover:border-[var(--color-bhairav-steel)]/50 transition-all duration-300 cursor-pointer hover:shadow-lg")}>
                <div className="flex items-start gap-6">
                  <div className={cn("p-4 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-300", feature.bgColor, feature.color)}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-bhairav-primary)] transition-colors">{feature.title}</h3>
                    <p className="text-[var(--color-bhairav-text-muted)] text-sm mb-4">{feature.description}</p>
                    <div className="flex items-center gap-2 text-[var(--color-bhairav-primary)] text-sm font-medium group-hover:gap-3 transition-all">
                      Explore <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Secondary Operations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Intelligence Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.slice(2).map((feature, idx) => (
            <Link key={idx} to={feature.path}>
              <Card className={cn(`severity-notch-${feature.notch}`, "group h-full hover:border-[var(--color-bhairav-steel)]/50 transition-all duration-300 cursor-pointer")}>
                <div className="space-y-4">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300", feature.bgColor, feature.color)}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 group-hover:text-[var(--color-bhairav-primary)] transition-colors">{feature.title}</h3>
                    <p className="text-[var(--color-bhairav-text-muted)] text-sm mb-4">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-bhairav-primary)] text-sm font-medium group-hover:gap-3 transition-all">
                    Access <ChevronRight size={16} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">System Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Alerts', value: '12', color: 'text-[var(--color-bhairav-ember)]' },
            { label: 'Security Events', value: '89', color: 'text-[var(--color-bhairav-ochre)]' },
            { label: 'Verified Entities', value: '234', color: 'text-[var(--color-bhairav-verified)]' },
            { label: 'System Status', value: 'Secure', color: 'text-[var(--color-bhairav-verified)]' }
          ].map((stat, idx) => (
            <Card key={idx} className="text-center py-6">
              <p className="text-[var(--color-bhairav-text-muted)] text-sm font-mono mb-2">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
