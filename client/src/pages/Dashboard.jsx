import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Container from '../components/Layout/Container';
import DashboardState from '../components/DashboardState';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <Container>
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaxSaas Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </Container>
      </nav>

      <Container>
        <div className="py-12">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* [NEW] Progress System */}
              <DashboardState />
              
              <h2 className="text-2xl font-semibold mb-4">You are logged in!</h2>
              <p>This is the protected dashboard area. Only authenticated users can see this.</p>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">User Profile</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
