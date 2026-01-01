import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Clock, ChevronRight, File, ArrowRight } from 'lucide-react';
import { calculateIncomeTax }  from '../../../utils/taxCalculations/india2024';
import { taxService } from '../../../services/taxService';
import Button from '../../Button/Button';
import FormInput from '../../Form/FormInput';

const IncomeTaxCalculatorDashboard = () => {
  const [input, setInput] = useState({
    regime: 'new',
    income: 1200000,
    age: '<60',
    section80C: 150000,
    section80D: 25000,
    hra: 0
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Initial Calculation
  useEffect(() => {
    const res = calculateIncomeTax({ ...input, standardDeduction: 50000 });
    setResult(res);
  }, [input]);

  // Fetch History
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await taxService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      await taxService.saveCalculation({
        income: input.income,
        ageGroup: input.age,
        deductions: {
            section80C: input.section80C,
            section80D: input.section80D,
            hra: input.hra
        },
        regime: input.regime,
        calculatedResult: result // Saving the frontend result directly as per controller design
      });
      await loadHistory(); // Refresh history
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const loadScenario = (savedItem) => {
    setInput({
        regime: savedItem.inputs.regime,
        income: savedItem.inputs.income,
        age: savedItem.inputs.ageGroup,
        section80C: savedItem.inputs.deductions.section80C,
        section80D: savedItem.inputs.deductions.section80D,
        hra: savedItem.inputs.deductions.hra
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Calculator Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tax Calculator (FY 24-25)</h2>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setInput({...input, regime: 'old'})}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition ${input.regime === 'old' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Old Method
                    </button>
                    <button 
                         onClick={() => setInput({...input, regime: 'new'})}
                         className={`px-3 py-1 text-sm font-medium rounded-md transition ${input.regime === 'new' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        New Method
                    </button>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Income</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        <input 
                            type="number" 
                            value={input.income}
                            onChange={e => setInput({...input, income: Number(e.target.value)})}
                            className="w-full pl-8 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                     </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
                     <select 
                        value={input.age}
                        onChange={e => setInput({...input, age: e.target.value})}
                        className="w-full py-2 px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                     >
                        <option value="<60">Below 60</option>
                        <option value="60-80">60 - 80</option>
                        <option value=">80">Above 80</option>
                     </select>
                </div>
             </div>

            {/* Deductions (conditionally disabled for new regime visual cue, though technically some allowed) */}
            <div className={`space-y-4 border-t pt-4 ${input.regime === 'new' ? 'opacity-50 grayscale' : ''}`}>
                 <h3 className="font-medium text-gray-900 dark:text-white">Deductions (Old Regime)</h3>
                 <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">80C (LIC/PPF)</label>
                        <input 
                            type="number" 
                            disabled={input.regime === 'new'}
                            value={input.section80C}
                            onChange={e => setInput({...input, section80C: Number(e.target.value)})}
                            className="w-full mt-1 py-1.5 px-3 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">80D (Health)</label>
                        <input 
                            type="number" 
                            disabled={input.regime === 'new'}
                            value={input.section80D}
                            onChange={e => setInput({...input, section80D: Number(e.target.value)})}
                            className="w-full mt-1 py-1.5 px-3 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">HRA</label>
                        <input 
                            type="number" 
                            disabled={input.regime === 'new'}
                            value={input.hra}
                            onChange={e => setInput({...input, hra: Number(e.target.value)})}
                            className="w-full mt-1 py-1.5 px-3 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                 </div>
            </div>
             
             <div className="mt-8 flex gap-3">
                <Button onClick={handleSave} isLoading={saveLoading} className="flex items-center gap-2">
                    <Save size={16} /> Save Scenario
                </Button>
                <Button variant="outline" onClick={() => setInput({...input, income: 0})} className="border-gray-300 text-gray-600">
                    <RefreshCw size={16} /> Reset
                </Button>
             </div>
        </div>
      </div>

      {/* Results & History Sidebar */}
      <div className="space-y-6">
        {/* Real-time Result Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-blue-200 text-sm font-medium mb-1">Estimated Tax Payable</h3>
            <div className="text-4xl font-bold mb-4">
                ₹{result?.totalTax?.toLocaleString('en-IN') || 0}
            </div>
            
            <div className="space-y-2 text-sm text-blue-100 border-t border-blue-800 pt-4">
                <div className="flex justify-between">
                    <span>Taxable Income</span>
                    <span>₹{result?.taxableIncome?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between">
                    <span>Base Tax</span>
                    <span>₹{result?.tax?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cess (4%)</span>
                    <span>₹{result?.cess?.toLocaleString('en-IN') || 0}</span>
                </div>
            </div>
             
             {result?.regimeRecommendation && (
                 <div className="mt-4 bg-white/10 p-3 rounded-lg text-xs">
                    💡 Benefit: {result.regimeRecommendation.message}
                 </div>
             )}
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock size={16} /> Saved Checks
                </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No saved history yet</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {history.map((item) => (
                            <button 
                                key={item._id}
                                onClick={() => loadScenario(item)}
                                className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        ₹{item.calculationResult?.totalTax?.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        On {new Date(item.createdAt).toLocaleDateString()} • {item.inputs.regime === 'new' ? 'New' : 'Old'}
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeTaxCalculatorDashboard;
