import React from 'react';
import { Building2, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../../Button/Button';

const Form16Preview = ({ data, onConfirm, onReupload }) => {
  const { employer, salary, tds, financialYear } = data;

  const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 ${className}`}>
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 border-b border-green-100 dark:border-green-800 flex items-center gap-3">
        <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
        <div>
           <h3 className="font-bold text-gray-900 dark:text-white">Form 16 Parsed Successfully</h3>
           <p className="text-sm text-gray-600 dark:text-gray-300">Review extracted data for FY {financialYear}</p>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-8">
        {/* Employer Details */}
        <div>
           <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
              <Building2 size={18} className="text-blue-500" /> Employer Details
           </h4>
           <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-1">
              <InfoRow label="Name" value={employer.name} />
              <InfoRow label="TAN" value={employer.tan} />
              <InfoRow label="Address" value={employer.address} />
           </div>
        </div>

        {/* TDS Details */}
         <div>
           <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
              <FileText size={18} className="text-purple-500" /> TDS Summary
           </h4>
           <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-1">
              <InfoRow label="Total Amount Paid" value={`₹${tds.totalamount.toLocaleString()}`} />
              <InfoRow label="Total Tax Deducted" value={`₹${tds.taxDeducted.toLocaleString()}`} className="text-red-600 font-bold" />
           </div>
        </div>
        
        {/* Salary Details (Full Width) */}
        <div className="md:col-span-2">
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
              <FileText size={18} className="text-green-500" /> Salary Breakdown (Part B)
           </h4>
           <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 grid md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="Gross Salary" value={`₹${salary.gross.toLocaleString()}`} />
                <InfoRow label="All Allowances (Exempt)" value={`₹${(salary.hra + salary.lta).toLocaleString()}`} />
                <div className="col-span-2 my-2 border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                <InfoRow label="Standard Deduction" value={`₹${salary.standardDeduction.toLocaleString()}`} />
                <InfoRow label="Professional Tax" value={`₹${salary.professionalTax.toLocaleString()}`} />
                <div className="col-span-2 my-2 border-t border-gray-300 dark:border-gray-600"></div>
                <InfoRow label="Net Taxable Income" value={`₹${salary.netTaxable.toLocaleString()}`} className="text-lg font-bold text-blue-600" />
           </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
         <Button variant="outline" onClick={onReupload}>Upload Different File</Button>
         <Button onClick={onConfirm} className="flex items-center gap-2">
            Proceed to Filing <ArrowRight size={18} />
         </Button>
      </div>
    </div>
  );
};

export default Form16Preview;
