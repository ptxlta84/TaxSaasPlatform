import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Download, Calculator, PiggyBank, Shield } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TaxOverview = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/tax/summary`, {
                headers: { 'x-auth-token': token }
            });
            setSummary(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your tax summary...</div>;

    const { grossTotalIncome, totalDeductionsClaimed, taxResult, completion } = summary || {};

    return (
        <div className="space-y-6">
            {/* Header with Welcome and Progress */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.name || 'User'}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        FY 2024-25 (AY 2025-26) Return Filing
                    </p>
                </div>
                
                {/* Progress Widget */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4 w-full md:w-auto shadow-sm">
                    <div className="flex-1 md:w-48">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Return Completeness</span>
                            <span className="font-bold text-blue-600">{completion?.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                                style={{ width: `${completion?.score}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Central Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gross Income */}
                <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                             <TrendingUp size={20} className="text-blue-200" />
                            <h3 className="text-blue-100 font-medium text-sm uppercase">Gross Total Income</h3>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">{formatCurrency(grossTotalIncome)}</p>
                        <Link to="/dashboard/income-tax" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold bg-blue-500/50 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors">
                            Manage Income <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                {/* Deductions */}
                <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                             <Shield size={20} className="text-emerald-200" />
                            <h3 className="text-emerald-100 font-medium text-sm uppercase">Chapter VI-A Deductions</h3>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalDeductionsClaimed)}</p>
                        <Link to="/dashboard/deductions" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold bg-emerald-500/50 hover:bg-emerald-500 px-3 py-1.5 rounded-full transition-colors">
                            Manage Deductions <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                {/* Tax Liability - Dynamic */}
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden border border-gray-700">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calculator size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Calculator size={20} className="text-gray-400" />
                                <h3 className="text-gray-400 font-medium text-sm uppercase">Proj. Tax Liability</h3>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                taxResult?.recommendation === 'New Regime' ? 'bg-green-500 text-green-950' : 'bg-blue-500 text-white'
                            }`}>
                                {taxResult?.recommendation === 'New Regime' ? 'NEW REGIME' : 'OLD REGIME'}
                            </span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">
                            {formatCurrency(taxResult?.recommendation === 'New Regime' ? taxResult?.newRegime?.taxPayable : taxResult?.oldRegime?.taxPayable)}
                        </p>
                        
                        {taxResult?.savings > 0 && (
                            <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                                <PiggyBank size={14} />
                                Saving {formatCurrency(taxResult?.savings)} vs alternative
                            </p>
                        )}

                        <Link to="/dashboard/estimate" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                            View Detailed Breakdown <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {/* Upload Form 16 */}
                 <Link to="/dashboard/upload-form16" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                        <Download size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Upload Form 16</h3>
                    <p className="text-xs text-gray-500 mt-1">Auto-fill via PDF</p>
                 </Link>

                 {/* Income Sources */}
                 <Link to="/dashboard/income-tax" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-3">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Income Sources</h3>
                    <p className="text-xs text-gray-500 mt-1">Salary, House, Gains</p>
                 </Link>

                 {/* Deductions */}
                 <Link to="/dashboard/deductions" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                        <Shield size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Deductions</h3>
                    <p className="text-xs text-gray-500 mt-1">80C, 80D, 80G</p>
                 </Link>

                 {/* File ITR */}
                 <Link to="/dashboard/filing" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform mb-3">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">File ITR Now</h3>
                    <p className="text-xs text-gray-500 mt-1">Start e-filing flow</p>
                 </Link>
            </div>
            
            {/* Status Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Filing Status: Pending</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Your ITR for AY 2025-26 has not been filed yet. Please complete your profile and income details to proceed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TaxOverview;
