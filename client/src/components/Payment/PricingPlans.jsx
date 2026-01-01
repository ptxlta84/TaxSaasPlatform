import React from 'react';
import { Check } from 'lucide-react';
import Button from '../Button/Button';

const plans = [
  {
    id: 'basic',
    name: 'Basic Filing',
    price: 499,
    description: 'Perfect for salaried individuals with simple returns.',
    features: ['ITR-1 & ITR-2 Filing', 'Pre-filled from Form 16', 'Email Support', 'Basic Tax Summary']
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1999,
    description: 'For freelancers, consultants, and capital gains.',
    features: ['ITR-3 & ITR-4 Filing', 'Capital Gains Import', 'Deduction Optimizer', 'Priority Email Support']
  },
  {
    id: 'business',
    name: 'Business & Audit',
    price: 4999,
    description: 'Complete solution for small businesses requiring audit.',
    features: ['Balance Sheet & P&L', 'Audit Report Filing', 'Dedicated CA Support', 'GST Reconcilliation']
  }
];

const PricingPlans = ({ onSelect, processing }) => {
  return (
    <div className="py-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Choose Your Filing Plan</h2>
      <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">Select the plan that best fits your income sources. All plans include secure filing and maximum refund assurance.</p>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 ${plan.id === 'professional' ? 'border-blue-500 relative' : 'border-transparent'}`}>
            {plan.id === 'professional' && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                <span className="text-gray-500 ml-2">/ year</span>
              </div>
              <Button 
                className="w-full mb-6" 
                variant={plan.id === 'professional' ? 'primary' : 'outline'}
                onClick={() => onSelect(plan)}
                isLoading={processing === plan.id}
                disabled={!!processing}
              >
                Choose {plan.name}
              </Button>
              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="text-green-500 mr-2 shrink-0" size={18} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;
