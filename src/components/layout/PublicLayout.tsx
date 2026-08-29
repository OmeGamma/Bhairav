import { Outlet } from 'react-router-dom';
import { BhairavFooter } from './BhairavFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)]">
      <main className="flex-1">
        <Outlet />
      </main>
      <BhairavFooter />
    </div>
  );
}
