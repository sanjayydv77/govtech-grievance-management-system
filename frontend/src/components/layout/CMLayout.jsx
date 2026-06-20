import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, MapPin, Building2, AlertTriangle, 
  TrendingUp, FileSignature, AlertOctagon, Settings, Shield, Globe
} from 'lucide-react';

const CMLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Executive Overview', path: '/cm/dashboard', icon: LayoutDashboard },
    { name: 'District Analytics', path: '/cm/district-analytics', icon: MapPin },
    { name: 'Department Performance', path: '/cm/department-performance', icon: Building2 },
    { name: 'Critical Issues', path: '/cm/critical-issues', icon: AlertTriangle },
    { name: 'Trends & Insights', path: '/cm/trends-insights', icon: TrendingUp },
    { name: 'Accountability Reports', path: '/cm/accountability-reports', icon: FileSignature },
    { name: 'Escalations', path: '/cm/escalations', icon: AlertOctagon },
    { name: 'Settings', path: '/cm/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Premium Dark Sidebar */}
      <aside className="w-[280px] bg-[#0B1120] text-slate-300 border-r border-slate-800 flex flex-col relative overflow-hidden shrink-0 shadow-2xl z-20">
        
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3 relative z-10 border-b border-slate-800/50 mb-4">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Globe size={26} className="text-amber-500" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide uppercase leading-none">Command Center</h1>
            <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mt-1">CM Office</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 relative z-10 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) || (item.path === '/cm/dashboard' && location.pathname === '/cm');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-amber-500' : 'text-slate-500'} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security Badge */}
        <div className="p-6 relative z-10 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border border-slate-800">
            <Shield size={20} className="text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-white tracking-wider">Level 5 Clearance</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Secure Session</p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Executive Dashboard</h2>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">State-Level Grievance Governance & Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">Chief Minister's Office</span>
              <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Live Analytics Active</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-0 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CMLayout;
