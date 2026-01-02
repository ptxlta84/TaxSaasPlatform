import React, { useState, useEffect } from 'react';
import { Calculator, HelpCircle, Save, Plus, Trash } from 'lucide-react';
import Button from '../../Button/Button';

const CapitalGains = ({ data, updateData }) => {
    // If used inside Wizard, use props. Otherwise use local state.
    const [localAssets, setLocalAssets] = useState([{
        id: 1, type: 'equity_shares', description: '', 
        buyDate: '', sellDate: '', 
        buyPrice: '', sellPrice: '', 
        transferExpenses: 0 
    }]);

    const assets = data || localAssets;
    const setAssets = updateData ? (newData) => updateData(newData) : setLocalAssets;

    const [summary, setSummary] = useState({ stcg: 0, ltcg: 0, totalTax: 0 });

    // Cost Inflation Index (Mock Data for recent years)
    const ciiMap = {
        '2018-01': 280, '2019-01': 289, '2020-01': 301, '2021-01': 317, 
        '2022-01': 331, '2023-01': 348, '2024-01': 363
    };

    const getCII = (dateStr) => {
        // Simplified: just check year. In real app, check financial year range.
        const year = dateStr.split('-')[0];
        return ciiMap[`${year}-01`] || 363;
    };

    const calculateGains = React.useCallback(() => {
        let stcgTotal = 0;
        let ltcgTotal = 0;

        assets.forEach(asset => {
            if (!asset.buyDate || !asset.sellDate || !asset.buyPrice || !asset.sellPrice) return;

            const buy = new Date(asset.buyDate);
            const sell = new Date(asset.sellDate);
            const diffTime = Math.abs(sell - buy);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Determine Holding Period Threshold (Months)
            let threshold = 36; // Default (Debt, Gold)
            if (asset.type === 'equity_shares' || asset.type === 'equity_funds') threshold = 12;
            else if (asset.type === 'real_estate') threshold = 24;

            const isLTCG = diffDays > (threshold * 30);
            
            let costOfAcquisition = parseFloat(asset.buyPrice);

            // Apply Indexation for LTCG (except Equity)
            if (isLTCG && asset.type !== 'equity_shares' && asset.type !== 'equity_funds') {
                const sellCII = getCII(asset.sellDate); // current year
                const buyCII = getCII(asset.buyDate);
                costOfAcquisition = costOfAcquisition * (sellCII / buyCII);
            }

            const netSale = parseFloat(asset.sellPrice) - parseFloat(asset.transferExpenses);
            const gain = netSale - costOfAcquisition;

            if (isLTCG) ltcgTotal += gain;
            else stcgTotal += gain;
        });

        // Tax Calculation (Simplified)
        // Equity LTCG > 1L @ 10%, STCG @ 15%
        // Others LTCG @ 20% w/ indexation, STCG slab
        const tax = (stcgTotal * 0.15) + (ltcgTotal > 100000 ? (ltcgTotal - 100000) * 0.10 : 0);

        setSummary({ stcg: stcgTotal, ltcg: ltcgTotal, totalTax: tax });
    }, [assets]); // Added dependency

    const updateAsset = (index, field, value) => {
        const newAssets = [...assets];
        newAssets[index][field] = value;
        setAssets(newAssets);
    };

    const addAsset = () => {
        setAssets([...assets, { id: Date.now(), type: 'equity_shares', description: '', buyDate: '', sellDate: '', buyPrice: '', sellPrice: '', transferExpenses: 0 }]);
    };

    const removeAsset = (index) => {
        const newAssets = [...assets];
        newAssets.splice(index, 1);
        setAssets(newAssets);
    };

    useEffect(() => {
        calculateGains();
    }, [calculateGains]); // Added calculateGains to dependency

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calculator className="text-blue-600" /> Capital Gains Calculator
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    {assets.map((asset, index) => (
                        <div key={asset.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                             {assets.length > 1 && (
                                <button onClick={() => removeAsset(index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                    <Trash size={18} />
                                </button>
                            )}
                            <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Asset #{index + 1}</h3>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Asset Type</label>
                                    <select 
                                        value={asset.type} 
                                        onChange={(e) => updateAsset(index, 'type', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="equity_shares">Equity Shares (Listed)</option>
                                        <option value="equity_funds">Equity Mutual Funds</option>
                                        <option value="real_estate">Real Estate / Property</option>
                                        <option value="gold">Gold / Jewellery</option>
                                        <option value="debt_funds">Debt Funds</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Infy Shares"
                                        value={asset.description}
                                        onChange={(e) => updateAsset(index, 'description', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Buy Date</label>
                                    <input 
                                        type="date"
                                        value={asset.buyDate}
                                        onChange={(e) => updateAsset(index, 'buyDate', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Buy Price (₹)</label>
                                    <input 
                                        type="number"
                                        value={asset.buyPrice}
                                        onChange={(e) => updateAsset(index, 'buyPrice', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Sell Date</label>
                                    <input 
                                        type="date"
                                        value={asset.sellDate}
                                        onChange={(e) => updateAsset(index, 'sellDate', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Sell Price (₹)</label>
                                    <input 
                                        type="number"
                                        value={asset.sellPrice}
                                        onChange={(e) => updateAsset(index, 'sellPrice', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <Button variant="outline" onClick={addAsset} icon={Plus} className="w-full">
                        Add Another Asset
                    </Button>
                </div>

                {/* Right: Summary */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2">Tax Estimate</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Short Term Gains</span>
                                <span className="font-semibold text-gray-900 dark:text-white">₹{summary.stcg.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Long Term Gains</span>
                                <span className="font-semibold text-gray-900 dark:text-white">₹{summary.ltcg.toFixed(2)}</span>
                            </div>
                             <div className="border-t pt-4 mt-2 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 -mx-6 px-6 py-4">
                                <span className="text-blue-800 dark:text-blue-300 font-bold">Total Tax Liability</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{summary.totalTax.toFixed(0)}</span>
                            </div>
                        </div>

                         <div className="mt-6">
                            <Button className="w-full" icon={Save}>
                                Save to ITR
                            </Button>
                            <p className="text-xs text-center text-gray-500 mt-2">
                                * This is an estimate. Exact tax depends on your total income slab.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapitalGains;
