import os
import re

def main():
    src_dir = r"c:\Users\SHOBHIT\SIH\Bhairav\src"
    
    def read_file(path):
        with open(os.path.join(src_dir, path), 'r', encoding='utf-8') as f:
            return f.read()

    def write_file(path, content):
        with open(os.path.join(src_dir, path), 'w', encoding='utf-8') as f:
            f.write(content)
            
    # --- 1. BackButton Component ---
    back_btn_path = "components/common/BackButton.tsx"
    back_btn_code = """import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export function BackButton({ className, onClick }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <div className={cn("mb-6 flex", className)}>
      <button 
        onClick={onClick || (() => navigate(-1))}
        className="flex items-center gap-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-all px-3 py-1.5 rounded-md hover:bg-[var(--color-bhairav-surface-hover)] group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm">Back</span>
      </button>
    </div>
  );
}
"""
    write_file(back_btn_path, back_btn_code)
    
    # --- 2. Add BackButton to Pages ---
    pages_to_modify = {
        "pages/command-center/CommandCenter.tsx": "../../components/common/BackButton",
        "pages/security/SecurityEvents.tsx": "../../components/common/BackButton",
        "pages/security/SecurityMap.tsx": "../../components/common/BackButton",
        "pages/security/SecurityMonitoring.tsx": "../../components/common/BackButton",
        "pages/Verification.tsx": "../components/common/BackButton",
        "pages/NetworkIntelligence.tsx": "../components/common/BackButton",
        "pages/PersonnelDashboard.tsx": "../components/common/BackButton",
        "pages/AskBhairav.tsx": "../components/common/BackButton",
        "pages/NotificationsPage.tsx": "../components/common/BackButton",
        "pages/ProfilePage.tsx": "../components/common/BackButton",
    }
    
    for page, import_path in pages_to_modify.items():
        try:
            content = read_file(page)
            if "BackButton" not in content:
                import_stmt = f"import {{ BackButton }} from '{import_path}';\n"
                
                # Check for "use client" or other imports
                if content.startswith("import"):
                    content = import_stmt + content
                else:
                    content = import_stmt + content
                
                # Insert just after the first <main> or root <div ...>
                # Using regex to find the first <div class/id> after return (
                # This is tricky, a safer way is to replace the first `className="p-` or similar in the main wrapper,
                # Or just put it inside the first tag after return
                match = re.search(r'(return\s*\(\s*)(<[A-Za-z]+[^>]*>)', content)
                if match:
                    content = content[:match.end()] + "\n        <BackButton />" + content[match.end():]
                else:
                    match = re.search(r'(return\s*\(\s*<>\s*)(<[A-Za-z]+[^>]*>)', content)
                    if match:
                        content = content[:match.end()] + "\n        <BackButton />" + content[match.end():]

                write_file(page, content)
                print(f"Added BackButton to {page}")
        except FileNotFoundError:
            pass

    # --- 3. Fix TopNav.tsx ---
    topnav_content = read_file("components/layout/TopNav.tsx")
    
    # Add useRef and useEffect imports if missing
    if "useRef" not in topnav_content:
        topnav_content = topnav_content.replace("import { useState }", "import { useState, useRef, useEffect }")
        
    # Replace the dropdown handling logic and escape key for search
    # This requires careful replacement
    # We will just rewrite TopNav logic entirely for safety and correctness
    pass # Wait, let's do this in a separate python script focused just on rewriting TopNav.tsx to avoid complex regex
    
if __name__ == "__main__":
    main()
