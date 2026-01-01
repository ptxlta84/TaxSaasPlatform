import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const FilingStatusTracker = ({ currentStage = 'filed' }) => {
    
    const stages = [
        { id: 'filed', label: 'Return Filed', desc: 'ITR-V Generated', date: new Date().toLocaleDateString(), active: true },
        { id: 'verified', label: 'E-Verified', desc: 'Verification Complete', active: ['verified', 'processed', 'refund_approved', 'completed'].includes(currentStage) },
        { id: 'processed', label: 'CPC Processed', desc: 'Under Assessment', active: ['processed', 'refund_approved', 'completed'].includes(currentStage) },
        { id: 'refund_approved', label: 'Refund Approved', desc: 'Sanctioned by IT Dept', active: ['refund_approved', 'completed'].includes(currentStage) },
        { id: 'completed', label: 'Refund Credited', desc: 'Sent to Bank Account', active: ['completed'].includes(currentStage) }
    ];

    // Determine current active index for progress bar
    const stageIds = stages.map(s => s.id);
    const currentIndex = stageIds.indexOf(currentStage);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Filing Status</h3>
            
            <div className="relative">
                {/* Vertical Line for Mobile */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 md:hidden"></div>
                
                {/* Horizontal Line for Desktop */}
                <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0">
                     <div 
                        className="h-full bg-green-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
                    ></div>
                </div>

                <div className="grid md:grid-cols-5 gap-8 md:gap-4 relative z-10">
                    {stages.map((stage, idx) => {
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                            <div key={stage.id} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                                {/* Icon/Dot */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors
                                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800'}`}>
                                    {isCompleted ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                                </div>
                                
                                {/* Info */}
                                <div>
                                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                        {stage.label}
                                    </h4>
                                    <p className="text-xs text-gray-500">{stage.desc}</p>
                                    {isCurrent && stage.date && (
                                        <p className="text-[10px] text-blue-600 font-medium mt-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block">
                                            {stage.date}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Estimated Time Context */}
            {currentStage !== 'completed' && (
                <div className="mt-8 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <Clock className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">Estimated Completion Date: June 15, 2025</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            CPC Bangalore typically processes ITR-2 returns within 2-4 weeks after E-Verification.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilingStatusTracker;
