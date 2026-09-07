import React from 'react';
import Layout from './layout/Layout';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1).replace('-', ' ');
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <Layout>
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border m-4 min-h-[60vh]">
        <Construction className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title} Module
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          This feature is currently under development or integration. Please check back later.
        </p>
      </div>
    </Layout>
  );
};

export default PlaceholderPage;
