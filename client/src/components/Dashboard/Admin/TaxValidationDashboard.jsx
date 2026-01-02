import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Layout, PieChart } from 'lucide-react';
import { RUN_VALIDATION } from '../../../services/taxValidationEngine';

const TaxValidationDashboard = () => {
    const [results, setResults] = useState(() => RUN_VALIDATION());
    const [selectedSuite, setSelectedSuite] = useState('ALL');

    const suites = [...new Set(results.map(r => r.suite))];
    const filteredResults = selectedSuite === 'ALL' ? results : results.filter(r => r.suite === selectedSuite);

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className={score === 100 ? "text-green-600" : "text-orange-500"} size={32} />
                        Validation Control Center
                    </h1>
                    <p className="text-gray-500">FY 2024-25 • Core Tax Logic Verification</p>
                </div>
                <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-right pr-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500">Total Tests</div>
                        <div className="font-bold text-xl">{totalCount}</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-black ${score === 100 ? 'text-green-600' : 'text-orange-500'}`}>{score}%</div>
                        <div className="text-xs text-gray-400">Passing Rate</div>
                    </div>
                </div>
            </div>

            {/* Suite Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                 <button 
                    onClick={() => setSelectedSuite('ALL')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedSuite === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                 >
                    All Suites
                 </button>
                 {suites.map(suite => (
                     <button 
                        key={suite}
                        onClick={() => setSelectedSuite(suite)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedSuite === suite ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                     >
                        {suite}
                     </button>
                 ))}
            </div>

            <div className="grid gap-4">
                {filteredResults.map((res) => (
                    <div key={res.id} className={`p-5 rounded-lg border-l-4 shadow-sm bg-white dark:bg-gray-800 ${res.passed ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                {res.passed ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{res.title}</h3>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{res.suite} • {res.id}</div>
                                </div>
                             </div>
                        </div>

                        {/* Comparsion Grid */}
                        <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700 p-3 grid grid-cols-2 gap-4 text-sm font-mono">
                            <div>
                                <div className="text-xs text-gray-400 mb-1">EXPECTED</div>
                                {Object.entries(res.expected).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="text-gray-500">{k}:</span>
                                        <span className="font-bold text-blue-600">{typeof v === 'number' ? v.toLocaleString() : v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-l pl-4 border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-400 mb-1">ACTUAL</div>
                                {Object.entries(res.actual).map(([k, v]) => {
                                    // Highlight mismatches
                                    const expectedVal = res.expected[k];
                                    const isMismatch = (typeof v === 'number' && expectedVal !== undefined) 
                                        ? Math.abs(v - expectedVal) > 100 
                                        : (expectedVal !== undefined && v !== expectedVal);
                                        
                                    return (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-gray-500">{k}:</span>
                                            <span className={`font-bold ${isMismatch ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {typeof v === 'number' ? v.toLocaleString() : v}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaxValidationDashboard;
