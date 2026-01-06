import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        // { icon: PieChart, label: 'Analytics', path: '/admin/analytics' },
        // { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white border-r border-slate-700 hidden md:flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-700 flex items-center gap-2">
                    <ShieldCheck className="text-blue-400" size={24} />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                        Admin Panel
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            // end={item.path === '/admin/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header (TODO) */}
                <div className="md:hidden bg-slate-900 p-4 text-white flex justify-between items-center">
                    <span className="font-bold">Admin Panel</span>
                    {/* Add mobile menu toggle here */}
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
