import { Link } from 'react-router-dom';
import { Shield, Brain, FileSearch, Network, Map, Users, Bell } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export function Home() {
  const modules = [
    { name: 'Command Centre', icon: <Shield size={24} />, path: '/command-center', desc: 'Centralized view of security status', color: 'text-blue-400' },
    { name: 'Security Intelligence', icon: <Bell size={24} />, path: '/security/events', desc: 'Real-time threat monitoring', color: 'text-red-400' },
    { name: 'Document Verification', icon: <FileSearch size={24} />, path: '/verification', desc: 'Verify documents instantly', color: 'text-green-400' },
    { name: 'Network Intelligence', icon: <Network size={24} />, path: '/network', desc: 'Analyze personnel networks', color: 'text-purple-400' },
    { name: 'Maps & Analytics', icon: <Map size={24} />, path: '/security/map', desc: 'Geospatial intelligence', color: 'text-orange-400' },
    { name: 'Personnel Welfare', icon: <Users size={24} />, path: '/personnel', desc: 'Manage welfare and support', color: 'text-teal-400' },
    { name: 'AI Assistant', icon: <Brain size={24} />, path: '/ask-bhairav', desc: 'Interact with Bhairav AI', color: 'text-indigo-400' }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bhairav Overview</h1>
          <p className="text-[var(--color-bhairav-text-muted)]">Select a module to access its capabilities.</p>
        </div>
        <Badge variant="success" className="px-3 py-1">System Optimal</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <Link key={m.name} to={m.path} className="group block h-full">
            <Card className="h-full hover:border-[var(--color-bhairav-primary)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] group-hover:-translate-y-1">
              <div className="p-6 flex flex-col h-full gap-4">
                <div className={`p-3 rounded-lg bg-[var(--color-bhairav-surface)] w-fit ${m.color}`}>
                  {m.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[var(--color-bhairav-primary)] transition-colors">{m.name}</h3>
                  <p className="text-sm text-[var(--color-bhairav-text-muted)]">{m.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
