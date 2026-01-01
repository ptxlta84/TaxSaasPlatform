import React from 'react';
import { FileText, Download, Clock, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import Button from '../../Button/Button';
import { useNavigate } from 'react-router-dom';

const MyFilingsWidget = () => {
    const navigate = useNavigate();

    // Mock Data - In real app, fetch from API
    const activeFiling = {
        year: 'AY 2024-25',
        form: 'ITR-2',
        status: 'verified', // filed, verified, processed, refund_approved, completed
        ackNumber: 'ACK-2024-83921048',
        filedDate: 'Oct 15, 2024'
    };

    const history = [
        { year: 'AY 2023-24', form: 'ITR-1', status: 'completed', refund: 12500, date: 'Jul 20, 2023' },
        { year: 'AY 2022-23', form: 'ITR-1', status: 'completed', refund: 0, date: 'Jul 25, 2022' }
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'verified': return 'bg-blue-100 text-blue-700';
            case 'processed': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="text-blue-600" size={20}/> My Filings
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    View All <ChevronRight size={16}/>
                </button>
            </div>

            {/* Active Filing Card */}
            {activeFiling && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 mb-6 border border-blue-100 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Current Filing</div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{activeFiling.year}</h4>
                            <span className="text-sm text-gray-500">{activeFiling.form} • {activeFiling.ackNumber}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(activeFiling.status)}`}>
                            {activeFiling.status.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Simple Progress Bar */}
                    <div className="relative pt-2 pb-6">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-2/5 rounded-full relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full shadow"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                            <span className="text-blue-700">Filed</span>
                            <span className="text-blue-700">Verified</span>
                            <span>Processing</span>
                            <span>Done</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button size="sm" variant="outline" icon={Download} className="bg-white dark:bg-gray-800">
                            ITR-V
                        </Button>
                        <Button size="sm" variant="outline" icon={Clock} className="bg-white dark:bg-gray-800" onClick={() => navigate('/dashboard/itr-2-filing')}>
                            Track Status
                        </Button>
                    </div>
                </div>
            )}

            {/* History List */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">History</h4>
                {history.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                <CheckCircle size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{file.year}</div>
                                <div className="text-xs text-gray-500">{file.form} • {file.date}</div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="font-bold text-gray-900 dark:text-white">
                                {file.refund > 0 ? `+ ₹${file.refund.toLocaleString()}` : '₹0'}
                             </div>
                             <button className="text-xs text-blue-600 hover:underline flex items-center justify-end gap-1">
                                <Download size={12}/> Receipt
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyFilingsWidget;
