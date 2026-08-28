import { Cookie, Shield, Settings } from 'lucide-react';

export default function CookiePolicyPage() {
  const sections = [
    {
      title: 'Necessary Cookies',
      description: 'The application uses session and authentication cookies required for login state, security tokens, and core interface functionality. These cookies are essential for platform operation.',
      icon: Shield,
    },
    {
      title: 'Authentication and Session Cookies',
      description: 'Session-related storage is used to maintain authenticated access during active use. These tokens are required for protected routes and API authorization.',
      icon: Cookie,
    },
    {
      title: 'Preferences',
      description: 'The platform may store user interface preferences locally to improve usability. This does not include tracking or profiling cookies.',
      icon: Settings,
    },
    {
      title: 'Cookie Management',
      description: 'Users can manage or clear stored cookies through their browser settings. Disabling essential cookies may affect platform functionality.',
      icon: Shield,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-gray-400">How Bhairav uses cookies and similar technologies.</p>
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
    </div>
  );
}
