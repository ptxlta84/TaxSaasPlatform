import React, { useState } from 'react';
import { Bell, Search, Filter, Trash2, CheckSquare } from 'lucide-react';
import Button from '../../Button/Button';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data (Expanded)
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'FILING', title: 'ITR Filed Successfully', message: 'Your ITR for AY 2024-25 has been submitted successfully.', time: '2 hours ago', read: false },
        { id: 2, type: 'PAYMENT', title: 'Refund Approved', message: 'Refund of ₹12,450 approved by IT Dept. Expected credit in 3 days.', time: '1 hour ago', read: false },
        { id: 3, type: 'DEADLINE', title: 'Advance Tax Due', message: 'Pay your 2nd installment of Advance Tax by 15th Sept to avoid interest.', time: '30 mins ago', read: false },
        { id: 4, type: 'PROMOTIONAL', title: 'Monthly Tax Tips', message: '5 ways to save tax under 80C. Read our latest blog post now.', time: '1 day ago', read: true },
        { id: 5, type: 'SYSTEM', title: 'Security Alert', message: 'New login detected from Chrome on Windows.', time: '2 days ago', read: true },
    ]);

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'ALL' || n.type === filter;
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
    };

    const deleteAll = () => {
        if(window.confirm("Are you sure you want to clear all notifications?")) {
            setNotifications([]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="text-blue-600" /> Notification Center
                    </h1>
                    <p className="text-gray-500 mt-1">Stay updated with your filing status and alerts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={CheckSquare} onClick={markAllRead}>Mark all read</Button>
                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" icon={Trash2} onClick={deleteAll}>Clear All</Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['ALL', 'FILING', 'PAYMENT', 'DEADLINE', 'PROMOTIONAL'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === type 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search notifications..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300">
                        <Bell size={40} className="mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-500">No notifications found</h3>
                        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div 
                            key={notif.id} 
                            className={`flex flex-col md:flex-row gap-4 p-5 rounded-xl border transition-all ${
                                notif.read 
                                ? 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700' 
                                : 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm'
                            }`}
                        >
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                     <div className="flex items-center gap-2">
                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                             notif.type === 'FILING' ? 'bg-green-100 text-green-700' :
                                             notif.type === 'PAYMENT' ? 'bg-purple-100 text-purple-700' :
                                             notif.type === 'DEADLINE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                         }`}>
                                            {notif.type}
                                         </span>
                                         <span className="text-xs text-gray-400">• {notif.time}</span>
                                     </div>
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                    {notif.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
