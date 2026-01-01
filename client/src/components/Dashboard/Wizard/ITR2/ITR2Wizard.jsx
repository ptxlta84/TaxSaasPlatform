import React, { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Save, PieChart, Home, Globe } from 'lucide-react';
import Button from '../../../Button/Button';
import IncomeSourcesSelector from './ITR2Steps/IncomeSourcesSelector';
import ITR2Review from './ITR2Steps/ITR2Review';
import ForeignAssetsReporting from '../../Tools/ForeignAssetsReporting';

const ITR2Wizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        selectedSources: { foreignAssets: false },
        foreignAssets: {}
    });

    const updateSection = (section, data) => {
        setFormData(prev => ({ ...prev, [section]: data }));
    };

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);

    const getSteps = () => {
        const steps = [
             { id: 1, label: 'Personal Details', component: <div>Personal Details Placeholder</div> },
             { id: 2, label: 'Income Sources', component: null }
        ];
    
        if (formData.selectedSources.foreignAssets) {
            steps.push({ id: 6, label: 'Foreign Assets', component: <ForeignAssetsReporting data={formData.foreignAssets} updateData={(d) => updateSection('foreignAssets', d)} /> });
        }
        
        steps.push({ id: 99, label: 'Review & File', component: <ITR2Review formData={formData} /> });
        
        return steps;
    };

    const steps = getSteps();
    const currentStepObj = steps[currentStep - 1] || steps[0]; // Logic to map index to existing step

    // We need to map linear index (1,2,3...) to the dynamic array
    // A simple way is to render based on the step array index
    const activeStepIndex = currentStep - 1;
    const activeStep = steps[activeStepIndex];

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ITR-2 Filing Wizard (AY 2024-25)</h1>
                    <p className="text-gray-500">For Individuals with Capital Gains, Foreign Assets, or &gt;1 House Property</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Save}>Save Draft</Button>
                </div>
            </div>

            {/* Stepper */}
             <div className="mb-8 overflow-x-auto">
                <div className="flex items-center min-w-max">
                    {steps.map((s, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${activeStepIndex === idx ? 'border-blue-500 bg-blue-50 text-blue-700' : activeStepIndex > idx ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${activeStepIndex === idx ? 'bg-blue-600 text-white' : activeStepIndex > idx ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {activeStepIndex > idx ? <CheckCircle size={14}/> : idx + 1}
                                </span>
                                <span className="text-sm font-medium">{s.label}</span>
                            </div>
                            {idx < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-2"></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
                {activeStepIndex === 0 && (
                    <div className="p-8">
                        <h3 className="text-lg font-bold mb-4">Confirm Personal Details</h3>
                        <p>Name: User Name</p>
                        <p>PAN: ABCDE1234F 🔥</p>
                        <Button className="mt-4" onClick={handleNext}>Confirm & Proceed</Button>
                    </div>
                )}

                {activeStepIndex === 1 && (
                    <IncomeSourcesSelector 
                        selected={formData.selectedSources} 
                        onChange={(d) => updateSection('selectedSources', d)}
                        onNext={handleNext}
                    />
                )}

                {activeStepIndex > 1 && (
                     <div className="p-4">
                        {activeStep.component}
                     </div>
                )}
            </div>

            {/* Footer Navigation */}
             <div className="flex justify-between mt-6">
                <Button 
                    variant="outline" 
                    onClick={handleBack} 
                    disabled={activeStepIndex === 0}
                    icon={ChevronLeft}
                >
                    Back
                </Button>

                {activeStepIndex > 1 && activeStepIndex < steps.length - 1 && (
                    <Button onClick={handleNext}>
                        Save & Next <ChevronRight size={16} />
                    </Button>
                )}
             </div>
        </div>
    );
};

export default ITR2Wizard;
