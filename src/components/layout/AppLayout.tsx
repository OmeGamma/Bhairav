import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BhairavFooter } from './BhairavFooter';
import { ScrollToTop } from '../common/ScrollToTop';

/**
 * Single global layout used by every route in the app.
 * - Renders the Navbar once at the top
 * - Renders the Footer once at the bottom
 * - Pages render inside <Outlet /> with full natural scrolling
 * - No sidebar, no per-page headers
 */
export function AppLayout() {
  useLocation(); // ensure ScrollToTop picks up location changes
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)]">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <BhairavFooter />
    </div>
  );
}
