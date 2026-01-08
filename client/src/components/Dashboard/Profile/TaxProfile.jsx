import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Trash2, User, Briefcase, Users } from 'lucide-react';

const TaxProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const [userInfo, setUserInfo] = useState(null); // Read-only from User model

    const [formData, setFormData] = useState({
        dateOfBirth: '',
        gender: 'male',
        fatherName: '',
        residentialStatus: 'resident',
        employerCategory: 'private',
        alternateMobile: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        dependents: []
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/tax-profile`, {
                headers: { 'x-auth-token': token }
            });
            
            if (res.data) {
                const { user, ...profileData } = res.data;
                setUserInfo(user); // Set read-only user info

                // If profile exists (not just user info)
                if (!res.data.isNew) {
                    const formattedData = { ...profileData };
                    if (formattedData.dateOfBirth) {
                        formattedData.dateOfBirth = new Date(formattedData.dateOfBirth).toISOString().split('T')[0];
                    }
                    // Format dates for dependents
                    if (formattedData.dependents) {
                        formattedData.dependents = formattedData.dependents.map(d => ({
                            ...d,
                            dateOfBirth: new Date(d.dateOfBirth).toISOString().split('T')[0]
                        }));
                    }
                    // Ensure address object exists
                    if (!formattedData.address) formattedData.address = { country: 'India' };
                    
                    setFormData(prev => ({ ...prev, ...formattedData }));
                }
            }
        } catch (err) {
            console.error('Error fetching profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Dependents Logic
    const addDependent = () => {
        setFormData(prev => ({
            ...prev,
            dependents: [...prev.dependents, { name: '', relation: 'spouse', dateOfBirth: '', panNumber: '' }]
        }));
    };

    const removeDependent = (index) => {
        setFormData(prev => ({
            ...prev,
            dependents: prev.dependents.filter((_, i) => i !== index)
        }));
    };

    const handleDependentChange = (index, field, value) => {
        const newDependents = [...formData.dependents];
        newDependents[index][field] = value;
        setFormData(prev => ({ ...prev, dependents: newDependents }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/tax-profile`, formData, {
                headers: { 'x-auth-token': token }
            });
            setMessage({ type: 'success', text: 'Tax Profile updated successfully!' });
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Failed to update profile';
            setMessage({ type: 'error', text: errorMsg });
            window.scrollTo(0, 0);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    My Tax Profile
                </h2>
                <p className="text-gray-500 text-sm mt-1">Complete your profile to unlock accurate tax planning.</p>
            </header>
            
            {message.text && (
                <div className={`p-4 mb-6 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Identity Verification (Read Only) */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <User size={18} /> Verified Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Full Name</label>
                            <div className="font-medium text-gray-900 dark:text-white">{userInfo?.name}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase">PAN Number</label>
                            <div className="font-medium text-gray-900 dark:text-white">{userInfo?.panNumber || <span className="text-orange-500 italic text-xs">No PAN Linked</span>}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Mobile</label>
                            <div className="font-medium text-gray-900 dark:text-white">{userInfo?.mobile}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Email</label>
                            <div className="font-medium text-gray-900 dark:text-white truncate">{userInfo?.email}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Personal & Employment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-gray-400" /> Personal & Employment
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father's Name</label>
                                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required className="input-field" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Residency</label>
                                    <select name="residentialStatus" value={formData.residentialStatus} onChange={handleChange} className="input-field">
                                        <option value="resident">Resident</option>
                                        <option value="non_resident">NRI</option>
                                        <option value="resident_not_ordinary">RNOR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employer Cat.</label>
                                    <select name="employerCategory" value={formData.employerCategory} onChange={handleChange} className="input-field">
                                        <option value="private">Private</option>
                                        <option value="govt">Government</option>
                                        <option value="psu">PSU</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alternate Mobile</label>
                                <input type="text" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} placeholder="Optional" className="input-field" maxLength="10" />
                            </div>
                        </div>
                    </div>

                    {/* 3. Address */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                             Address
                        </h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Flat/Door/Block</label>
                                <input type="text" name="address.street" value={formData.address?.street} onChange={handleChange} className="input-field" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <input type="text" name="address.city" value={formData.address?.city} onChange={handleChange} required className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                                    <input type="text" name="address.pincode" value={formData.address?.pincode} onChange={handleChange} required maxLength="6" className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                    <input type="text" name="address.state" value={formData.address?.state} onChange={handleChange} required className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                    <input type="text" value="India" disabled className="input-field bg-gray-100" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 4. Dependents (Family) */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Users size={20} className="text-gray-400" /> Family & Dependents
                        </h3>
                        <button type="button" onClick={addDependent} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                            <Plus size={16} /> Add Member
                        </button>
                    </div>
                    
                    {formData.dependents.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No dependents added. Add family members to claim insurance premiums (80D) etc.</p>
                    )}

                    <div className="space-y-4">
                        {formData.dependents.map((dep, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex-1 w-full">
                                    <label className="text-xs text-gray-500">Name</label>
                                    <input type="text" value={dep.name} onChange={(e) => handleDependentChange(index, 'name', e.target.value)} required className="input-field-sm" />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="text-xs text-gray-500">Relation</label>
                                    <select value={dep.relation} onChange={(e) => handleDependentChange(index, 'relation', e.target.value)} className="input-field-sm">
                                        <option value="spouse">Spouse</option>
                                        <option value="child">Child</option>
                                        <option value="parent">Parent</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="w-full md:w-40">
                                    <label className="text-xs text-gray-500">DOB</label>
                                    <input type="date" value={dep.dateOfBirth} onChange={(e) => handleDependentChange(index, 'dateOfBirth', e.target.value)} required className="input-field-sm" />
                                </div>
                                <div className="w-full md:w-40">
                                    <label className="text-xs text-gray-500">PAN (Optional)</label>
                                    <input type="text" value={dep.panNumber} onChange={(e) => handleDependentChange(index, 'panNumber', e.target.value)} className="input-field-sm uppercase" />
                                </div>
                                <button type="button" onClick={() => removeDependent(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-8 py-3 rounded-lg text-white font-medium shadow-sm transition-all ${
                            saving ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                        }`}
                    >
                        {saving ? 'Saving Profile...' : 'Save Tax Profile'}
                    </button>
                </div>
            </form>

            <style>{`
                .input-field {
                    @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors;
                }
                .input-field-sm {
                    @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white;
                }
            `}</style>
        </div>
    );
};

export default TaxProfile;
