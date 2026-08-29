import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function SecurityPage() {
  const sections = [
    {
      title: 'Secure Authentication',
      description: 'Access to the platform is protected by authentication mechanisms. Sessions are established through verified credentials and token-based access controls.',
      icon: Lock,
    },
    {
      title: 'Access Control',
      description: 'Role-based access controls restrict platform functionality according to assigned permissions. Administrative and operational roles are managed through the backend authorization system.',
      icon: Shield,
    },
    {
      title: 'Data Protection',
      description: 'User data and platform data are handled through configured backend storage with access limited by application-level controls.',
      icon: Eye,
    },
    {
      title: 'Audit Logging',
      description: 'Platform activities are recorded through audit mechanisms to support operational review and incident traceability.',
      icon: FileText,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security</h1>
        <p className="text-gray-400">Overview of security mechanisms implemented in the Bhairav platform.</p>
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
        <h2 className="text-xl font-semibold text-white mb-4">Secure Communication</h2>
        <p className="text-gray-300 leading-relaxed">
          The platform operates over standard web protocols. Backend API communications are mediated through configured server-side security practices. Users are advised to verify URLs and avoid sharing access credentials.
        </p>
      </div>
    </div>
  );
}
