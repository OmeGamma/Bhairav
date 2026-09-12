import React from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from './/Topbar';
import ErrorBoundary from '../ErrorBoundary';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text md:flex-row">
      <Sidebar />
      <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-y-auto md:w-auto">
        <Topbar />
        <main className="w-full min-w-0 flex-1 bg-light-bg dark:bg-dark-bg">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <footer className="w-full flex-shrink-0 border-t border-light-border dark:border-dark-border py-3 px-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Bhairav - By OmeGamma
        </footer>
      </div>
    </div>
  );
};

export default Layout;

