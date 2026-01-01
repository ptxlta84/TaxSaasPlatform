import React from 'react';
import { DollarSign, Home, PieChart, Globe, Briefcase, ChevronRight } from 'lucide-react';
import Button from '../../../../Button/Button';

const IncomeSourcesSelector = ({ selected, onChange, onNext }) => {
    
    const toggleSource = (key) => {
        onChange({ ...selected, [key]: !selected[key] });
    };

    const sources = [
        { key: 'salary', label: 'Salary / Pension', icon: DollarSign, desc: 'Form 16, Salary Slips' },
        { key: 'houseProperty', label: 'House Property', icon: Home, desc: 'Rent, Home Loan Interest' },
        { key: 'capitalGains', label: 'Capital Gains', icon: PieChart, desc: 'Stocks, Mutual Funds, Property Sale' },
        { key: 'foreignAssets', label: 'Foreign Assets', icon: Globe, desc: 'Foreign Stocks, Bank Accounts (Schedule FA)' },
        { key: 'business', label: 'Business / Profession', icon: Briefcase, desc: 'Freelancing, Presumptive Income' },
        // { key: 'otherSources', label: 'Other Sources', icon: MoreHorizontal, desc: 'Interest, Dividend' }
    ];

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select Your Income Sources</h2>
            <p className="text-gray-500 mb-6">We will customize the wizard based on your selection.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {sources.map((source) => (
                    <div 
                        key={source.key}
                        onClick={() => toggleSource(source.key)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-3
                            ${selected[source.key] ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                        <div className={`p-2 rounded-lg w-fit ${selected[source.key] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <source.icon size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${selected[source.key] ? 'text-blue-800 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                {source.label}
                            </h3>
                            <p className="text-xs text-gray-500">{source.desc}</p>
                        </div>
                        <div className="mt-auto pt-2 flex justify-end">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected[source.key] ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                {selected[source.key] && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={onNext}>
                    Next Step <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export default IncomeSourcesSelector;
