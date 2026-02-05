import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Download, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import FormInput from '../../Form/FormInput'; 
import Button from '../../Button/Button';

// Initial MVP implementation: Combined List & Detail view logic for speed
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    
    // Selected user for detail view
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('accessToken'); 

    const fetchUsers = async () => {
        setLoading(true);
        try {
             // Debounce search ideal, but keep simple for now
            const res = await axios.get(`${API_URL}/admin/users`, {
                params: { page, limit: 10, search },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load users. ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUserDetails = async (id) => {
        setDetailLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSelectedUser(res.data);
            setDetailLoading(false);
        } catch (err) {
            console.error('Error fetching details:', err);
            setDetailLoading(false);
        }
    };

    const handleViewClick = (user) => {
        fetchUserDetails(user._id);
    };

    const handleBackToList = () => {
        setSelectedUser(null);
    };

    // --- RENDER DETAIL VIEW ---
    if (selectedUser) {
        if (detailLoading) return <div className="p-8">Loading details...</div>;
        const { user, income, taxEstimate } = selectedUser;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={handleBackToList} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4">
                    <ChevronLeft size={16} /> Back to Users
                </button>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-500">{user.email} • {user.mobile}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-300 uppercase font-semibold">
                                {user.role}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Tax Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Income Summary */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-4 border-b pb-2">Income Profile</h3>
                        {income ? (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Gross Total Income</span>
                                    <span className="font-bold">₹{income.grossTotalIncome?.toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Ref: {income._id}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">No income data entered.</p>
                        )}
                    </div>

                    {/* Tax Estimate */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-4 border-b pb-2">Tax Estimate (Live)</h3>
                        {taxEstimate ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Recommendation</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        taxEstimate.recommendation === 'New Regime' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {taxEstimate.recommendation}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Old Regime Tax</span>
                                    <span>₹{taxEstimate.oldRegime?.taxPayable?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">New Regime Tax</span>
                                    <span>₹{taxEstimate.newRegime?.taxPayable?.toLocaleString()}</span>
                                </div>
                                {taxEstimate.savings > 0 && (
                                    <div className="mt-2 text-sm text-green-600 font-medium text-center bg-green-50 py-1 rounded">
                                        Potential Savings: ₹{taxEstimate.savings.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        ) : (
                             <p className="text-gray-400 text-sm">Insufficient data for estimate.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER LIST VIEW ---
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                {/* <Button variant="primary" size="sm">Export All</Button> */}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or mobile..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                            ) : users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                                                {user.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-green-500 h-1.5 rounded-full" 
                                                style={{ width: `${user.profileCompletion || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1 block">{user.profileCompletion || 0}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleViewClick(user)}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors" title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Basic) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
