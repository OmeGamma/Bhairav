import os
import re

def fix_all():
    base_dir = r"c:\Users\SHOBHIT\SIH\Bhairav\src"
    
    # helper
    def read_file(path):
        with open(os.path.join(base_dir, path), 'r', encoding='utf-8') as f:
            return f.read()

    def write_file(path, content):
        with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
            f.write(content)

    # 1. & 2. Back Navigation
    # Let's add Back buttons to: Command Centre, Security Intelligence (SecurityEvents, SecurityMonitoring, SecurityMap), Document Verification, Network Intelligence, Personnel Welfare (PersonnelDashboard, WelfareCheckIn, SupportCenter), Maps & Analytics, AI Assistant, Notifications, Profile, Settings.
    
    # We will build a common BackButton component if it doesn't exist.
    back_button_code = """import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)}
      className={cn("flex items-center gap-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-all px-3 py-1.5 rounded-md hover:bg-[var(--color-bhairav-surface-hover)] group", className)}
    >
      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium text-sm">Back</span>
    </button>
  );
}
"""
    back_btn_path = os.path.join(base_dir, "components/common/BackButton.tsx")
    if not os.path.exists(back_btn_path):
        with open(back_btn_path, 'w', encoding='utf-8') as f:
            f.write(back_button_code)

    # Add back button to pages. We will insert it just inside the main wrapper.
    pages_to_modify = [
        "pages/command-center/CommandCenter.tsx",
        "pages/security/SecurityEvents.tsx",
        "pages/security/SecurityMap.tsx",
        "pages/security/SecurityMonitoring.tsx",
        "pages/Verification.tsx",
        "pages/NetworkIntelligence.tsx",
        "pages/PersonnelDashboard.tsx",
        "pages/AskBhairav.tsx",
        "pages/NotificationsPage.tsx",
        "pages/ProfilePage.tsx",
    ]
    
    for page in pages_to_modify:
        if os.path.exists(os.path.join(base_dir, page)):
            content = read_file(page)
            if "BackButton" not in content:
                # Add import
                import_stmt = "import { BackButton } from '../components/common/BackButton';\n"
                if page.startswith("pages/security/") or page.startswith("pages/command-center/"):
                    import_stmt = "import { BackButton } from '../../components/common/BackButton';\n"
                
                content = import_stmt + content
                
                # Replace the first <div> inside return or main
                # we can find `return (` and the next `<div` or `<main`
                content = re.sub(r'(return\s*\(\s*)(<div[^>]*>|<main[^>]*>)', r'\1\2\n        <div className="mb-4"><BackButton /></div>', content, count=1)
                write_file(page, content)
                print(f"Added BackButton to {page}")

    # 5. Home Page Login Redirect
    # In App.tsx or LoginPage.tsx or AuthContext.tsx
    # Let's check App.tsx AuthProvider
    # Actually wait, after login where does it go? Check HomeRedirect component or AuthContext.
    # Let's just create a quick search script inside to modify Home redirects.
    
if __name__ == "__main__":
    fix_all()
