import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Globe, FileStack, ArrowRight } from 'lucide-react';
import Button from '../Button/Button';
import Container from '../Layout/Container';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeUserType, setActiveUserType] = useState('salaried');

  // ... (rest of the file until the return statement)



  const userTypes = [
    { id: 'salaried', label: 'Salaried Employee', icon: Briefcase },
    { id: 'business', label: 'Business Owner', icon: Building2 },
    { id: 'nri', label: 'NRI', icon: Globe },
    { id: 'ca', label: 'Chartered Accountant', icon: FileStack }
  ];

  const content = {
    salaried: {
      headline: "File Income Tax Returns in 10 Minutes",
      subhead: "Maximum Refund | 100% Accuracy Guarantee",
      cta: "File ITR Now"
    },
    business: {
      headline: "GST & Income Tax for Business",
      subhead: "Seamless Invoicing, Filing & Compliance",
      cta: "Start for Free"
    },
    nri: {
      headline: "Simplifying Taxes for NRIs",
      subhead: "Expert Assisted Filing for Global Indians",
      cta: "Consult Expert"
    },
    ca: {
      headline: "Tax Practice Management Software",
      subhead: "Manage Clients, Returns & Audits in one place",
      cta: "Book Demo"
    }
  };

  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/10 blur-3xl animate-pulse delay-700"></div>
      </div>

      <Container>
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-8 dark:bg-green-900 dark:text-green-100">
            <span>🛡️ Trusted by 5M+ Taxpayers</span>
          </div>

          {/* User Type Tabs with Glassmorphism */}
          <div className="inline-flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-lg mb-12 ring-1 ring-black/5">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeUserType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveUserType(type.id)}
                  className={`flex items-center gap-2 px-5 md:px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap outline-none
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 translate-y-[-1px]' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'opacity-70 group-hover:opacity-100'} />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              {content[activeUserType].headline}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {content[activeUserType].subhead}
            </p>
            
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="shadow-xl shadow-primary-500/20" onClick={() => navigate('/register')}>
                {content[activeUserType].cta} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/login')}>
                Calculate {activeUserType === 'business' ? 'GST' : 'Tax'}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
