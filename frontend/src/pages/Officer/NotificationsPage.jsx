import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellRing, AlertTriangle, ShieldAlert, User, Settings, CheckCheck, Clock, Archive, ChevronRight, X, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

const getIconForType = (type) => {
  switch (type) {
    case 'sla': return ShieldAlert;
    case 'citizen': return User;
    case 'system': return Settings;
    case 'assignment': return BellRing;
    default: return Info;
  }
};

const getColorForType = (type) => {
  switch (type) {
    case 'sla': return 'text-red-500 bg-red-50 border-red-100';
    case 'citizen': return 'text-blue-500 bg-blue-50 border-blue-100';
    case 'system': return 'text-slate-500 bg-slate-50 border-slate-200';
    case 'assignment': return 'text-amber-500 bg-amber-50 border-amber-100';
    default: return 'text-slate-500 bg-slate-50 border-slate-200';
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      // Map to add UI specific fields
      const enriched = data.map(n => ({
        ...n,
        icon: getIconForType(n.type),
        color: getColorForType(n.type),
        desc: n.message,
        time: new Date(n.createdAt).toLocaleString(),
        fullDetails: n.message,
        actionReq: n.type === 'sla' ? 'Immediate Action Required' : (n.type === 'system' ? 'None Required' : 'Review Details')
      }));
      setNotifications(enriched);
      if (enriched.length > 0 && !selectedNotif) {
        setSelectedNotif(enriched[0]);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      if (selectedNotif && selectedNotif.id === id) {
        setSelectedNotif({ ...selectedNotif, read: true });
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (selectedNotif) setSelectedNotif({ ...selectedNotif, read: true });
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly && n.read) return false;
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const totalUnread = notifications.filter(n => !n.read).length;
  const highPriority = notifications.filter(n => n.priority === 'High' || n.priority === 'Critical').length;
  const slaWarnings = notifications.filter(n => n.type === 'sla').length;

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Header & Smart Features Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" /> Notifications
          </h1>
          <p className="text-muted-foreground mt-1">Real-time alerts and updates for your assigned tasks.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 px-3 border-r border-slate-200">
            <Switch id="unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label htmlFor="unread-only" className="text-sm font-bold text-slate-600 cursor-pointer">Unread Only</Label>
          </div>
          <Select defaultValue="30days">
            <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0 font-semibold text-slate-600 h-8">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <div className="px-2">
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-blue-600 font-bold hover:bg-blue-50">
              <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total</p>
              <p className="text-xl font-black text-slate-800">{notifications.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-xl border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg relative">
              {totalUnread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              <BellRing className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Unread</p>
              <p className="text-xl font-black text-blue-600">{totalUnread}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">High Priority</p>
              <p className="text-xl font-black text-slate-800">{highPriority}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-xl bg-red-50 border-red-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert className="w-5 h-5"/></div>
            <div>
              <p className="text-xs font-bold text-red-700 uppercase">SLA Warnings</p>
              <p className="text-xl font-black text-red-700">{slaWarnings}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: Tabs & Feed */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm h-auto inline-flex overflow-x-auto w-full">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg py-2 px-4 text-sm font-semibold">All</TabsTrigger>
              <TabsTrigger value="assignment" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg py-2 px-4 text-sm font-semibold">Assignments</TabsTrigger>
              <TabsTrigger value="sla" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg py-2 px-4 text-sm font-semibold">SLA Alerts</TabsTrigger>
              <TabsTrigger value="citizen" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg py-2 px-4 text-sm font-semibold">Citizen</TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg py-2 px-4 text-sm font-semibold">System</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-semibold">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <CheckCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
                <p className="text-sm text-slate-500">You have no notifications in this category.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => { setSelectedNotif(notif); if(!notif.read) handleMarkAsRead(notif.id); }}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md
                    ${selectedNotif?.id === notif.id ? 'border-blue-400 ring-1 ring-blue-400 shadow-md' : 'border-slate-200 shadow-sm'}
                    ${!notif.read ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${notif.color}`}>
                      <notif.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-base truncate ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs font-semibold text-slate-400 shrink-0 whitespace-nowrap">{notif.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">{notif.desc}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        {notif.complaintId && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Ticket #{notif.complaintId}
                          </span>
                        )}
                        {notif.priority && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                            ${notif.priority === 'Critical' ? 'bg-red-100 text-red-700' : ''}
                            ${notif.priority === 'High' ? 'bg-amber-100 text-amber-700' : ''}
                            ${notif.priority === 'Medium' ? 'bg-slate-100 text-slate-600' : ''}
                            ${notif.priority === 'Low' ? 'bg-slate-50 text-slate-400' : ''}
                          `}>
                            {notif.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Sticky Detail Panel */}
        <div className="lg:col-span-2 lg:sticky lg:top-8">
          {selectedNotif ? (
            <Card className="border-slate-200 shadow-lg rounded-2xl overflow-hidden border-t-4 border-t-blue-500 relative">
              
              {/* Close Button for mobile (optional) */}
              <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 lg:hidden" onClick={() => setSelectedNotif(null)}>
                <X className="w-5 h-5" />
              </button>

              <CardContent className="p-0">
                <div className={`p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center`}>
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm mb-4 bg-white ${selectedNotif.color.split(' ')[0]} ${selectedNotif.color.split(' ')[2]}`}>
                      <selectedNotif.icon className="w-8 h-8" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedNotif.title}</h2>
                   <p className="text-sm font-semibold text-slate-500 mt-2 flex items-center gap-1.5"><Clock className="w-4 h-4"/> {selectedNotif.time}</p>
                </div>

                <div className="p-6 space-y-6">
                  
                  {selectedNotif.complaintId && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Related Ticket</p>
                        <p className="text-base font-black text-blue-900">ID: {selectedNotif.complaintId}</p>
                      </div>
                      <Link to={`/complaints/${selectedNotif.complaintId}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                          Go to Ticket <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Notification Details</h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedNotif.fullDetails}
                    </p>
                  </div>

                  <div>
                     <h4 className="text-sm font-bold text-slate-800 mb-2">Required Action</h4>
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                       <AlertTriangle className="w-4 h-4 text-amber-500" />
                       {selectedNotif.actionReq}
                     </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-slate-100">
                     <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                       <Clock className="w-4 h-4 mr-2" /> Snooze
                     </Button>
                     <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                       <Archive className="w-4 h-4 mr-2" /> Archive
                     </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm rounded-2xl h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 border-dashed">
              <Bell className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-600">No Notification Selected</p>
              <p className="text-sm text-slate-400 mt-1">Select an item from the feed to view full details.</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
