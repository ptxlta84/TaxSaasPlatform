import React from 'react';
import { Users, FileCheck, PieChart, Shield } from 'lucide-react';
import Container from '../Layout/Container';

const CAToolkit = () => {
  const features = [
    {
      title: 'Client Management',
      desc: 'Manage unlimited clients with a single dashboard.',
      icon: Users,
    },
    {
      title: 'Bulk Filing Utility',
      desc: 'Upload Excel/JSON to file 100+ returns in minutes.',
      icon: FileCheck,
    },
    {
      title: 'Practice Analytics',
      desc: 'Track filing status, fees collected, and pending audits.',
      icon: PieChart,
    },
    {
      title: 'Audit Compliance',
      desc: 'Automated 26AS matching and discrepancy highlighter.',
      icon: Shield,
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[128px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold mb-6 border border-amber-500/30">
              FOR CHARTERED ACCOUNTANTS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Supercharge your <span className="text-amber-400">Tax Practice</span> with AI
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Join 50,000+ CAs using TaxSaas Pro. Automated client communication, document collection, and error-free filing allowing you to scale your practice 10x.
            </p>
            
            <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-amber-500/20">
              Get TaxSaas Pro Demo
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-amber-500/50 transition-colors group">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CAToolkit;
