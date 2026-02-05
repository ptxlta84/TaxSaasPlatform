import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: IconComponent, color, subtext }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <IconComponent size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // const API_URL = ... moved up

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Retrieve token manually
                const token = localStorage.getItem('accessToken'); 
                const res = await axios.get(`${API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` } 
                    // Alternatively use authService if interceptor handles it
                }); 
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Stats...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={stats?.totalUsers || 0} 
                    icon={Users} 
                    color="bg-blue-500"
                    subtext={`${stats?.newUsersToday || 0} new today`}
                />
                <StatCard 
                    title="Income Profiles" 
                    value={stats?.engagement?.incomeEntered || 0} 
                    icon={TrendingUp} 
                    color="bg-green-500"
                    subtext="Users added income"
                />
                <StatCard 
                    title="Deductions Claimed" 
                    value={stats?.engagement?.deductionsClaimed || 0} 
                    icon={CheckCircle} 
                    color="bg-purple-500"
                    subtext="Users added deductions"
                />
                 <StatCard 
                    title="ITR Status" 
                    value="Pending" 
                    icon={FileText} 
                    color="bg-orange-500"
                    subtext="Filing not started globally"
                />
            </div>

            {/* Add Chart Placeholder Here */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex items-center justify-center text-gray-400">
                Chart: User Growth (Last 30 Days) - Coming Soon
            </div>
        </div>
    );
};

export default AdminDashboard;
