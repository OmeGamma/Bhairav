import { FileText, Shield, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', content: 'By accessing or using the Bhairav platform, you agree to be bound by these terms. If you do not agree, please do not use the platform.' },
    { id: 'use', title: '2. Authorized Use', content: 'The platform is intended for authorized personnel involved in security and intelligence operations. Use must comply with applicable laws, regulations, and organizational policies.' },
    { id: 'accounts', title: '3. User Accounts', content: 'Accounts are issued to verified users. Each user is responsible for maintaining the confidentiality of access credentials and for all activities under their account.' },
    { id: 'responsibilities', title: '4. Account Responsibilities', content: 'Users must report unauthorized access, suspicious activity, or security incidents through the appropriate channels immediately.' },
    { id: 'acceptable', title: '5. Acceptable Use', content: 'The platform must not be used for unauthorized surveillance, data exfiltration, or any purpose outside its intended operational scope.' },
    { id: 'security', title: '6. Security Responsibilities', content: 'Users must follow security guidelines, use strong credentials, and avoid sharing access tokens or session identifiers.' },
    { id: 'ip', title: '7. Intellectual Property', content: 'The platform, its components, and associated documentation are the property of their respective owners. Unauthorized reproduction or distribution is prohibited.' },
    { id: 'availability', title: '8. Service Availability', content: 'The platform is provided to support operational requirements. Availability may vary based on infrastructure, maintenance, and operational conditions.' },
    { id: 'restrictions', title: '9. Restrictions', content: 'Reverse engineering, unauthorized access attempts, and interference with platform operations are prohibited.' },
    { id: 'disclaimer', title: '10. Disclaimer', content: 'The platform is provided for operational support. It does not guarantee specific outcomes and should be used as one component of broader operational decision-making.' },
    { id: 'liability', title: '11. Limitation of Liability', content: 'To the extent permitted by applicable law, the platform operators are not liable for indirect, incidental, or consequential damages arising from use of the platform.' },
    { id: 'changes', title: '12. Changes to Terms', content: 'Terms may be updated as the platform evolves. Continued use after changes constitutes acceptance of the updated terms.' },
    { id: 'contact', title: '13. Contact', content: 'For terms-related enquiries, use the Contact page.' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-400">Terms governing the use of the Bhairav platform.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 flex items-center justify-center">
                {section.id === 'security' || section.id === 'accounts' ? (
                  <Shield size={16} className="text-[var(--color-bhairav-primary)]" />
                ) : section.id === 'liability' || section.id === 'disclaimer' ? (
                  <AlertCircle size={16} className="text-[var(--color-bhairav-primary)]" />
                ) : (
                  <FileText size={16} className="text-[var(--color-bhairav-primary)]" />
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
