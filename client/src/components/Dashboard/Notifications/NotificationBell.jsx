import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, Download, Briefcase, Info, X } from 'lucide-react';
import Button from '../../Button/Button';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    
    // Mock Data
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'FILING', title: 'ITR Filed Successfully', message: 'Your ITR for AY 2024-25 has been submitted.', time: '2h ago', read: false },
        { id: 2, type: 'PAYMENT', title: 'Refund Approved', message: 'Refund of ₹12,450 approved by IT Dept.', time: '1h ago', read: false },
        { id: 3, type: 'DEADLINE', title: 'Advance Tax Due', message: 'Pay your 2nd installment by 15th Sept.', time: '30m ago', read: false },
        { id: 4, type: 'PROMOTIONAL', title: 'Monthly Tax Tips', message: '5 ways to save tax under 80C. Read now.', time: '1d ago', read: true }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleOpen = () => setIsOpen(!isOpen);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
    };

    const deleteNotification = (e, id) => {
        e.stopPropagation();
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch(type) {
            case 'FILING': return <CheckCircle size={16} className="text-green-600" />;
            case 'PAYMENT': return <Clock size={16} className="text-purple-600" />; // Refund icon placeholder
            case 'DEADLINE': return <AlertCircle size={16} className="text-orange-600" />;
            case 'PROMOTIONAL': return <Info size={16} className="text-blue-600" />;
            default: return <Bell size={16} className="text-gray-600" />;
        }
    };

    const getBgColor = (type) => {
         switch(type) {
            case 'FILING': return 'bg-green-100';
            case 'PAYMENT': return 'bg-purple-100';
            case 'DEADLINE': return 'bg-orange-100';
            case 'PROMOTIONAL': return 'bg-blue-100';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button onClick={toggleOpen} className="relative p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {/* Today Group (Mock Logic) */}
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/20">Today</div>
                                {notifications.slice(0, 3).map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group relative ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => navigate('/dashboard/notifications')} // Go to full page
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${getBgColor(notif.type)}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-semibold mb-1 ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                                                
                                                {/* Context Action (Mock) */}
                                                {notif.type === 'FILING' && (
                                                    <button className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                                                        <Download size={12}/> Download ITR-V
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                         <button 
                                            onClick={(e) => deleteNotification(e, notif.id)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Earlier Group */}
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/20">Earlier</div>
                                {notifications.slice(3).map(notif => (
                                     <div key={notif.id} className="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${getBgColor(notif.type)}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">{notif.title}</h4>
                                            <span className="text-[10px] text-gray-400">{notif.time}</span>
                                        </div>
                                     </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50">
                        <button 
                            onClick={() => navigate('/dashboard/notifications')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
