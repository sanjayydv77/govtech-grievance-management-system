import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Flag, BarChart2, Bell, Settings, LogOut, Shield, Menu, Building2, Archive, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';



const OfficerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Load officer session
    const sessionStr = localStorage.getItem('officerSession');
    if (sessionStr) {
      setOfficer(JSON.parse(sessionStr));
    }

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleNotificationClick = async (notification) => {
    await notificationService.markAsRead(notification.id);
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setIsDropdownOpen(false);
    if (notification.complaintId) {
      navigate(`/complaints/${notification.complaintId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem('officerSession');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Complaints', path: '/complaints', icon: FileText },
    { name: 'High Priority', path: '/high-priority', icon: Flag },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications.length > 0 ? unreadNotifications.length : null },
    { name: 'History', path: '/history', icon: Archive },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F5F7FB] text-foreground font-sans">
      {/* Dark Navy Sidebar */}
      <aside className="w-[280px] bg-[#0A1930] text-slate-300 border-r border-[#152a4f] flex flex-col relative overflow-hidden shrink-0 shadow-2xl z-20">
        
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3 relative z-10">
          <div className="bg-white/10 text-white p-2 rounded-xl backdrop-blur-md border border-white/5 shadow-sm">
            <Shield size={26} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-tight leading-none">GovTech</h1>
            <p className="text-[11px] text-blue-200/70 font-medium uppercase tracking-wider mt-1">Officer Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 relative z-10 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>

        {/* India Gate Silhouette */}
        <div className="absolute top-[65%] left-0 right-0 w-full -translate-y-1/2 opacity-10 pointer-events-none mix-blend-screen">
          <img src="https://t4.ftcdn.net/jpg/07/24/54/37/360_F_724543702_X6g0dRWzWtEFPWXoiHAzXwZWnG3xKLxp.jpg" alt="India Gate" className="w-full object-cover scale-150" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FB]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Officer Dashboard</h2>
              <p className="text-sm text-slate-500 mt-0.5">Welcome back, {officer?.name || 'Officer'}! Here's what's happening today.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Department Indicator */}
            {officer && (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border px-4 py-2 rounded-xl text-sm font-medium text-slate-700">
                <Building2 size={16} className="text-slate-400" />
                {officer.department}
              </div>
            )}
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                className="relative p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Bell size={22} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>
              
              {/* Notification Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadNotifications.length > 0 && (
                      <button 
                        className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        onClick={handleMarkAllRead}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {unreadNotifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                        <Bell className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm font-semibold">No new notifications</p>
                        <p className="text-xs mt-1 text-slate-400">You're all caught up!</p>
                      </div>
                    ) : (
                      unreadNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" 
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                              ${notification.type === 'assignment' ? 'bg-blue-100 text-blue-600' : ''}
                              ${notification.type === 'sla' ? 'bg-red-100 text-red-600' : ''}
                              ${notification.type === 'system' ? 'bg-slate-100 text-slate-600' : ''}
                              ${notification.type === 'citizen' ? 'bg-emerald-100 text-emerald-600' : ''}
                              ${!notification.type ? 'bg-blue-100 text-blue-600' : ''}
                            `}>
                               <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-800 leading-tight">{notification.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-snug">{notification.message}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-2">{new Date(notification.createdAt).toLocaleString('en-GB')}</p>
                            </div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Link to="/notifications" className="text-sm font-bold text-blue-600 hover:underline" onClick={() => setIsDropdownOpen(false)}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile Block */}
            {officer && (
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <img 
                  src={officer.avatar} 
                  alt={officer.name} 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100"
                />
                <div className="hidden xl:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{officer.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Assistant Engineer</p>
                </div>
              </div>
            )}
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

export default OfficerLayout;
