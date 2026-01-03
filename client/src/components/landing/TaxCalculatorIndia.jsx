import React, { useState } from 'react';
import { Download, Mail, Save, Share2, MessageCircle } from 'lucide-react';
import { calculateIncomeTax } from '../../utils/taxCalculations/india2024';

// ... (existing helper function)

const TaxCalculatorIndia = () => {
    // ... (existing state and logic)

    const [input, setInput] = useState({
        regime: 'new',
        income: 1200000,
        age: '<60',
        section80C: 150000,
        section80D: 25000,
        hra: 0,
        standardDeduction: 50000
    });

    const handleShare = (type) => {
        const text = `I calculated my tax on TaxSaas! Taxable Income: ₹${calculateIncomeTax(input).taxableIncome}. Check it out!`;
        if (type === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } else {
            alert(`${type} feature coming soon!`);
        }
    };

    // ... (existing render)



  const result = calculateIncomeTax(input);




  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Income Tax Calculator FY 2024-25</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Calculate under both tax regimes with actual deductions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Annual Income</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={input.income}
                  onChange={(e) => setInput({...input, income: parseInt(e.target.value) || 0})}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full pl-8 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter annual income"
                />
              </div>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Age Group</label>
              <select 
                value={input.age}
                onChange={(e) => setInput({...input, age: e.target.value})}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="<60">Below 60 years</option>
                <option value="60-80">60 to 80 years</option>
                <option value=">80">Above 80 years</option>
              </select>
            </div>
          </div>

          {/* Regime Toggle */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Select Tax Regime</span>
              <div className="flex bg-white dark:bg-gray-600 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-500">
                <button
                  onClick={() => setInput({...input, regime: 'old'})}
                  className={`px-6 py-2 rounded-md transition font-medium ${input.regime === 'old' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'}`}
                >
                  Old Regime
                </button>
                <button
                  onClick={() => setInput({...input, regime: 'new'})}
                  className={`px-6 py-2 rounded-md transition font-medium ${input.regime === 'new' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'}`}
                >
                  New Regime
                </button>
              </div>
            </div>
            
            <div className={`space-y-4 transition-opacity duration-300 ${input.regime === 'new' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Enter Deductions (Old Regime)</h4>
                    {input.regime === 'new' && <span className="text-xs text-orange-500 font-medium">Not applicable in New Regime</span>}
                </div>
                
                <DeductionInput
                  label="Section 80C (PPF, ELSS, EPF, etc.)"
                  value={input.section80C}
                  max={150000}
                  onChange={(val) => setInput({...input, section80C: val})}
                />
                <DeductionInput
                  label="Section 80D (Health Insurance)"
                  value={input.section80D}
                  max={100000}
                  onChange={(val) => setInput({...input, section80D: val})}
                />
                <DeductionInput
                  label="HRA Exemption"
                  value={input.hra}
                  max={300000}
                  onChange={(val) => setInput({...input, hra: val})}
                />
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl p-6 sticky top-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">Tax Breakdown</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-gray-600 dark:text-gray-400">Taxable Income</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{result.taxableIncome.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-gray-600 dark:text-gray-400">Income Tax</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{result.tax.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-gray-600 dark:text-gray-400">Cess (4%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{result.cess.toLocaleString('en-IN')}</span>
              </div>
              
              {result.surcharge > 0 && (
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                  <span className="text-orange-600">Surcharge</span>
                  <span className="font-semibold text-orange-600">₹{result.surcharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="flex justify-between pt-4 pb-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total Tax</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ₹{result.totalTax.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Recommendation */}
              {result.regimeRecommendation && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  result.regimeRecommendation.regime === 'new' 
                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                    : result.regimeRecommendation.regime === 'old'
                    ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {result.regimeRecommendation.savings > 0 ? '💡 Recommendation' : 'ℹ️ Info'}
                  </div>
                  <div className="text-sm leading-relaxed">{result.regimeRecommendation.message}</div>
                </div>
              )}
            </div>

            {/* CTA */}
            <button className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5">
              Start Filing ITR &rarr;
            </button>
            {/* Next Steps Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                    onClick={() => handleShare('PDF')}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                    <Download size={16} /> Download
                </button>
                <button 
                    onClick={() => handleShare('Email')}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                    <Mail size={16} /> Email
                </button>
                <button 
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-sm font-medium text-green-700 dark:text-green-300 transition-colors"
                >
                    <Share2 size={16} /> WhatsApp
                </button>
                 <button 
                    onClick={() => handleShare('Save')}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                    <Save size={16} /> Save
                </button>
            </div>
            
            <button 
                onClick={() => handleShare('CA Consultation')}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors"
            >
                <MessageCircle size={16} /> Talk to a CA about this
            </button>

            <p className="text-xs text-center text-gray-400 mt-3">100% Secure & ISO Certified</p>
          </div>
        </div>
      </div>
      
      {/* Comparison Table */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Old vs New Regime Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="p-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200">Feature</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200">Old Regime</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200">New Regime</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300">
              <tr>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">Standard Deduction</td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">₹50,000</td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">₹0</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">Section 80C</td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">₹1,50,000</td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">₹0</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">Tax Slabs</td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">4 slabs</td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700">6 slabs (lower rates)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculatorIndia;
