import { Shield, Database, Clock, User } from 'lucide-react';

export default function DataProtectionPage() {
  const sections = [
    {
      title: 'Data Handling',
      description: 'Platform data is processed through the configured backend services in support of authentication, intelligence workflows, and operational functions.',
      icon: Database,
    },
    {
      title: 'Access Control',
      description: 'Access to data is governed by application-level permissions. Only authorized roles can access specific platform modules and datasets.',
      icon: Shield,
    },
    {
      title: 'Data Minimization',
      description: 'The platform collects and retains data necessary for operational functionality, including authentication records, event data, and user-generated content.',
      icon: User,
    },
    {
      title: 'Retention and Responsibility',
      description: 'Data retention is managed through backend configuration. Users are responsible for safeguarding their credentials and access tokens.',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Data Protection</h1>
        <p className="text-gray-400">How the Bhairav platform handles data responsibly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-[#121316] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 flex items-center justify-center">
                  <Icon size={20} className="text-[var(--color-bhairav-primary)]" />
                </div>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{section.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-semibold text-white mb-4">Storage</h2>
        <p className="text-gray-300 leading-relaxed">
          Data is stored using the platform's configured persistence layer. Security controls are applied at the application and infrastructure levels to restrict unauthorized access.
        </p>
      </div>
    </div>
  );
}
