import os
import re

def fix_remaining():
    src = r'c:\Users\SHOBHIT\SIH\Bhairav\src'
    
    # 1. Fix redirections to /command-center -> /home in Auth files
    for root, dirs, files in os.walk(src):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                if 'navigate("/command-center")' in content or "navigate('/command-center')" in content or 'to="/command-center"' in content:
                    if 'LoginPage' in f or 'HomeRedirect' in f or 'RegisterPage' in f or 'OnboardingPage' in f or 'App.tsx' in f:
                        new_content = content.replace('/command-center', '/home')
                        with open(path, 'w', encoding='utf-8') as file:
                            file.write(new_content)
                        print(f'Modified redirects in {path}')

    # 2. Command Centre Map Size
    cc_path = os.path.join(src, 'pages', 'command-center', 'CommandCenter.tsx')
    if os.path.exists(cc_path):
        with open(cc_path, 'r', encoding='utf-8') as f:
            cc_content = f.read()
        # Find map container and increase size. It might be <div className="h-[400px]"> or similar.
        # Let's just make any map container much larger. Usually it's min-h-[400px] or h-96.
        cc_content = re.sub(r'h-\[400px\]', 'h-[70vh] min-h-[600px]', cc_content)
        cc_content = re.sub(r'h-96', 'h-[70vh] min-h-[600px]', cc_content)
        with open(cc_path, 'w', encoding='utf-8') as f:
            f.write(cc_content)
        print("Updated CommandCenter map size")

    # 3. Home.tsx
    home_path = os.path.join(src, 'pages', 'Home.tsx')
    if os.path.exists(home_path):
        with open(home_path, 'r', encoding='utf-8') as f:
            home_content = f.read()
            
        home_new_content = """import { Link } from 'react-router-dom';
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
"""
        with open(home_path, 'w', encoding='utf-8') as f:
            f.write(home_new_content)
        print("Updated Home.tsx with feature cards")
        
    # 4. Global CSS Page spacing & transitions
    app_layout = os.path.join(src, 'components', 'layout', 'AuthenticatedLayout.tsx')
    if os.path.exists(app_layout):
        with open(app_layout, 'r', encoding='utf-8') as f:
            lay_content = f.read()
        lay_content = lay_content.replace('pt-16', 'pt-24') # Add spacing between navbar and content
        
        # Add basic transition wrapper if we can, or just rely on CSS
        with open(app_layout, 'w', encoding='utf-8') as f:
            f.write(lay_content)
            
    # Add animate-in to index.css if not present
    idx_css = os.path.join(src, 'index.css')
    if os.path.exists(idx_css):
        with open(idx_css, 'a', encoding='utf-8') as f:
            f.write("\n\n/* Global Transitions */\n.animate-in { animation: fadeIn 0.4s ease-out forwards; }\n@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\n")

if __name__ == "__main__":
    fix_remaining()
