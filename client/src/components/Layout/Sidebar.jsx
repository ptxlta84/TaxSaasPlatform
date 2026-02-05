import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Calculator, PieChart, Settings, LogOut, FileStack, Home, Globe, Users, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { t } = useTranslation('common');
    
    // Robust Admin Check
    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.email === 'sudiptarafdar39@gmail.com';

    const navItems = [
        ...(isAdmin ? [{ icon: Shield, label: 'Admin Panel', path: '/admin/dashboard' }] : []),
        { icon: LayoutDashboard, label: t('nav.overview'), path: '/dashboard' },
        { icon: User, label: 'Tax Profile', path: '/dashboard/profile' },
        { icon: Calculator, label: 'Tax Estimator', path: '/dashboard/estimate' },
        { icon: FileStack, label: 'My Documents', path: '/dashboard/documents' },
        { icon: Calculator, label: t('nav.income_tax'), path: '/dashboard/income-tax' },
        { icon: FileText, label: 'Deductions (80C/80D)', path: '/dashboard/deductions' },
        { icon: FileText, label: t('nav.itr2_wizard'), path: '/dashboard/itr-2-filing' },
        { icon: PieChart, label: t('nav.capital_gains'), path: '/dashboard/capital-gains' },
        { icon: Home, label: t('nav.house_property'), path: '/dashboard/house-property' },
        { icon: Globe, label: t('nav.foreign_assets'), path: '/dashboard/foreign-assets' },
        { icon: Users, label: t('nav.ca_services'), path: '/dashboard/ca-services' },
        { icon: PieChart, label: t('nav.gst_registration'), path: '/dashboard/gst-registration' },
        { icon: FileStack, label: t('nav.upload_form16'), path: '/dashboard/upload-form16' },
        { icon: Settings, label: t('nav.settings'), path: '/dashboard/settings' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">TaxSaas</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'} // Exact match for root dashboard
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={20} />
                    {t('logout')}
                </button>
                {/* Debug / Role Indicator */}
                <div className="mt-2 text-xs text-center text-gray-400">
                    Role: {user?.role || 'None'} {user?.email === 'sudiptarafdar39@gmail.com' ? '(Super)' : ''}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
