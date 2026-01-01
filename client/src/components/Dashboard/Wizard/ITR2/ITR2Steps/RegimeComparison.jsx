import React from 'react';
import { CheckCircle, AlertCircle, TrendingDown, Info } from 'lucide-react';

const RegimeComparison = ({ calculation }) => {
    if (!calculation) return null;

    const { oldRegime, newRegime, recommendation } = calculation;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingDown className="text-blue-600" /> Tax Regime Comparison
                </h3>
                <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    Recommended: {recommendation.bestRegime} Regime
                </div>
            </div>

            <div className="grid md:grid-cols-2">
                {/* New Regime */}
                <div className={`p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 relative ${recommendation.bestRegime === 'NEW' ? 'bg-green-50/30' : ''}`}>
                    {recommendation.bestRegime === 'NEW' && (
                        <div className="absolute top-2 right-2 text-green-500">
                            <CheckCircle size={24} />
                        </div>
                    )}
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">New Regime (Default)</h4>
                    <p className="text-xs text-gray-500 mb-4">Lower tax rates, but fewer deductions.</p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Gross Income</span>
                            <span className="font-medium">₹{calculation.income.gross.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                            <span>Deductions</span>
                            <span>- ₹{newRegime.deductions.total.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between border-t border-dashed pt-2">
                            <span className="text-gray-900 dark:text-white font-medium">Taxable Income</span>
                            <span className="font-bold">₹{newRegime.taxableIncome.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between mt-4 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <span className="font-bold text-gray-900 dark:text-white">Total Tax</span>
                            <span className="font-bold text-blue-600">₹{newRegime.totalTax.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Old Regime */}
                <div className={`p-6 relative ${recommendation.bestRegime === 'OLD' ? 'bg-green-50/30' : ''}`}>
                     {recommendation.bestRegime === 'OLD' && (
                        <div className="absolute top-2 right-2 text-green-500">
                            <CheckCircle size={24} />
                        </div>
                    )}
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Old Regime</h4>
                    <p className="text-xs text-gray-500 mb-4">Higher rates, but claims all deductions.</p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Gross Income</span>
                            <span className="font-medium">₹{calculation.income.gross.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                            <span>Deductions</span>
                            <span>- ₹{oldRegime.deductions.total.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between border-t border-dashed pt-2">
                            <span className="text-gray-900 dark:text-white font-medium">Taxable Income</span>
                            <span className="font-bold">₹{oldRegime.taxableIncome.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between mt-4 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <span className="font-bold text-gray-900 dark:text-white">Total Tax</span>
                            <span className="font-bold text-blue-600">₹{oldRegime.totalTax.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendation Message */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm flex gap-2 items-start">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>
                    <strong>Expert Tip:</strong> {recommendation.message}
                    {recommendation.bestRegime === 'OLD' && " Ensure you have proofs for all claimed deductions."}
                </p>
            </div>
        </div>
    );
};

export default RegimeComparison;
