import React from 'react';
import { FileText, Calendar, AlertCircle, UploadCloud, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';

const TaxOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock Data (will come from API later)
  const currentFY = "2024-25";
  const filingStatus = user?.filingStatus === 'filed' ? 'Filed' : 'Not Started';
  const dueDate = "July 31, 2025";
  
  return (
    <div className="space-y-6">
      {/* Client Registration Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Client Registration
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            New to our platform? Create your taxpayer account to manage your taxes.
          </p>
          <button 
            onClick={() => navigate('/auth/register/client')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Create New Client Account
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login here</a>
          </p>
        </div>
      </div>

      {/* Welcome & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Status Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
              <FileText size={200} />
           </div>
           
           <div className="relative z-10">
             <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Income Tax Return (ITR)</h2>
                  <p className="text-blue-100">Financial Year {currentFY}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    filingStatus === 'Filed' ? 'bg-green-400 text-green-900' : 'bg-orange-400 text-orange-900'
                }`}>
                    {filingStatus}
                </div>
             </div>
             
             <div className="mt-8 flex gap-4">
                <Button onClick={() => navigate('/dashboard/filing')} className="bg-white text-blue-600 hover:bg-blue-50 border-none">
                    Start Filing Now <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button onClick={() => navigate('/dashboard/upload-form16')} variant="outline" className="text-white border-white hover:bg-white/10">
                    <UploadCloud size={16} className="mr-2" /> Upload Form 16
                </Button>
             </div>
           </div>
        </div>

        {/* Deadline Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2 text-red-500 font-semibold">
                <AlertCircle size={20} />
                <span>Next Deadline</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dueDate}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Due date for Individual ITR Filing (Non-Audit)</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Days Remaining:</span>
                <span className="font-bold text-gray-900 dark:text-white">214 Days</span>
            </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-start mb-2">
                 <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                 <span className="text-xs font-semibold text-gray-400 uppercase">Projected Refund</span>
             </div>
             <h4 className="text-2xl font-bold text-gray-900 dark:text-white">₹0</h4>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-start mb-2">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileText size={20} /></div>
                 <span className="text-xs font-semibold text-gray-400 uppercase">Documents</span>
             </div>
             <h4 className="text-2xl font-bold text-gray-900 dark:text-white">0 Uploaded</h4>
          </div>
          
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-start mb-2">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Calendar size={20} /></div>
                 <span className="text-xs font-semibold text-gray-400 uppercase">Last Filed</span>
             </div>
             <h4 className="text-lg font-bold text-gray-900 dark:text-white">Never</h4>
          </div>
      </div>
    </div>
  );
};

export default TaxOverview;
