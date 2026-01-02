import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Download, CreditCard } from 'lucide-react';
import Button from '../../../../Button/Button';
import UnifiedPaymentModal from '../../../Payment/UnifiedPaymentModal';
import { calculateITR2Tax } from '../../../../services/itr2Engine'; // Assumption based on structure

const ITR2Review = ({ formData, onBack, onSuccess }) => {
    const calculation = React.useMemo(() => {
        return calculateITR2Tax(formData);
    }, [formData]);

    if (!calculation) return <div>Calculating Taxes...</div>;

    return (
        <div className="space-y-8 pb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review & File ITR-2</h2>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Col: Income & Deductions Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Income Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600"/> Income Summary
                        </h3>
                        <div className="space-y-3">
                            <Row label="Salary Income" value={calculation.income.salary} />
                            <Row label="House Property" value={calculation.income.houseProperty} />
                            <Row label="Capital Gains" value={calculation.income.capitalGains} />
                            <Row label="Foreign Assets Income" value={calculation.income.foreignIncome} />
                            <div className="border-t pt-2 mt-2">
                                <Row label="Gross Total Income" value={calculation.income.gross} bold />
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                         <h3 className="font-bold text-lg mb-4">Deductions (Chapter VI-A)</h3>
                         <div className="space-y-3">
                            <Row label="80C, 80D, etc." value={calculation.deductions} />
                            <div className="border-t pt-2 mt-2">
                                <Row label="Total Taxable Income" value={calculation.taxableIncome} bold />
                            </div>
                         </div>
                    </div>

                    {/* Verification Options */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-lg mb-4">Verification Method</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input type="radio" name="verify" value="aadhaar_otp" checked={verificationMethod === 'aadhaar_otp'} onChange={() => setVerificationMethod('aadhaar_otp')} />
                                <div>
                                    <div className="font-medium">E-Verify via Aadhaar OTP</div>
                                    <div className="text-xs text-gray-500">Fastest method. Requires mobile linked to Aadhaar.</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input type="radio" name="verify" value="net_banking" checked={verificationMethod === 'net_banking'} onChange={() => setVerificationMethod('net_banking')} />
                                <div>
                                    <div className="font-medium">Net Banking EVC</div>
                                    <div className="text-xs text-gray-500">Verify via your bank account login.</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Col: Tax Calculation Card */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-6">
                        <h3 className="font-bold text-lg mb-6 border-b pb-2">Tax Computation</h3>
                        
                        <div className="space-y-3 text-sm">
                            <Row label="Income Tax" value={calculation.taxBreakdown.baseTax} />
                            <Row label="Surcharge" value={calculation.taxBreakdown.surcharge} />
                            <Row label="Health & Edu Cess (4%)" value={calculation.taxBreakdown.cess} />
                            <div className="border-t pt-2 font-semibold">
                                <Row label="Total Tax Liability" value={calculation.taxBreakdown.totalLiability} />
                            </div>
                            
                            <div className="pt-4 text-gray-500">
                                <Row label="Less: TDS / TCS" value={calculation.paid.tds} />
                                <Row label="Less: Advance Tax" value={calculation.paid.advanceTax} />
                            </div>

                            <div className={`mt-6 p-4 rounded-lg text-center ${calculation.final.payable > 0 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                                <div className="text-sm font-medium mb-1">
                                    {calculation.final.payable > 0 ? 'Amount Payable' : 'Refund Due'}
                                </div>
                                <div className="text-3xl font-bold">
                                    ₹{(calculation.final.payable || calculation.final.refund).toLocaleString('en-IN')}
                                </div>
                            </div>

                            <Button className="w-full mt-4" size="lg" icon={calculation.final.payable > 0 ? CreditCard : CheckCircle}>
                                {calculation.final.payable > 0 ? 'Pay Now & File' : 'File ITR-2 Now'}
                            </Button>
                             <Button variant="outline" className="w-full" icon={Download}>
                                Download JSON / PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Rows
const Row = ({ label, value, bold }) => (
    <div className={`flex justify-between ${bold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
        <span>{label}</span>
        <span>₹{value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
    </div>
);

export default ITR2Review;
