import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash, Calculator, Save, Info } from 'lucide-react';
import Button from '../../Button/Button';

const HousePropertyCalculator = ({ data, updateData }) => {
    const [localProperties, setLocalProperties] = useState([{
        id: 1,
        address: '',
        propertyType: 'self_occupied', // self_occupied, let_out
        municipalValue: 0,
        actualRent: 0,
        municipalTaxesPaid: 0,
        interestOnLoan: 0,
        preConstructionInterest: 0,
        ownershipPercentage: 100
    }]);

    const properties = data || localProperties;
    const setProperties = updateData ? (newData) => updateData(newData) : setLocalProperties;

    const [totalIncome, setTotalIncome] = useState(0);

    const addProperty = () => {
        setProperties([...properties, {
            id: Date.now(),
            address: '',
            propertyType: 'let_out',
            municipalValue: 0,
            actualRent: 0,
            municipalTaxesPaid: 0,
            interestOnLoan: 0,
            preConstructionInterest: 0,
            ownershipPercentage: 100
        }]);
    };

    const removeProperty = (id) => {
        setProperties(properties.filter(p => p.id !== id));
    };

    const updateProperty = (id, field, value) => {
        const newProps = properties.map(p => {
            if (p.id === id) return { ...p, [field]: value };
            return p;
        });
        setProperties(newProps);
    };

    const calculateHP = () => {
        let selfOccupiedCount = 0;
        let selfOccupiedInterest = 0;

        const calculatedProperties = properties.map(p => {
            let gav = 0;
            let nav = 0;
            let stdDed = 0;
            let finalIncome = 0;

            const share = parseFloat(p.ownershipPercentage) / 100;
            const interest = (parseFloat(p.interestOnLoan) || 0) * share;
            const preInterest = (parseFloat(p.preConstructionInterest) || 0) * share;
            const totalInterest = interest + preInterest;

            if (p.propertyType === 'self_occupied') {
                selfOccupiedCount++;
                gav = 0;
                nav = 0;
                stdDed = 0;
                // Income is negative of interest (Loss)
                // Limit check applies globally, but here we just aggregate
                finalIncome = -totalInterest;
                selfOccupiedInterest += totalInterest;
            } else {
                // Let Out
                const muni = parseFloat(p.municipalValue) || 0;
                const rent = parseFloat(p.actualRent) || 0;
                gav = Math.max(muni, rent);
                
                const taxes = (parseFloat(p.municipalTaxesPaid) || 0);
                nav = gav - taxes;
                
                stdDed = nav * 0.3; // 30% Standard Deduction
                
                finalIncome = (nav - stdDed - totalInterest) * share;
            }

            return { ...p, calculation: { gav, nav, stdDed, finalIncome } };
        });

        // Apply Global Rules
        // 1. Max 2 Self Occupied allowed (others deemed let out - treated as let out in calc for simplicity or warn user)
        // 2. Max interest set off for Self Occupied is 2 Lakhs
        
        let finalTotal = 0;
        
        // Cap Self Occupied Loss at 2 Lakhs
        const cappedSelfOccupiedLoss = Math.min(selfOccupiedInterest, 200000);
        
        // Recalculate Total
        calculatedProperties.forEach(p => {
            if (p.propertyType === 'self_occupied') {
                // We won't add individual self-occupied here, we add the capped total once
            } else {
                finalTotal += p.calculation.finalIncome;
            }
        });

        // Subtract the capped self-occupied interest (Loss)
        finalTotal -= cappedSelfOccupiedLoss;

        setTotalIncome(finalTotal);

    }, [properties]);

    return (
        <div className="max-w-6xl mx-auto pb-20">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Home className="text-blue-600" /> House Property Income
                </h1>
                <Button onClick={() => alert("Implementation Saving...")} icon={Save}>Save to ITR</Button>
             </div>

             <div className="grid lg:grid-cols-3 gap-8">
                 {/* Left: Input Forms */}
                 <div className="lg:col-span-2 space-y-6">
                    {properties.map((prop, index) => (
                        <div key={prop.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                             {properties.length > 1 && (
                                <button onClick={() => removeProperty(prop.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                    <Trash size={18} />
                                </button>
                            )}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Property #{index + 1}</h3>
                                <div className="flex gap-2">
                                     {['self_occupied', 'let_out'].map(type => (
                                         <button 
                                            key={type}
                                            onClick={() => updateProperty(prop.id, 'propertyType', type)}
                                            className={`px-3 py-1 rounded text-xs border capitalize ${prop.propertyType === type ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                                         >
                                             {type.replace('_', ' ')}
                                         </button>
                                     ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Address / Description</label>
                                    <input 
                                        type="text" 
                                        value={prop.address}
                                        onChange={(e) => updateProperty(prop.id, 'address', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Flat 101, Galaxy Apts..."
                                    />
                                </div>
                                
                                {prop.propertyType === 'let_out' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Gross Rent Received</label>
                                            <input 
                                                type="number" 
                                                value={prop.actualRent}
                                                onChange={(e) => updateProperty(prop.id, 'actualRent', e.target.value)}
                                                className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Municipal Taxes Paid</label>
                                            <input 
                                                type="number" 
                                                value={prop.municipalTaxesPaid}
                                                onChange={(e) => updateProperty(prop.id, 'municipalTaxesPaid', e.target.value)}
                                                className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Interest on Housing Loan</label>
                                    <input 
                                        type="number" 
                                        value={prop.interestOnLoan}
                                        onChange={(e) => updateProperty(prop.id, 'interestOnLoan', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Ownership %</label>
                                    <input 
                                        type="number" 
                                        value={prop.ownershipPercentage}
                                        onChange={(e) => updateProperty(prop.id, 'ownershipPercentage', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addProperty} icon={Plus} className="w-full">Add Another Property</Button>
                 </div>

                 {/* Right: Summary */}
                 <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center justify-between">
                            Total Income 
                            <span className={totalIncome >= 0 ? "text-green-600" : "text-red-500"}>
                                {totalIncome >= 0 ? `₹${totalIncome.toFixed(0)}` : `-₹${Math.abs(totalIncome).toFixed(0)}`}
                            </span>
                        </h2>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 space-y-2">
                            <div className="flex gap-2">
                                <Info size={16} className="shrink-0 mt-0.5"/> 
                                <p><strong>Section 24(b):</strong> Max deduction of ₹2 Lakhs allowed for Self-Occupied properties.</p>
                            </div>
                            <div className="flex gap-2">
                                <Info size={16} className="shrink-0 mt-0.5"/> 
                                <p><strong>30% Std Deduction:</strong> Automatically applied on Net Annual Value for Let-out properties.</p>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default HousePropertyCalculator;
