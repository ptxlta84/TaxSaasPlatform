import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deductionsSchema } from '../../../schemas/itrSchemas';
import FormInput from '../../Form/FormInput';
import { Shield, Home, BookOpen, Heart } from 'lucide-react';

const Deductions = forwardRef(({ data, onChange }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(deductionsSchema),
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
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Claim Deductions</h2>
         <p className="text-gray-500 text-sm">Maximize your refund by claiming eligible deductions.</p>
       </div>

       <div className="grid gap-4">
           {/* 80C */}
           <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Shield size={24} /></div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">Section 80C</h3>
                    <p className="text-xs text-gray-500">LIC, PPF, EPF, ELSS, Tuition Fees (Max ₹1.5L)</p>
                </div>
                <div className="w-full md:w-48">
                    <FormInput
                        type="number"
                        placeholder="0"
                        error={errors.section80C}
                        {...register('section80C', { valueAsNumber: true })}
                        className="text-right"
                    />
                </div>
           </div>

           {/* 80D */}
           <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="bg-red-100 p-3 rounded-full text-red-600"><Heart size={24} /></div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">Section 80D</h3>
                    <p className="text-xs text-gray-500">Health Insurance Premium (Self & Parents)</p>
                </div>
                <div className="w-full md:w-48">
                    <FormInput
                        type="number"
                        placeholder="0"
                        error={errors.section80D}
                        {...register('section80D', { valueAsNumber: true })}
                        className="text-right"
                    />
                </div>
           </div>

           {/* HRA */}
           <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Home size={24} /></div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">HRA Exemption</h3>
                    <p className="text-xs text-gray-500">House Rent Allowance (Calculated based on rent paid)</p>
                </div>
                <div className="w-full md:w-48">
                    <FormInput
                        type="number"
                        placeholder="0"
                        error={errors.hra}
                        {...register('hra', { valueAsNumber: true })}
                        className="text-right"
                    />
                </div>
           </div>
       </div>
    </div>
  );
});

Deductions.displayName = 'Deductions';

export default Deductions;
