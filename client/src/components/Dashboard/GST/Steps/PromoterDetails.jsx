import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Button from '../../../Button/Button';
import { ChevronRight, ChevronLeft, Plus, Trash } from 'lucide-react';

const PromoterDetails = ({ formData, updateFormData, onNext, onBack }) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            promoters: formData.promoters.length > 0 ? formData.promoters : [{ name: '', designation: '', pan: '', mobile: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "promoters"
    });

    const onSubmit = (data) => {
        updateFormData(data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promoters / Partners Details</h3>
                <Button type="button" size="sm" variant="outline" onClick={() => append({ name: '', designation: '', pan: '', mobile: '' })} icon={Plus}>
                    Add Promoter
                </Button>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                        {fields.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <Trash size={16} />
                            </button>
                        )}
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Promoter #{index + 1}</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input 
                                    {...register(`promoters.${index}.name`, { required: 'Name is required' })}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                                <select 
                                    {...register(`promoters.${index}.designation`, { required: 'Designation is required' })}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Select</option>
                                    <option value="Proprietor">Proprietor</option>
                                    <option value="Partner">Partner</option>
                                    <option value="Director">Director</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                                <input 
                                    {...register(`promoters.${index}.pan`, { 
                                        required: 'PAN is required',
                                        pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid Format' }
                                    })}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 uppercase"
                                    placeholder="PAN Number"
                                    maxLength={10}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                                <input 
                                    {...register(`promoters.${index}.mobile`, { 
                                        required: 'Mobile is required',
                                        pattern: { value: /^[0-9]{10}$/, message: 'Invalid Number' }
                                    })}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="9876543210"
                                    maxLength={10}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack} icon={ChevronLeft}>Back</Button>
                <Button type="submit">
                    Save & Next <ChevronRight size={16} />
                </Button>
            </div>
        </form>
    );
};

export default PromoterDetails;
