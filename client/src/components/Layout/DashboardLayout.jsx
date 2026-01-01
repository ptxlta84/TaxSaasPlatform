import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Dashboard/Notifications/NotificationBell';
import LanguageSwitcher from '../LanguageSwitcher';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 h-full">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>
                </div>
                <Sidebar />
            </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="md:hidden -ml-2 p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white md:hidden">TaxSaas</h1>
            </div>



import LanguageSwitcher from '../LanguageSwitcher';
// ... imports

// ... inside render
import ThemeToggle from '../ThemeToggle';
// ...
            <div className="flex items-center gap-4">
               <LanguageSwitcher />
               <ThemeToggle />
               <NotificationBell />
               <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user?.name?.charAt(0) || <User size={16} />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                      {user?.name}
                  </span>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 duration-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
