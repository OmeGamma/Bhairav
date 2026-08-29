import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { BhairavFooter } from './BhairavFooter';

export function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)]">
      <TopNav />
      <main className="pt-16">
        <Outlet />
      </main>
      <BhairavFooter />
    </div>
  );
}
