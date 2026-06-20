import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Overview', path: '/dashboard/admin' },
        { name: 'Manage Officers', path: '/dashboard/admin/officers' },
        { name: 'System Logs', path: '/dashboard/admin/logs' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-xl z-20">
                <div className="p-6 border-b border-slate-800 flex items-center justify-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100">GovTech Admin</h2>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end={link.path === '/dashboard/admin'}
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-64 min-w-0 bg-slate-50">
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-slate-800">Dashboard Overview</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-700">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-inner cursor-pointer hover:bg-blue-700 transition-colors">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
