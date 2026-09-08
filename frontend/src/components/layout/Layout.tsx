import React from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from './/Topbar';
import ErrorBoundary from '../ErrorBoundary';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-light-bg dark:bg-dark-bg">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <footer className="py-2 px-4 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-light-border dark:border-dark-border flex-shrink-0">
          Bhairav - By OmeGamma
        </footer>
      </div>
    </div>
  );
};

export default Layout;

