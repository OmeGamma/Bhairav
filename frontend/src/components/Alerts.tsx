import React, { useState } from 'react';
import Layout from './layout/Layout';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { useNotifications } from './contexts/NotificationContext';
import type { Notification } from './contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Alerts: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter((n: Notification) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Bell className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Alerts & History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete log of system notifications, case updates, and active alerts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {(['all', 'unread', 'read'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button 
              onClick={markAllAsRead}
              className="px-4 py-1.5 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center text-sm shadow-sm"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">No alerts found</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredNotifications.map((n: Notification) => (
                <li 
                  key={n.id} 
                  className={`p-6 transition-colors group cursor-pointer ${n.read ? 'opacity-70 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-100/50 dark:hover:bg-gray-800/40' : 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  onClick={() => { if (n.case_id) navigate(`/cases/${n.case_id}`); }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-base font-semibold ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 tracking-wider">
                            UNREAD
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                        {n.description}
                      </p>
                      <div className="mt-4 flex items-center text-xs font-medium text-gray-400 dark:text-gray-500">
                        {n.case_id && (
                          <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-300 mr-3 border border-gray-200 dark:border-gray-700">
                            {n.case_id}
                          </span>
                        )}
                        <span>{new Date(n.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(n.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      </div>
                    </div>
                    {!n.read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        title="Mark as Read"
                        className="ml-6 flex items-center text-xs font-semibold text-light-accent dark:text-dark-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline focus:outline-none"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        MARK READ
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

