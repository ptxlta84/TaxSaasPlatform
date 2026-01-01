import React, { useState } from 'react';
import { Globe, Plus, Trash, Save, DollarSign, AlertTriangle } from 'lucide-react';
import Button from '../../Button/Button';

const ForeignAssetsReporting = ({ data, updateData }) => {
    const [localAssets, setLocalAssets] = useState([{
        id: 1,
        category: 'bank_account',
        country: 'USA',
        description: '',
        currency: 'USD',
        valueInForeignCurrency: '',
        valueInINR: 0,
        incomeFromAsset: 0,
        foreignTaxPaid: 0,
        tin: '',
        dtaaClaimed: false
    }]);

    const assets = data || localAssets;
    const setAssets = updateData ? (newData) => updateData(newData) : setLocalAssets;

    const exchangeRates = {
        'USD': 83.5,
        'EUR': 90.2,
        'GBP': 105.4,
        'SGD': 62.1,
        'AUD': 54.8
    };

    const addAsset = () => {
        setAssets([...assets, {
            id: Date.now(),
            category: 'bank_account',
            country: '',
            description: '',
            currency: 'USD',
            valueInForeignCurrency: '',
            valueInINR: 0,
            incomeFromAsset: 0,
            foreignTaxPaid: 0,
            tin: '',
            dtaaClaimed: false
        }]);
    };

    const removeAsset = (id) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    const updateAsset = (id, field, value) => {
        const newAssets = assets.map(asset => {
            if (asset.id === id) {
                const updatedAsset = { ...asset, [field]: value };
                
                // Auto-calculate INR
                if (field === 'valueInForeignCurrency' || field === 'currency') {
                    const rate = exchangeRates[updatedAsset.currency] || 1;
                    const val = parseFloat(updatedAsset.valueInForeignCurrency) || 0;
                    updatedAsset.valueInINR = (val * rate).toFixed(2);
                }
                return updatedAsset;
            }
            return asset;
        });
        setAssets(newAssets);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe className="text-blue-600" /> Foreign Assets (Schedule FA)
                </h1>
                <Button onClick={() => alert("Implementation Saving...")} icon={Save}>Save Schedule FA</Button>
             </div>

             <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-8 flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="shrink-0 text-yellow-600" size={20} />
                <div>
                    <span className="font-bold block mb-1">Important Compliance Notice (Black Money Act 2015)</span>
                    Residents must disclose all foreign assets (Bank accounts, Equity, Property) held at any time during the year. 
                    Non-disclosure attracts a penalty of ₹10 Lakhs and potential prosecution.
                </div>
            </div>

            <div className="space-y-6">
                {assets.map((asset, index) => (
                    <div key={asset.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                         {assets.length > 1 && (
                            <button onClick={() => removeAsset(asset.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                <Trash size={18} />
                            </button>
                        )}
                        <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Foreign Asset #{index + 1}</h3>
                        
                        <div className="grid md:grid-cols-4 gap-6">
                            {/* Row 1 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                <select 
                                    value={asset.category}
                                    onChange={(e) => updateAsset(asset.id, 'category', e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="bank_account">Bank Account</option>
                                    <option value="securities">Stocks / Securities</option>
                                    <option value="real_estate">Immovable Property</option>
                                    <option value="mutual_funds">Mutual Funds</option>
                                    <option value="other">Other Assets</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                                <input 
                                    type="text" 
                                    value={asset.country}
                                    onChange={(e) => updateAsset(asset.id, 'country', e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. USA"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Description (Bank Name / Asset Name)</label>
                                <input 
                                    type="text" 
                                    value={asset.description}
                                    onChange={(e) => updateAsset(asset.id, 'description', e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. Bank of America - Savings"
                                />
                            </div>

                            {/* Row 2: Valuation */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                                <select 
                                    value={asset.currency}
                                    onChange={(e) => updateAsset(asset.id, 'currency', e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="SGD">SGD (S$)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Peak Value (In Foreign Currency)</label>
                                <input 
                                    type="number" 
                                    value={asset.valueInForeignCurrency}
                                    onChange={(e) => updateAsset(asset.id, 'valueInForeignCurrency', e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="1000.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Value in INR (Approx)</label>
                                <input 
                                    type="text" 
                                    value={asset.valueInINR}
                                    readOnly
                                    className="w-full p-2 rounded border border-gray-200 bg-gray-50 dark:bg-gray-900 text-gray-500"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Foreign Tax ID (TIN)</label>
                                <input 
                                    type="text" 
                                    value={asset.tin}
                                    onChange={(e) => updateAsset(asset.id, 'tin', e.target.value)}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Row 3: Income & Tax */}
                             <div className="md:col-span-4 border-t pt-4 mt-2">
                                <h4 className="text-sm font-semibold mb-3">Income from Asset & Relief</h4>
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Income Earned (INR)</label>
                                        <input 
                                            type="number" 
                                            value={asset.incomeFromAsset}
                                            onChange={(e) => updateAsset(asset.id, 'incomeFromAsset', e.target.value)}
                                            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tax Paid Abroad (INR)</label>
                                        <input 
                                            type="number" 
                                            value={asset.foreignTaxPaid}
                                            onChange={(e) => updateAsset(asset.id, 'foreignTaxPaid', e.target.value)}
                                            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                     <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={asset.dtaaClaimed}
                                                onChange={(e) => updateAsset(asset.id, 'dtaaClaimed', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Claim DTAA Relief (Sec 90/90A)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                <Button variant="outline" onClick={addAsset} icon={Plus} className="w-full">
                    Add Foreign Asset
                </Button>
            </div>
        </div>
    );
};

export default ForeignAssetsReporting;
