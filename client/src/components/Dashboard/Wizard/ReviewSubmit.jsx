import React, { useState } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { itrService } from '../../../services/itrService';
import Button from '../../Button/Button';

const ReviewSubmit = ({ itrId }) => {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ackNum, setAckNum] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
      setLoading(true);
      try {
          const res = await itrService.submitITR(itrId);
          setAckNum(res.acknowledgementNumber);
          setSubmitted(true);
      } catch (err) {
          console.error(err);
          alert("Submission failed");
      } finally {
          setLoading(false);
      }
  };

  if (submitted) {
      return (
          <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} strokeWidth={4} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Filing Successful!</h2>
              <p className="text-gray-600 mb-8">Your return has been successfully filed/e-verified.</p>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg inline-block text-left">
                  <p className="text-xs text-gray-500 uppercase">Acknowledgement Number</p>
                  <p className="text-xl font-mono font-bold tracking-wider">{ackNum}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Review & E-Verify</h2>
         <p className="text-gray-500 text-sm">Please verify the declaration below to complete filing.</p>
       </div>

       <div className="bg-white dark:bg-gray-800 border-2 border-green-500/20 p-6 rounded-xl">
           <div className="flex items-start gap-4">
               <input 
                 type="checkbox" 
                 id="declare"
                 checked={agreed}
                 onChange={(e) => setAgreed(e.target.checked)}
                 className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
               />
               <label htmlFor="declare" className="text-sm text-gray-700 dark:text-gray-300">
                   I, <strong>[User Name]</strong>, son/daughter of <strong>[Father's Name]</strong>, solemnly declare that to the best of my knowledge and belief, the information given in the return and the schedules thereto is correct and complete and is in accordance with the provisions of the Income-tax Act, 1961.
               </label>
           </div>
       </div>

       <div className="flex justify-center pt-4">
           {!agreed && <p className="text-xs text-red-500 mb-2">Please accept declaration to proceed</p>}
       </div>

       <div className="text-center">
            <Button 
                onClick={handleSubmit} 
                disabled={!agreed} 
                isLoading={loading}
                className="w-full sm:w-auto px-8 py-4 text-lg bg-green-600 hover:bg-green-700"
            >
                <ShieldCheck className="mr-2" /> E-Verify & Submit ITR
            </Button>
       </div>
    </div>
  );
};

export default ReviewSubmit;
