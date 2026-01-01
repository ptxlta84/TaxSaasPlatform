import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeSchema } from '../../../schemas/itrSchemas';
import FormInput from '../../Form/FormInput';
import { BadgeIndianRupee } from 'lucide-react';

const IncomeDetails = forwardRef(({ data, onChange }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: data
  });

  // Expose submit method to parent
  useImperativeHandle(ref, () => ({
    submit: () => {
      return new Promise((resolve, reject) => {
        handleSubmit(
          (validData) => {
            onChange(validData);
            resolve(true); // Validation success
          },
          (errors) => {
            reject(errors); // Validation failed
          }
        )();
      });
    }
  }));

  // Sync external data changes if any (optional, but good for wizard back/forth)
  useEffect(() => {
    reset(data);
  }, [data, reset]);

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Income Details</h2>
         <p className="text-gray-500 text-sm">Verify your income from all sources.</p>
       </div>

       {/* Salary Income */}
       <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 flex items-center gap-2">
            <BadgeIndianRupee size={18} /> Income from Salary
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                label="Gross Salary"
                type="number"
                placeholder="0"
                error={errors.salary?.gross}
                {...register('salary.gross', { valueAsNumber: true })}
              />
              <FormInput
                label="Net Taxable Salary"
                type="number"
                placeholder="0"
                error={errors.salary?.net}
                {...register('salary.net', { valueAsNumber: true })}
              />
          </div>
       </div>

       {/* Other Sources */}
       <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Other Income Sources</h3>
          <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                label="Interest from Savings/FD"
                type="number"
                placeholder="0"
                error={errors.otherSources}
                {...register('otherSources', { valueAsNumber: true })}
              />
              <FormInput
                label="Income from House Property"
                type="number"
                placeholder="0"
                error={errors.houseProperty}
                {...register('houseProperty', { valueAsNumber: true })}
              />
          </div>
       </div>
    </div>
  );
});

IncomeDetails.displayName = 'IncomeDetails';

export default IncomeDetails;
