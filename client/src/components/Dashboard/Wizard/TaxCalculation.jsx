import React, { useEffect, useState } from 'react';
import { itrService } from '../../../services/itrService';
import { RefreshCw, Download, Lock } from 'lucide-react';
import Button from '../../Button/Button';
import TaxSummaryCard from '../../Charts/TaxSummaryCard';
import IncomePieChart from '../../Charts/IncomePieChart';
import DeductionBarChart from '../../Charts/DeductionBarChart';
import PaymentModal from '../../Payment/PaymentModal';

const TaxCalculation = ({ itrId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if(itrId) triggerCalculation();
  }, [itrId]);

  const triggerCalculation = async () => {
    setLoading(true);
    try {
        const calcRes = await itrService.calculateTax(itrId); // Receive full ITR object or calculation
        setIsPaid(calcRes.paymentStatus === 'paid'); // Assuming status is returned

        // If simple calculation return, we might need to re-fetch ITR or rely on a property
        // For now, let's assume getSummary also returns payment status or we check separately if needed.
        // Actually, let's trust the calculate response if it includes full ITR or check summary.
        
        const data = await itrService.getSummary(itrId);
        setSummary(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = (type) => {
      if (!isPaid) {
          setShowPayment(true);
          return;
      }
      itrService.downloadReport(itrId, type);
  }

  if (loading) return <div className="p-10 text-center">Calculating your taxes based on provided data...</div>;
  if (!summary) return <div className="p-10 text-center text-red-500">Calculation not available</div>;

  return (
    <div className="space-y-8 relative">
       {/* Payment Modal */}
       <PaymentModal 
          isOpen={showPayment} 
          onClose={() => setShowPayment(false)} 
          itrId={itrId}
          onPaymentSuccess={() => {
              setIsPaid(true); 
              setShowPayment(false);
          }}
       />

       <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tax Analysis</h2>
            <p className="text-gray-500 text-sm">Visual breakdown of your tax liability.</p>
         </div>
         <div className="flex gap-2">
             <Button variant={isPaid ? "outline" : "primary"} size="sm" onClick={() => handleDownload('pdf')}>
                {isPaid ? <Download size={14} className="mr-2"/> : <Lock size={14} className="mr-2"/>}
                {isPaid ? 'Report' : 'Unlock Report'}
             </Button>
             <Button variant="outline" size="sm" onClick={() => handleDownload('excel')}>
                {isPaid ? <Download size={14} className="mr-2"/> : <Lock size={14} className="mr-2"/>}
                Excel
             </Button>
             <Button variant="outline" size="sm" onClick={triggerCalculation}>
                <RefreshCw size={14} className="mr-2"/> Recalculate
             </Button>
         </div>
       </div>

       <TaxSummaryCard data={summary} />

       <div className="grid md:grid-cols-2 gap-6">
           <IncomePieChart data={summary.breakdown.incomeSources} />
           <DeductionBarChart data={summary.breakdown.deductions} />
       </div>
    </div>
  );
};

export default TaxCalculation;
