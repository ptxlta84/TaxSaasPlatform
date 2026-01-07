import React from 'react';
import { Building2, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../../Button/Button';

// Helper Component (Outside parent)
const InfoRow = ({ label, value, className = "" }) => (
  <div className={`flex justify-between text-sm ${className}`}>
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 dark:text-white">{value || '-'}</span>
  </div>
);

const Form16Preview = ({ data, onConfirm, onReupload }) => {
  try {
      const { 
          employer = {}, 
          financialYear = '2024-25', 
          parsedPart, 
          form16Stage 
      } = data || {};
      
      const isPartA = parsedPart === 'A' || form16Stage === 'PART_A_PARSED';
      const isPartB = parsedPart === 'B' || form16Stage === 'PART_B_PARSED' || form16Stage === 'CONSOLIDATED';

      // Safe formatter helper
      const fmt = (val) => {
          if (val === undefined || val === null || isNaN(Number(val))) return '0';
          return Number(val).toLocaleString('en-IN');
      };

      // 1. Success Messages & Header Logic
      let statusMsg = "Form 16 Parsed Successfully";
      let subMsg = `Review extracted data for FY ${financialYear}`;
      
      if (isPartA && !isPartB) {
          statusMsg = "Part A parsed successfully. Please upload Part B to continue.";
          subMsg = "TDS data extracted. Salary details hidden until Part B is uploaded.";
      } else if (isPartB) {
          statusMsg = "Part B parsed successfully. Review salary details below.";
          subMsg = "Consolidated view of Employer, TDS, and Salary.";
      }

      // 2. CTA Button Logic
      // If Part A only -> Primary is "Upload Part B"
      // If Part B -> Primary is "Proceed", Secondary is "Replace Part B" (reupload)
      
      const primaryActionText = !isPartB ? "Upload Part B" : "Proceed to Filing";
      const secondaryActionText = !isPartB ? null : "Replace Part B"; // User said HIDE "Upload Different File" for Part A
      
      // 3. Screen Rendering Rules
      // Part A: Show Employer, TDS. Hide Salary, Std Ded, Net Taxable.
      // Part B: Show All.

      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 border-b border-green-100 dark:border-green-800 flex items-center gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            <div>
               <h3 className="font-bold text-gray-900 dark:text-white">{statusMsg}</h3>
               <p className="text-sm text-gray-600 dark:text-gray-300">{subMsg}</p>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-8">
            {/* Employer Details (Always Visible) */}
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

            {/* TDS Details (Always Visible) */}
             <div>
               <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                  <FileText size={18} className="text-purple-500" /> TDS Summary
               </h4>
               <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-1">
                   {/* Note: In Part A, grossSalary might represent 'Amount Paid' */}
                  <InfoRow label="Total Amount Paid/Credited" value={`₹${fmt(data.extractedData?.grossSalary || data.grossSalary)}`} /> 
                  <InfoRow label="Total Tax Deducted" value={`₹${fmt(data.extractedData?.tdsDeducted || data.tdsDeducted || 0)}`} className="text-red-600 font-bold" />
               </div>
            </div>
            
            {/* Salary Details (Visible ONLY after Part B) */}
            {isPartB && (
            <div className="md:col-span-2">
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                  <FileText size={18} className="text-green-500" /> Salary Breakdown (Part B)
               </h4>
               <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 grid md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Accessing Flattened Data from Controller Response (extractedData or root data) */}
                    <InfoRow label="Gross Salary" value={`₹${fmt(data.extractedData?.grossSalary)}`} />
                    <InfoRow label="Exemptions u/s 10" value={`₹${fmt(data.extractedData?.exemptionsSection10)}`} />
                    <div className="col-span-2 my-2 border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                    <InfoRow label="Standard Deduction" value={`₹${fmt(data.extractedData?.standardDeduction)}`} />
                    <InfoRow label="Professional Tax" value={`₹${fmt(data.extractedData?.professionalTax)}`} />
                    <div className="col-span-2 my-2 border-t border-gray-300 dark:border-gray-600"></div>
                    <InfoRow label="Net Taxable Income" value={`₹${fmt(data.extractedData?.taxableSalary)}`} className="text-lg font-bold text-blue-600" />
               </div>
            </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
             {secondaryActionText && (
                <Button variant="outline" onClick={onReupload}>{secondaryActionText}</Button>
             )}
             
             {/* If Part A only, Primary Action is 'Upload Part B' which triggers re-upload flow */}
             <Button onClick={!isPartB ? onReupload : onConfirm} className="flex items-center gap-2">
                {primaryActionText} <ArrowRight size={18} />
             </Button>
          </div>
        </div>
      );
  } catch (err) {
      console.error("Form16Preview Render Error:", err);
      return (
          <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center">
              <p className="font-bold">Error displaying Form-16 preview.</p>
              <Button size="sm" variant="outline" onClick={onReupload} className="mt-4">Try different file</Button>
          </div>
      );
  }
};

export default Form16Preview;
