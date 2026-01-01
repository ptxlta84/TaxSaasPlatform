import React, { useState } from 'react';
import { Bell, Smartphone, Mail, MessageSquare, Moon, Save } from 'lucide-react';
import Button from '../../Button/Button';

const NotificationPreferences = () => {
    
    // Mock Settings State
    const [settings, setSettings] = useState({
        channels: {
            whatsapp: true,
            email: true,
            sms: true,
            inApp: true
        },
        types: {
            filingUpdates: true,
            paymentReceipts: true,
            refundAlerts: true,
            deadlines: true,
            promotional: false
        },
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
        }
    });

    const toggleChannel = (key) => {
        setSettings(prev => ({
            ...prev,
            channels: { ...prev.channels, [key]: !prev.channels[key] }
        }));
    };

    const toggleType = (key) => {
        setSettings(prev => ({
            ...prev,
            types: { ...prev.types, [key]: !prev.types[key] }
        }));
    };

    const handleSave = () => {
        alert("Preferences Saved Successfully!");
        // API call to save settings
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Bell className="text-blue-600" /> Notification Preferences
            </h1>

            <div className="grid gap-8">
                {/* 1. Preferred Channels */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Communication Channels</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <ToggleCard 
                            icon={MessageSquare} 
                            label="WhatsApp" 
                            desc="Receive status updates and receipts instantly on WhatsApp."
                            active={settings.channels.whatsapp}
                            onClick={() => toggleChannel('whatsapp')}
                            color="text-green-600"
                        />
                         <ToggleCard 
                            icon={Mail} 
                            label="Email" 
                            desc="Get detailed reports, receipts, and filing summaries."
                            active={settings.channels.email}
                            onClick={() => toggleChannel('email')}
                            color="text-blue-600"
                        />
                         <ToggleCard 
                            icon={Smartphone} 
                            label="SMS" 
                            desc="Critical OTPs and urgent deadline alerts."
                            active={settings.channels.sms}
                            onClick={() => toggleChannel('sms')}
                            color="text-orange-600"
                        />
                        <ToggleCard 
                            icon={Bell} 
                            label="In-App Push" 
                            desc="Real-time alerts while you are using the dashboard."
                            active={settings.channels.inApp}
                            onClick={() => toggleChannel('inApp')}
                            color="text-purple-600"
                        />
                    </div>
                </div>

                {/* 2. Notification Types */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alert Types</h3>
                    <div className="space-y-4">
                        <CheckboxRow label="Filing Updates (Acknowledgement, Verified)" checked={settings.types.filingUpdates} onChange={() => toggleType('filingUpdates')} />
                        <CheckboxRow label="Payment Receipts & Invoices" checked={settings.types.paymentReceipts} onChange={() => toggleType('paymentReceipts')} />
                        <CheckboxRow label="Refund Approved / Credited Alerts" checked={settings.types.refundAlerts} onChange={() => toggleType('refundAlerts')} />
                        <CheckboxRow label="Deadline Reminders (Advance Tax, Filing)" checked={settings.types.deadlines} onChange={() => toggleType('deadlines')} />
                        <CheckboxRow label="Promotional Tips & Offers" checked={settings.types.promotional} onChange={() => toggleType('promotional')} />
                    </div>
                </div>

                {/* 3. Quiet Hours */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Moon size={20} className="text-indigo-500" /> Quiet Hours
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Pause non-urgent notifications during specific times.</p>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.quietHours.enabled} onChange={(e) => setSettings({...settings, quietHours: {...settings.quietHours, enabled: e.target.checked}})} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {settings.quietHours.enabled && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
                                <input type="time" value={settings.quietHours.start} className="p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <span className="text-gray-400 mt-5">-</span>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
                                <input type="time" value={settings.quietHours.end} className="p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} icon={Save}>
                        Save Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ToggleCard = ({ icon: Icon, label, desc, active, onClick, color }) => (
    <div 
        onClick={onClick}
        className={`cursor-pointer border rounded-xl p-4 flex gap-4 transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <Icon className={active ? color : 'text-gray-400'} size={20} />
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{label}</span>
                {active && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const CheckboxRow = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={onChange}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
        />
        <span className={`text-sm group-hover:text-gray-900 dark:group-hover:text-white ${checked ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
            {label}
        </span>
    </label>
);

export default NotificationPreferences;
