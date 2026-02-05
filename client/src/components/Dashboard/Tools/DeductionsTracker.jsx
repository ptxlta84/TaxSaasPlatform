import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { Shield, Heart, Archive, Save, RefreshCw } from 'lucide-react';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DeductionsTracker = () => {
    // const { user } = useAuth(); // Removed unused
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [deductionData, setDeductionData] = useState({
        section80C: { ppf: '', epf: '', elss: '', lic: '', tuitionFees: '', homeLoanPrincipal: '', other: '' },
        section80D: { self: '', parents: '', preventiveCheckup: '' },
        otherDeductions: { section80G: '', section80TTA: '', section80TTB: '', section80E: '' }
    });

    const [totals, setTotals] = useState({
        section80C: 0, section80D: 0, other: 0, grossTotal: 0
    });

    // const API_URL = ... moved up

    useEffect(() => {
        const fetchDeductions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/deductions`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.data && !res.data.isNew) {
                    setDeductionData(prev => ({
                        section80C: { ...prev.section80C, ...res.data.section80C },
                        section80D: { ...prev.section80D, ...res.data.section80D },
                        otherDeductions: { ...prev.otherDeductions, ...res.data.otherDeductions }
                    }));
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch deductions', err);
                setLoading(false);
            }
        };
        fetchDeductions();
    }, []);

    useEffect(() => {
        const calculateTotals = () => {
            // 80C Total
            const total80C = Object.values(deductionData.section80C).reduce((acc, val) => acc + Number(val || 0), 0);
            // 80D Total
            const total80D = Object.values(deductionData.section80D).reduce((acc, val) => acc + Number(val || 0), 0);
            // Other Total
            const totalOther = Object.values(deductionData.otherDeductions).reduce((acc, val) => acc + Number(val || 0), 0);
    
            setTotals({
                section80C: total80C,
                section80D: total80D,
                other: totalOther,
                grossTotal: total80C + total80D + totalOther
            });
        };

        calculateTotals();
    }, [deductionData]);

    const handleChange = (section, field, value) => {
        setDeductionData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/deductions`, deductionData, {
                headers: { 'x-auth-token': token }
            });
            alert('Deductions saved successfully!');
        } catch (err) {
            console.error('Save failed', err);
            alert('Failed to save details.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { name: 'Section 80C', icon: Shield },
        { name: 'Section 80D (Health)', icon: Heart },
        { name: 'Other Deductions', icon: Archive },
    ];

    if (loading) return <div className="p-8 text-center">Loading deduction details...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
             <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deductions & Exemptions</h2>
                    <p className="text-sm text-gray-500">Track investments to reduce tax liability (Old Regime Focus)</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Total Claimed</span>
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
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

            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
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
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </div>
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {/* 80C Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg">
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Total 80C Limit: ₹1,50,000</h4>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">Even if you invest more, only ₹1.5L is deductible.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">EPF (Employee Provident Fund)</label>
                                <input type="number" value={deductionData.section80C.epf} onChange={(e) => handleChange('section80C', 'epf', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PPF (Public Provident Fund)</label>
                                <input type="number" value={deductionData.section80C.ppf} onChange={(e) => handleChange('section80C', 'ppf', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ELSS / Mutual Funds</label>
                                <input type="number" value={deductionData.section80C.elss} onChange={(e) => handleChange('section80C', 'elss', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Life Insurance Premium (LIC)</label>
                                <input type="number" value={deductionData.section80C.lic} onChange={(e) => handleChange('section80C', 'lic', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tuition Fees (Children)</label>
                                <input type="number" value={deductionData.section80C.tuitionFees} onChange={(e) => handleChange('section80C', 'tuitionFees', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Home Loan Principal Repayment</label>
                                <input type="number" value={deductionData.section80C.homeLoanPrincipal} onChange={(e) => handleChange('section80C', 'homeLoanPrincipal', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* 80D Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medical Insurance (Self, Spouse, Kids)</label>
                                <input type="number" value={deductionData.section80D.self} onChange={(e) => handleChange('section80D', 'self', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                <p className="text-xs text-gray-500 mt-1">Max ₹25,000 (₹50k if senior)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medical Insurance (Parents)</label>
                                <input type="number" value={deductionData.section80D.parents} onChange={(e) => handleChange('section80D', 'parents', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                <p className="text-xs text-gray-500 mt-1">Max ₹25,000 (₹50k if senior)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preventive Health Checkup</label>
                                <input type="number" value={deductionData.section80D.preventiveCheckup} onChange={(e) => handleChange('section80D', 'preventiveCheckup', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                <p className="text-xs text-gray-500 mt-1">Max ₹5,000 (Overall within limit)</p>
                            </div>
                        </div>
                    </Tab.Panel>

                     {/* Other Deductions Panel */}
                    <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-white/60 focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">80G (Donations)</label>
                                <input type="number" value={deductionData.otherDeductions.section80G} onChange={(e) => handleChange('otherDeductions', 'section80G', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">80TTA/TTB (Savings Interest)</label>
                                <input type="number" value={deductionData.otherDeductions.section80TTA} onChange={(e) => handleChange('otherDeductions', 'section80TTA', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                                <p className="text-xs text-gray-500 mt-1">Max ₹10,000 (₹50k for Seniors)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">80E (Education Loan Interest)</label>
                                <input type="number" value={deductionData.otherDeductions.section80E} onChange={(e) => handleChange('otherDeductions', 'section80E', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-2 border" />
                            </div>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default DeductionsTracker;
