import React from 'react';
import { FileText, CheckCircle, Info } from 'lucide-react';

const ITRFormSelector = ({ selectedForm, onSelect, userType }) => {
  const forms = [
    {
      id: 'ITR-1',
      title: 'ITR-1 (Sahaj)',
      desc: 'For salaried individuals, one house property, other sources.',
      rec: userType === 'salaried'
    },
    {
      id: 'ITR-2',
      title: 'ITR-2',
      desc: 'For capital gains, foreign assets, more than one house property.',
      rec: false
    },
    {
      id: 'ITR-3',
      title: 'ITR-3',
      desc: 'For individuals/HUF having income from business/profession.',
      rec: userType === 'business'
    },
    {
      id: 'ITR-4',
      title: 'ITR-4 (Sugam)',
      desc: 'For presumptive income from business/profession.',
      rec: false
    }
  ];

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select ITR Form</h2>
         <p className="text-gray-500 text-sm">Based on your profile, we have a recommendation for you.</p>
       </div>

       <div className="grid md:grid-cols-2 gap-4">
         {forms.map((form) => (
           <div 
             key={form.id}
             onClick={() => onSelect(form.id)}
             className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
               selectedForm === form.id 
                 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                 : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
             }`}
           >
             {form.rec && (
               <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                 Recommended
               </span>
             )}
             <div className="flex items-start justify-between mb-2">
               <div className="flex items-center gap-2">
                 <FileText className={selectedForm === form.id ? 'text-blue-600' : 'text-gray-400'} size={20} />
                 <h3 className="font-bold text-gray-900 dark:text-white">{form.title}</h3>
               </div>
               {selectedForm === form.id && <CheckCircle className="text-blue-600" size={20} />}
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400">{form.desc}</p>
           </div>
         ))}
       </div>
    </div>
  );
};

export default ITRFormSelector;
