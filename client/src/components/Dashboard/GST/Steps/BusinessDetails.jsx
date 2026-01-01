import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../../Button/Button';
import { ChevronRight } from 'lucide-react';

const BusinessDetails = ({ formData, updateFormData, onNext }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: formData
    });

    const onSubmit = (data) => {
        updateFormData(data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Business Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Name of Business (as per PAN)</label>
                    <input 
                        {...register('legalName', { required: 'Legal Name is required' })}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Legal Name"
                    />
                    {errors.legalName && <p className="text-red-500 text-xs mt-1">{errors.legalName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade Name (Optional)</label>
                    <input 
                        {...register('tradeName')}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. My Shop"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Constitution of Business</label>
                    <select 
                        {...register('businessType', { required: 'Select business type' })}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Type</option>
                        <option value="proprietorship">Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="llp">Limited Liability Partnership</option>
                        <option value="private_limited">Private Limited Company</option>
                        <option value="public_limited">Public Limited Company</option>
                    </select>
                    {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                    <input 
                        {...register('panNumber', { 
                            required: 'PAN is required',
                            pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN Format' }
                        })}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 uppercase"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                    />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 pt-4">Principal Place of Business</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input 
                        {...register('principalAddress.addressLine1', { required: 'Address is required' })}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        placeholder="Flat/Door/Block No., Building Name"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                    <input 
                        {...register('principalAddress.pincode', { required: 'Pincode is required' })}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        placeholder="110001"
                        maxLength={6}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                    <select 
                        {...register('principalAddress.state', { required: 'State is required' })}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                         <option value="">Select State</option>
                         <option value="DL">Delhi</option>
                         <option value="MH">Maharashtra</option>
                         <option value="KA">Karnataka</option>
                         <option value="TN">Tamil Nadu</option>
                         {/* Add more states */}
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit">
                    Save & Next <ChevronRight size={16} />
                </Button>
            </div>
        </form>
    );
};

export default BusinessDetails;
