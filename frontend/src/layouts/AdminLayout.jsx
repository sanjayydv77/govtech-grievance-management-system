import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── SVG Icon Components ───────────────────────────────────────
const Icon = {
    Overview: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
    ),
    Complaints: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    Officers: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Shield: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Logout: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    ChevronRight: () => (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
};

const navLinks = [
    { name: 'Overview',        path: '/dashboard/admin',             icon: Icon.Overview,    end: true  },
    { name: 'All Complaints',  path: '/dashboard/admin/complaints',  icon: Icon.Complaints,  end: false },
    { name: 'Manage Officers', path: '/dashboard/admin/officers',    icon: Icon.Officers,    end: false },
    { name: 'User Management', path: '/dashboard/admin/users',       icon: Icon.Users,       end: false },
];

const pageTitles = {
    '/dashboard/admin':            { title: 'System Overview',    sub: 'Real-time snapshot of all portal activity' },
    '/dashboard/admin/complaints': { title: 'All Complaints',     sub: 'View, filter, assign and manage every complaint' },
    '/dashboard/admin/officers':   { title: 'Manage Officers',    sub: 'Officer assignments, activity and performance' },
    '/dashboard/admin/users':      { title: 'User Management',    sub: 'Manage all registered users on the portal' },
};

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const pageInfo = pageTitles[location.pathname] || { title: 'Admin Panel', sub: 'Delhi CM Grievance Portal' };

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">

            {/* ────── Sidebar ────── */}
            <aside className="w-64 bg-slate-900 flex flex-col fixed h-full shadow-2xl z-20 flex-shrink-0">

                {/* Logo / Brand */}
                <div className="px-5 py-5 border-b border-slate-800/70">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                            <Icon.Shield />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white leading-tight tracking-tight">CM Portal</p>
                            <p className="text-xs font-medium text-indigo-400 tracking-wide">Admin Control Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Navigation</p>
                    {navLinks.map(({ name, path, icon: NavIcon, end }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                        <NavIcon />
                                    </span>
                                    <span className="flex-1 truncate">{name}</span>
                                    {isActive && (
                                        <span className="text-indigo-300 flex-shrink-0">
                                            <Icon.ChevronRight />
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* System Info */}
                <div className="px-4 py-3 border-t border-slate-800/70 border-b border-slate-800/70">
                    <div className="bg-slate-800/50 rounded-xl px-3 py-2.5">
                        <p className="text-xs text-slate-500 font-medium mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="text-xs text-emerald-400 font-semibold">All Systems Operational</span>
                        </div>
                    </div>
                </div>

                {/* User Profile + Logout */}
                <div className="p-3 space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <span className="text-xs bg-indigo-900/80 text-indigo-300 px-1.5 py-0.5 rounded font-medium flex-shrink-0">ADMIN</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-xl text-sm font-medium transition-all duration-200 group"
                    >
                        <span className="flex-shrink-0 group-hover:text-red-400 transition-colors"><Icon.Logout /></span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ────── Main Content ────── */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0 shadow-sm">
                    <div>
                        <h1 className="text-base font-bold text-slate-800 leading-tight">{pageInfo.title}</h1>
                        <p className="text-xs text-slate-400 mt-0.5">{pageInfo.sub}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-700">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-slate-400">System Administrator</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
