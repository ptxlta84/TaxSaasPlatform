import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { Briefcase, Home, TrendingUp, DollarSign, PieChart, Save, RefreshCw, Upload, X } from 'lucide-react';
import Form16Preview from './Form16Preview';
// import TaxEstimator from './TaxEstimator.jsx';
import { useAuth } from '../../../contexts/AuthContext';
import { calculateIncomeTax }  from '../../../utils/taxCalculations/india2024'; // Reuse utility
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const IncomeTaxCalculatorDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [previewData, setPreviewData] = useState(null); // State for Form-16 Preview Overlay

    const [incomeData, setIncomeData] = useState({
        salary: { grossSalary: '', allowances: '' },
        houseProperty: { type: 'self', incomeFromRent: '', municipalTaxes: '', interestOnLoan: '' },
        business: { grossTurnover: '', netProfit: '', expenses: '' },
        capitalGains: { shortTerm: '', longTerm: '' },
        otherSources: { savingsInterest: '', fdInterest: '', dividend: '', other: '' }
    });

    const [totals, setTotals] = useState({
        salary: 0, houseProperty: 0, business: 0, capitalGains: 0, otherSources: 0, grossTotal: 0
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchIncomeDetails();
    }, []);

    // Auto-calculate totals on change
    useEffect(() => {
        calculateTotals();
    }, [incomeData]);

    const fetchIncomeDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/income`, {
                headers: { 'x-auth-token': token }
            });
            if (res.data && !res.data.isNew) {
                // Merge with defaults to handle partial updates
                setIncomeData(prev => ({
                    salary: { ...prev.salary, ...res.data.salary },
                    houseProperty: { ...prev.houseProperty, ...res.data.houseProperty },
                    business: { ...prev.business, ...res.data.business },
                    capitalGains: { ...prev.capitalGains, ...res.data.capitalGains },
                    otherSources: { ...prev.otherSources, ...res.data.otherSources }
                }));
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch income details', err);
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        const salaryNet = Math.max(0, Number(incomeData.salary.grossSalary) - Number(incomeData.salary.allowances));
        
        let houseNet = 0;
        if (incomeData.houseProperty.type === 'let-out') {
            const nav = Math.max(0, Number(incomeData.houseProperty.incomeFromRent) - Number(incomeData.houseProperty.municipalTaxes));
            const stdDed = nav * 0.3;
            houseNet = nav - stdDed - Number(incomeData.houseProperty.interestOnLoan);
        } else {
            houseNet = Math.max(-200000, -Number(incomeData.houseProperty.interestOnLoan));
        }

        const businessNet = Number(incomeData.business.netProfit);
        const gainsNet = Number(incomeData.capitalGains.shortTerm) + Number(incomeData.capitalGains.longTerm);
        const otherNet = Number(incomeData.otherSources.savingsInterest) + 
                         Number(incomeData.otherSources.fdInterest) + 
                         Number(incomeData.otherSources.dividend) + 
                         Number(incomeData.otherSources.other);

        setTotals({
            salary: salaryNet,
            houseProperty: houseNet,
            business: businessNet,
            capitalGains: gainsNet,
            otherSources: otherNet,
            grossTotal: salaryNet + houseNet + businessNet + gainsNet + otherNet
        });
    };

    const handleChange = (section, field, value) => {
        setIncomeData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/income`, incomeData, {
                headers: { 'x-auth-token': token }
            });
            // Show toast or alert
            alert('Income details saved successfully!');
        } catch (err) {
            console.error('Save failed', err);
            alert('Failed to save details.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true); // Reuse loading or create specific uploadLoading state
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/income/upload-form16`, formData, {
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update state with extracted data
            if (res.data.updatedIncome) {
                const { isPartA, isPartB, tdsDeducted, employer, grossSalary, standardDeduction, professionalTax, taxableSalary } = res.data.extractedData || {};

                // Construct preview object
                const preview = {
                    financialYear: '2024-25',
                    employer: employer || {},
                    salary: {
                        gross: grossSalary,
                        hra: 0, // Not explicitly extracted yet, defaulting
                        lta: 0,
                        standardDeduction: standardDeduction || 50000, // Fallback if 0 but usually parser catches
                        professionalTax: professionalTax || 0,
                        netTaxable: taxableSalary || (grossSalary - 50000)
                    },
                    tds: {
                        totalamount: 0, // Not extracted
                        taxDeducted: tdsDeducted
                    },
                    isPartA,
                    isPartB
                };
                
                setPreviewData(preview);

                // Auto-fill background state (can be overridden by user in preview confirm)
                 setIncomeData(prev => ({
                    ...prev,
                    salary: { 
                        ...prev.salary, 
                        grossSalary: grossSalary || prev.salary.grossSalary,
                        // We might want to add field for professional tax if it exists in schema
                        // allowances: ... 
                    }
                }));
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to process Form-16. Please try again.');
        } finally {
            setLoading(false);
            // Reset input
            e.target.value = null; 
        }
    };

    const categories = [
        { name: 'Salary', icon: Briefcase, color: 'text-blue-500' },
        { name: 'House Property', icon: Home, color: 'text-green-500' },
        { name: 'Business/Profession', icon: TrendingUp, color: 'text-purple-500' },
        { name: 'Capital Gains', icon: PieChart, color: 'text-orange-500' },
        { name: 'Other Sources', icon: DollarSign, color: 'text-teal-500' },
    ];

    const handlePreviewConfirm = () => {
        setPreviewData(null);
        alert("Salary details auto-filled. Please review deductions next.");
        // Could auto-switch tab or open Deductions modal here if we had one
    };

    if (loading) return <div className="p-8 text-center">Loading income details...</div>;

    if (previewData) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-4">
                    <button onClick={() => setPreviewData(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                         <X size={16} /> Cancel
                    </button>
                </div>
               <Form16Preview 
                    data={previewData} 
                    onConfirm={handlePreviewConfirm} 
                    onReupload={() => setPreviewData(null)} 
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Income Sources (FY 2024-25)</h2>
                    <p className="text-sm text-gray-500">Provide details for accurate tax calculation</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Gross Total Income</span>
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totals.grossTotal)}
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </header>

            <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1">
                    {categories.map((category) => (
                        <Tab
                            key={category.name}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white text-blue-700 shadow dark:bg-gray-800 dark:text-blue-400'
                                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600 dark:text-gray-400'
                                )
                            }
                        >
                            <div className="flex items-center justify-center gap-2">
                                <category.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{category.name}</span>
                            </div>
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels className="mt-2">
                    {/* Salary Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                        <div className="mb-6 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div>
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                    <Briefcase size={18} /> Auto-Fill from Form-16
                                </h4>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Upload your Form-16 PDF to instantly populate salary details.</p>
                            </div>
                            <label className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <Upload size={16} />
                                Upload PDF
                                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gross Salary</label>
                                <input type="number" value={incomeData.salary.grossSalary} onChange={(e) => handleChange('salary', 'grossSalary', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allowances (HRA, LTA etc.)</label>
                                <input type="number" value={incomeData.salary.allowances} onChange={(e) => handleChange('salary', 'allowances', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                                <p className="text-sm text-gray-500">Net Salary: <span className="font-bold text-gray-900 dark:text-white">{totals.salary}</span></p>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* House Property Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Type</label>
                                <select value={incomeData.houseProperty.type} onChange={(e) => handleChange('houseProperty', 'type', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border">
                                    <option value="self">Self Occupied</option>
                                    <option value="let-out">Let Out</option>
                                </select>
                            </div>
                            {incomeData.houseProperty.type === 'let-out' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Rent Received</label>
                                        <input type="number" value={incomeData.houseProperty.incomeFromRent} onChange={(e) => handleChange('houseProperty', 'incomeFromRent', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Municipal Taxes Paid</label>
                                        <input type="number" value={incomeData.houseProperty.municipalTaxes} onChange={(e) => handleChange('houseProperty', 'municipalTaxes', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest on Home Loan</label>
                                <input type="number" value={incomeData.houseProperty.interestOnLoan} onChange={(e) => handleChange('houseProperty', 'interestOnLoan', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                <p className="text-xs text-gray-500 mt-1">Max 2L deduction for Self Occupied</p>
                            </div>
                             <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                                <p className="text-sm text-gray-500">Net Annual Value / Loss: <span className="font-bold text-gray-900 dark:text-white">{totals.houseProperty}</span></p>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* Business Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gross Turnover</label>
                                <input type="number" value={incomeData.business.grossTurnover} onChange={(e) => handleChange('business', 'grossTurnover', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit / Presumptive Income</label>
                                <input type="number" value={incomeData.business.netProfit} onChange={(e) => handleChange('business', 'netProfit', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                         </div>
                    </Tab.Panel>

                    {/* Capital Gains Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Term Capital Gains (STCG)</label>
                                <input type="number" value={incomeData.capitalGains.shortTerm} onChange={(e) => handleChange('capitalGains', 'shortTerm', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Long Term Capital Gains (LTCG)</label>
                                <input type="number" value={incomeData.capitalGains.longTerm} onChange={(e) => handleChange('capitalGains', 'longTerm', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                         </div>
                    </Tab.Panel>

                    {/* Other Sources Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Savings Bank Interest</label>
                                <input type="number" value={incomeData.otherSources.savingsInterest} onChange={(e) => handleChange('otherSources', 'savingsInterest', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">FD / Term Deposit Interest</label>
                                <input type="number" value={incomeData.otherSources.fdInterest} onChange={(e) => handleChange('otherSources', 'fdInterest', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dividend Income</label>
                                <input type="number" value={incomeData.otherSources.dividend} onChange={(e) => handleChange('otherSources', 'dividend', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Other Income</label>
                                <input type="number" value={incomeData.otherSources.other} onChange={(e) => handleChange('otherSources', 'other', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                         </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
            
            {/* Quick Estimate Card */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Tax Estimate (Based on Input above)</h3>
                <p className="text-sm text-gray-500 mb-4">Click Calculate to see tax liability for <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totals.grossTotal)}</strong></p>
                {/* Note: In a real app we'd pass props to TaxEstimator to pre-fill */}
                <div className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => document.getElementById('tax-estimator-section').scrollIntoView()}>
                    Go to detailed estimator
                </div>
            </div>
        </div>
    );
};

export default IncomeTaxCalculatorDashboard;
