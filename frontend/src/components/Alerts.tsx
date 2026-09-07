import React from 'react';
import Layout from './layout/Layout';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from './contexts/NotificationContext';
import type { Notification } from './contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Alerts: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Bell className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Alerts & History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete log of system notifications, case updates, and active alerts.
            </p>
          </div>
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </button>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg">No alerts found</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((n: Notification) => (
                <li 
                  key={n.id} 
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${n.read ? 'opacity-70 bg-gray-50/50 dark:bg-gray-900/20' : 'bg-white dark:bg-dark-card'}`}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1" 
                      onClick={() => {
                        if (n.case_id) navigate(`/cases/${n.case_id}`);
                      }}
                    >
                      <h3 className={`text-lg font-medium ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {n.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {n.description}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 flex items-center">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs mr-3">
                          {n.case_id ? n.case_id : 'System'}
                        </span>
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        title="Mark as Read"
                        className="ml-4 p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors focus:outline-none"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
