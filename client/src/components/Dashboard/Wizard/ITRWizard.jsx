import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { itrService } from '../../../services/itrService';
import Button from '../../Button/Button';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import ITRFormSelector from './ITRFormSelector';
import IncomeDetails from './IncomeDetails';
// Will import other steps as we create them

const ITRWizard = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [itrId, setItrId] = useState(null);
  const formRef = React.useRef(); // Ref for child form validation
  
  // Filing Data State
  const [formData, setFormData] = useState({
    itrForm: 'ITR-1',
    income: { salary: { gross: 0, net: 0 }, otherSources: 0 },
    deductions: { section80C: 0, section80D: 0, hra: 0 },
    regime: 'new'
  });

  // Init Wizard
  useEffect(() => {
    const initFiling = async () => {
      try {
        setLoading(true);
        const data = await itrService.startFiling('2024-2025');
        setItrId(data._id);
        
        // Load saved state (simplified mapping)
        if (data.status !== 'draft') {
            setFormData({
                itrForm: data.itrForm,
                income: data.income,
                deductions: data.deductions,
                regime: data.regime
            });
        }
      } catch (err) {
        console.error("Failed to start filing", err);
      } finally {
        setLoading(false);
      }
    };
    initFiling();
  }, []);

  const handleNext = async () => {
    if (loading) return;

    // Trigger validation on child component if it supports it
    if (formRef.current && formRef.current.submit) {
        try {
            await formRef.current.submit(); // Will throw if validation fails
        } catch (validationErrors) {
            console.log('Validation Failed', validationErrors);
            return; // Stop if validation fails
        }
    }

    setLoading(true);
    try {
        // Save Active Step Data
        await itrService.updateITR(itrId, formData);
        setCurrentStep(prev => prev + 1);
    } catch (err) {
        console.error('Save failed', err);
    } finally {
        setLoading(false);
    }
  };

  const steps = [
      { id: 1, title: 'Selection', component: <ITRFormSelector selectedForm={formData.itrForm} onSelect={(f) => setFormData({...formData, itrForm: f})} userType={user?.userType} /> },
      { id: 2, title: 'Income', component: <IncomeDetails ref={formRef} data={formData.income} onChange={(d) => setFormData({...formData, income: d})} /> },
      { id: 3, title: 'Deductions', component: <Deductions ref={formRef} data={formData.deductions} onChange={(d) => setFormData({...formData, deductions: d})} /> },
      { id: 4, title: 'Taxes', component: <TaxCalculation itrId={itrId} /> },
      { id: 5, title: 'Bank', component: <BankDetails ref={formRef} data={formData.bankDetails || {}} onChange={(d) => setFormData({...formData, bankDetails: d})} /> },
      { id: 6, title: 'Verify', component: <ReviewSubmit itrId={itrId} /> }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
            {steps.map((step) => (
                <div key={step.id} className={`flex flex-col items-center w-1/6 relative ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-all
                        ${step.id < currentStep ? 'bg-blue-600 text-white' : 
                          step.id === currentStep ? 'bg-white border-2 border-blue-600 text-blue-600' : 
                          'bg-gray-100 text-gray-400'}`}>
                        {step.id < currentStep ? <CheckCircle size={16} /> : step.id}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
            ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full relative overflow-hidden">
             <div 
                className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
             ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">
          {loading && !itrId ? (
              <div className="flex h-64 items-center justify-center">Loading Wizard...</div>
          ) : (
              steps[currentStep - 1].component
          )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-20 md:pl-64">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
             <Button 
                variant="outline" 
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => prev - 1)}
             >
                <ArrowLeft size={16} className="mr-2" /> Back
             </Button>
             
             <div className="flex gap-3">
                 <Button variant="outline" className="hidden sm:flex" onClick={() => itrService.updateITR(itrId, formData)}>
                    <Save size={16} className="mr-2" /> Save Draft
                 </Button>
                 <Button onClick={handleNext} isLoading={loading}>
                    {currentStep === 6 ? 'Submit Return' : 'Next Step'} <ArrowRight size={16} className="ml-2" />
                 </Button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default ITRWizard;
