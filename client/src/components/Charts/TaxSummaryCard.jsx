import React from 'react';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const TaxSummaryCard = ({ data }) => {
  if (!data) return null;

  const { taxLiability, taxAlreadyPaid, netPayable, refundDue } = data;
  const isRefund = refundDue > 0;

  return (
    <div className={`rounded-xl p-6 shadow-lg border-2 ${isRefund ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
            {isRefund ? 'Refund Due' : 'Net Tax Payable'}
          </p>
          <h2 className={`text-4xl font-bold ${isRefund ? 'text-green-700' : 'text-red-700'}`}>
            ₹ {isRefund ? refundDue.toLocaleString() : netPayable.toLocaleString()}
          </h2>
        </div>
        <div className={`p-3 rounded-full ${isRefund ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
           {isRefund ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          <div>
              <p className="text-xs text-gray-500">Total Tax Liability</p>
              <p className="font-semibold text-gray-800">₹ {taxLiability.toLocaleString()}</p>
          </div>
          <div>
              <p className="text-xs text-gray-500">Taxes Paid (TDS/Advance)</p>
              <p className="font-semibold text-gray-800">₹ {taxAlreadyPaid.toLocaleString()}</p>
          </div>
      </div>
          
      <div className="mt-4 flex items-center gap-2 text-sm">
          {isRefund ? (
             <span className="text-green-700 flex items-center gap-1"><CheckCircle size={16} /> Eligible for refund to bank account</span>
          ) : (
             <span className="text-red-700 flex items-center gap-1"><AlertCircle size={16} /> Payment required by 31st July</span>
          )}
      </div>
    </div>
  );
};

export default TaxSummaryCard;
