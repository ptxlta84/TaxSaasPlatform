import React from 'react';
import { UploadCloud, FileSearch, Send, CheckCircle } from 'lucide-react';
import Container from '../Layout/Container';

const ProcessFlow = () => {
  const steps = [
    { 
      step: 1, 
      title: 'Upload Form 16', 
      desc: 'Auto-reads your tax details securely',
      icon: UploadCloud,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      step: 2, 
      title: 'Review & Optimize', 
      desc: 'AI suggests maximum deductions',
      icon: FileSearch,
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      step: 3, 
      title: 'E-Verify & File', 
      desc: 'File directly to the IT Department portal',
      icon: Send,
      color: 'bg-indigo-100 text-indigo-600'
    },
    { 
      step: 4, 
      title: 'Track Refund', 
      desc: 'Real-time status updates via WhatsApp',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">How TaxSaas Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">File your secure ITR in 4 simple steps</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>

          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110 ${item.color}`}>
                  <Icon size={32} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Step 0{item.step}</div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default ProcessFlow;
