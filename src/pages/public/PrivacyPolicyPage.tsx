import { Shield, Eye, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    { id: 'information', title: '1. Information We Collect', content: 'The platform collects information necessary for account creation, authentication, and operational use. This includes name, email, role data, and platform activity records.' },
    { id: 'use', title: '2. How We Use Information', content: 'Collected information is used to provide platform access, maintain security, support operational workflows, and improve service reliability.' },
    { id: 'auth', title: '3. Authentication and Account Information', content: 'Authentication is handled through secure credential verification. Account information is stored in the platform database and is accessible only through authenticated and authorized access.' },
    { id: 'storage', title: '4. Data Storage', content: 'Data is stored using the platform configured persistence mechanisms. Storage is governed by operational requirements and backend configuration.' },
    { id: 'security', title: '5. Data Security', content: 'The platform applies application-level security controls, including access restrictions and audit logging, to protect stored data against unauthorized access.' },
    { id: 'retention', title: '6. Data Retention', content: 'Data is retained for as long as required for operational, legal, and security purposes. Specific retention periods are defined by platform configuration and policy.' },
    { id: 'cookies', title: '7. Cookies and Similar Technologies', content: 'The application may use session and preference cookies required for authentication and interface behavior. Analytics or tracking cookies are not used unless explicitly enabled.' },
    { id: 'third-party', title: '8. Third-Party Services', content: 'The platform may integrate with third-party services required for AI, mapping, or communication features. Each integration is governed by its own terms and data-handling practices.' },
    { id: 'rights', title: '9. User Rights', content: 'Users may request account-related information or updates through the platform contact channels. Requests are subject to verification and operational constraints.' },
    { id: 'updates', title: '10. Policy Updates', content: 'This policy may be updated as the platform evolves. Significant changes will be communicated through platform announcements or updated documentation.' },
    { id: 'contact', title: '11. Contact Information', content: 'For privacy-related enquiries, use the Contact page. All enquiries are handled through the available contact channels.' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-16 px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400">How Bhairav handles user and operational data.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 flex items-center justify-center">
                {section.id === 'security' || section.id === 'auth' ? (
                  <Lock size={16} className="text-[var(--color-bhairav-primary)]" />
                ) : section.id === 'cookies' ? (
                  <Eye size={16} className="text-[var(--color-bhairav-primary)]" />
                ) : (
                  <Shield size={16} className="text-[var(--color-bhairav-primary)]" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
