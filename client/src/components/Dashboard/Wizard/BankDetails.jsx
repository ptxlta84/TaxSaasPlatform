import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bankDetailsSchema } from '../../../schemas/itrSchemas';
import FormInput from '../../Form/FormInput';
import { Landmark, Info } from 'lucide-react';

const BankDetails = forwardRef(({ data, onChange }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: data
  });

  useImperativeHandle(ref, () => ({
    submit: () => {
      return new Promise((resolve, reject) => {
        handleSubmit(
          (validData) => {
            onChange(validData);
            resolve(true);
          },
          (errors) => {
            reject(errors);
          }
        )();
      });
    }
  }));

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bank Details</h2>
         <p className="text-gray-500 text-sm">Required for receiving tax refund directly.</p>
       </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
           <div className="flex gap-4 items-start mb-6 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded text-sm text-yellow-800 dark:text-yellow-200">
               <Info size={20} className="shrink-0" />
               <p>Ensure this bank account is linked with your PAN and pre-validated on the Income Tax Portal for faster refunds.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                   <div className="relative">
                        <Landmark className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <FormInput 
                            placeholder="e.g. SBIN0001234"
                            error={errors.ifscCode}
                            {...register('ifscCode')}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setValue('ifscCode', val);
                            }}
                            className="pl-10 uppercase"
                        />
                   </div>
               </div>
               
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                   <FormInput 
                        placeholder="State Bank of India"
                        error={errors.bankName}
                        {...register('bankName')}
                   />
               </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                   <FormInput 
                        type="password" 
                        error={errors.accountNumber}
                        {...register('accountNumber')}
                   />
               </div>
           </div>
       </div>
    </div>
  );
});

BankDetails.displayName = 'BankDetails';

export default BankDetails;
