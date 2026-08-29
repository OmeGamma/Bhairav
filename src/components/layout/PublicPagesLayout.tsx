import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TopNav } from './TopNav';
import { BhairavFooter } from './BhairavFooter';

export function PublicPagesLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] flex flex-col">
      <TopNav />
      <main className="flex-1 pt-16 animate-fade-in-up">
        <Outlet />
      </main>
      <BhairavFooter />
    </div>
  );
}
