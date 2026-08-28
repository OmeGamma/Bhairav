import { Keyboard, Type, Contrast, Smartphone, MousePointer, FileText } from 'lucide-react';

export default function AccessibilityPage() {
  const sections = [
    { title: 'Keyboard Navigation', description: 'Interactive elements are designed to be accessible through keyboard focus states and standard navigation patterns where implemented.', icon: Keyboard },
    { title: 'Readable Typography', description: 'The interface uses legible typography with scalable text and sufficient size for operational readability.', icon: Type },
    { title: 'Color Contrast', description: 'Text and interface elements are styled to maintain readable contrast against backgrounds in the dark theme.', icon: Contrast },
    { title: 'Responsive Layouts', description: 'Pages adapt to different screen sizes to support desktop, laptop, tablet, and mobile usage without horizontal overflow.', icon: Smartphone },
    { title: 'Accessible Controls', description: 'Buttons, links, and form controls include visible focus states and descriptive labels to support interaction clarity.', icon: MousePointer },
    { title: 'Semantic Structure', description: 'Pages use semantic HTML elements, including header, main, nav, and footer landmarks where applicable.', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Accessibility</h1>
        <p className="text-gray-400">Bhairav platform accessibility approach and implemented considerations.</p>
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
