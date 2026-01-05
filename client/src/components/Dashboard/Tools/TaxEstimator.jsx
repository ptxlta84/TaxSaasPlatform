import React, { useState } from 'react';
import axios from 'axios';
import { Calculator, ArrowRight, TrendingDown, Info } from 'lucide-react';

const TaxEstimator = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        grossIncome: '',
        otherIncome: '',
        deductions80C: '',
        deductions80D: '',
        hra: '',
        otherDeductions: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/tax/estimate`, formData, {
                headers: { 'x-auth-token': token }
            });
            setResult(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    Tax Liability Estimator
                </h2>
                <p className="text-gray-500 text-sm mt-1">Compare Old vs New Regime (AY 2025-26) to find your best option.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Input Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Income & Deductions</h3>
                        <form onSubmit={handleCalculate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Gross Salary / Income</label>
                                <input
                                    type="number"
                                    name="grossIncome"
                                    value={formData.grossIncome}
                                    onChange={handleChange}
                                    placeholder="e.g. 1200000"
                                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Other Income</label>
                                <input
                                    type="number"
                                    name="otherIncome"
                                    value={formData.otherIncome}
                                    onChange={handleChange}
                                    placeholder="Interest, Rental etc."
                                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Deductions (Old Regime Only)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">80C (Max 1.5L)</label>
                                        <input
                                            type="number"
                                            name="deductions80C"
                                            value={formData.deductions80C}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">80D (Health)</label>
                                        <input
                                            type="number"
                                            name="deductions80D"
                                            value={formData.deductions80D}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">HRA Exemption</label>
                                        <input
                                            type="number"
                                            name="hra"
                                            value={formData.hra}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Other</label>
                                        <input
                                            type="number"
                                            name="otherDeductions"
                                            value={formData.otherDeductions}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"
                            >
                                {loading ? 'Calculating...' : (
                                    <>
                                        Calculate Liability <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Result Section */}
                <div className="lg:col-span-7">
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-10 text-gray-400 text-center">
                            <Calculator size={48} className="mb-4 opacity-20" />
                            <p>Enter your income details to see the comparison.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Recommendation Card */}
                            <div className={`p-6 rounded-lg border-l-4 shadow-sm ${
                                result.recommendation === 'New Regime' 
                                ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                                : 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                            }`}>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white/50 rounded-full">
                                        <TrendingDown size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Recommended: {result.recommendation}</h3>
                                        <p className="mt-1">
                                            You will save <strong>{formatCurrency(result.savings)}</strong> by choosing the {result.recommendation}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Old Regime Card */}
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-300"></div>
                                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-4">Old Regime</h4>
                                    
                                    <div className="space-y-3 flex-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Taxable Income</span>
                                            <span className="font-medium dark:text-gray-200">{formatCurrency(result.oldRegime.taxableIncome)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Base Tax</span>
                                            <span className="font-medium dark:text-gray-200">{formatCurrency(result.oldRegime.breakdown.baseTax)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Cess (4%)</span>
                                            <span className="font-medium dark:text-gray-200">{formatCurrency(result.oldRegime.breakdown.cess)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-500">Total Tax</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.oldRegime.taxPayable)}</span>
                                    </div>
                                </div>

                                {/* New Regime Card */}
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden">
                                     <div className={`absolute top-0 left-0 w-full h-1 ${result.recommendation === 'New Regime' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                     {result.recommendation === 'New Regime' && (
                                         <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-md">Winner</span>
                                     )}
                                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-4">New Regime</h4>
                                    
                                    <div className="space-y-3 flex-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Taxable Income</span>
                                            <span className="font-medium dark:text-gray-200">{formatCurrency(result.newRegime.taxableIncome)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Base Tax</span>
                                            <span className="font-medium dark:text-gray-200">{formatCurrency(result.newRegime.breakdown.baseTax)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Cess (4%)</span>
                                            <span className="font-medium dark:text-gray-200">{formatCurrency(result.newRegime.breakdown.cess)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-500">Total Tax</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.newRegime.taxPayable)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-2 text-xs text-gray-400 mt-4 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                                <Info size={14} className="mt-0.5 flex-shrink-0" />
                                <p>
                                    Estimates are for AY 2025-26. New Regime includes standard deduction (FY 24-25). 
                                    Old Regime calculation assumes applicable age-based exemption limits.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaxEstimator;
