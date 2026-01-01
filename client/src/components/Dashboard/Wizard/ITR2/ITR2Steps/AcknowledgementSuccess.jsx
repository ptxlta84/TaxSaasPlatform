import React from 'react';
import { CheckCircle, Download, FileText, Share2 } from 'lucide-react';
import Button from '../../Button/Button';
import FilingStatusTracker from '../Tracker/FilingStatusTracker';
import { useNavigate } from 'react-router-dom';

const AcknowledgementSuccess = ({ ackDetails }) => {
    const navigate = useNavigate();

    // Default mock details if not provided (for component preview)
    const details = ackDetails || {
        ackNumber: 'ACK-2024-ABCDE1234F-54921',
        filedAt: new Date().toLocaleString(),
        status: 'verified'
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ITR Filed Successfully!</h1>
                <p className="text-gray-500">Your Income Tax Return for AY 2024-25 has been successfully submitted and verified.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
                {/* Details Card */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">Filing Details</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <p className="text-gray-500">Acknowledgement No.</p>
                            <p className="font-mono font-bold text-gray-900 dark:text-white">{details.ackNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Filing Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">{details.filedAt}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Assessment Year</p>
                            <p className="font-medium text-gray-900 dark:text-white">2024-25</p>
                        </div>
                         <div>
                            <p className="text-gray-500">ITR Form</p>
                            <p className="font-medium text-gray-900 dark:text-white">ITR-2</p>
                        </div>
                    </div>
                </div>

                 {/* Quick Actions */}
                <div className="space-y-4">
                    <Button className="w-full justify-between" icon={Download}>
                        Download ITR-V
                    </Button>
                    <Button variant="outline" className="w-full justify-between" icon={FileText}>
                         Payment Receipt
                    </Button>
                    <Button variant="outline" className="w-full justify-between" icon={Share2}>
                        Share Details
                    </Button>
                </div>
            </div>

            {/* Tracker */}
            <div className="mb-10">
                <FilingStatusTracker currentStage={details.status} />
            </div>

            <div className="flex justify-center">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default AcknowledgementSuccess;
