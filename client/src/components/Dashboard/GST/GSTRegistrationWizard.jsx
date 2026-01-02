import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import Button from '../../Button/Button';
import { gstService } from '../../../services/gstService';
import BusinessDetails from './Steps/BusinessDetails';
import PromoterDetails from './Steps/PromoterDetails';
// import BankDetails from './Steps/BankDetails';
// import DocumentsUpload from './Steps/DocumentsUpload';
// import ReviewSubmit from './Steps/ReviewSubmit';

const GSTRegistrationWizard = () => {
    // const navigate = useNavigate(); // Removed unused
    const [activeStep, setActiveStep] = useState(0);
    // const [loading, setLoading] = useState(false); // Removed unused
    const [formData, setFormData] = useState({
        legalName: '',
        tradeName: '',
        businessType: '',
        panNumber: '',
        gstin: '', // Optional/Pre-allotted
        principalAddress: { addressLine1: '', city: '', state: '', pincode: '' },
        promoters: [],
        bankDetails: {},
        documents: {}
    });

    const updateFormData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSaveDraft = async () => {
        try {
            await gstService.register(formData);
            alert('Draft Saved Successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to save draft');
        }
    };

    const steps = [
        { id: 1, label: 'Business Details' },
        { id: 2, label: 'Partners/Promoters' },
        { id: 3, label: 'Bank Info' },
        { id: 4, label: 'Documents' },
        { id: 5, label: 'Review' }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New GST Registration</h1>
                    <p className="text-gray-500">Application for Normal Taxpayer</p>
                </div>
                <Button variant="outline" onClick={handleSaveDraft} icon={Save}>Save Draft</Button>
            </div>

            {/* Progress Stepper */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex items-center min-w-max">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${step === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : step > s.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${step === s.id ? 'bg-blue-600 text-white' : step > s.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s.id ? <CheckCircle size={14}/> : s.id}
                                </span>
                                <span className="text-sm font-medium">{s.label}</span>
                            </div>
                            {idx < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-2"></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                {step === 1 && <BusinessDetails formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
                {step === 2 && <PromoterDetails formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {step === 3 && <div className="p-10 text-center">Bank Details Component (Coming Soon) <br/><Button onClick={handleNext}>Next (Dev Skip)</Button></div>}
                {step === 4 && <div className="p-10 text-center">Documents Upload Component (Coming Soon) <br/><Button onClick={handleNext}>Next (Dev Skip)</Button></div>}
                {step === 5 && <div className="p-10 text-center">Review & Submit Component (Coming Soon)</div>}
            </div>

            {/* Navigation Footer (if not handled in sub-components) */}
            {step > 1 && (
                 <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} icon={ChevronLeft}>Back</Button>
                 </div>
            )}
        </div>
    );
};

export default GSTRegistrationWizard;
