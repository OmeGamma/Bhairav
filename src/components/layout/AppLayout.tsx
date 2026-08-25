import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
