import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/authService'; // Assuming this is the authenticated axios instance

const DashboardState = () => {
  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardState();
  }, []);

  const fetchDashboardState = async () => {
    try {
      const res = await api.get('/dashboard/state');
      setStateData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard state:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6"></div>;
  }

  if (!stateData) return null;

  const { progress, nextStep, status } = stateData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Your Filing Status
            <span className={`px-2 py-1 text-xs rounded-full font-medium bg-${status.color}-100 text-${status.color}-800 dark:bg-${status.color}-900/30 dark:text-${status.color}-300`}>
              {status.label}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Complete the steps below to file your Income Tax Return.</p>
        </div>
        
        <div className="text-right hidden md:block">
           <span className="text-3xl font-bold text-blue-600">{progress}%</span>
           <span className="text-xs text-gray-400 block uppercase tracking-wider">Completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${progress}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      {/* Next Action Card */}
      {nextStep && progress < 100 && (
        <div 
            onClick={() => navigate(nextStep.link)}
            className="group flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <ArrowRight size={20} />
             </div>
             <div>
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Next Step: {nextStep.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{nextStep.description}</p>
             </div>
          </div>
          <ArrowRight className="text-blue-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {progress === 100 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" />
            <div>
                <h4 className="font-bold text-green-800 dark:text-green-400">All Set!</h4>
                <p className="text-sm text-green-700 dark:text-green-300">You have successfully filed your return.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardState;
