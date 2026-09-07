import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './layout/Layout';
import { User, Settings, Bell, FileText } from 'lucide-react';

const Profile: React.FC = () => {
  const user = {
    name: 'Officer',
    email: 'officer@bhairav.local',
    role: 'Investigator',
    badgeId: 'BHV-001',
    joined: '2025-01-15',
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center">
          <User className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-light-accent/10 dark:bg-dark-accent/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-light-accent dark:text-dark-accent" />
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Badge ID: <span className="text-gray-900 dark:text-white">{user.badgeId}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email: <span className="text-gray-900 dark:text-white">{user.email}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Joined: <span className="text-gray-900 dark:text-white">{user.joined}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          <div className="space-y-3">
            <Link to="/settings" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Settings className="w-5 h-5 mr-3" />
              Theme and Settings
            </Link>
            <Link to="/alerts" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Bell className="w-5 h-5 mr-3" />
              Notification Preferences
            </Link>
            <Link to="/reports" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
              <FileText className="w-5 h-5 mr-3" />
              Generated Reports
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
