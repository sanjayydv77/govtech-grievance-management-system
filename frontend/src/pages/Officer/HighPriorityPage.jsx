import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Map, Clock, ShieldAlert, Siren, Filter, Activity, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';

const HighPriorityPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchHighPriority = async () => {
      setLoading(true);
      try {
        const allComplaints = await complaintService.getComplaints();
        // Filter only High and Critical
        const criticalHigh = allComplaints.filter(c => c.priority === 'Critical' || c.priority === 'High');
        
        // Compute mock SLA and Age based on createdAt
        const enriched = criticalHigh.map(c => {
          const hoursOld = Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60));
          const age = hoursOld > 24 ? `${Math.floor(hoursOld / 24)}d ${hoursOld % 24}h` : `${hoursOld}h`;
          
          let sla = 'On Track';
          if (c.priority === 'Critical' && hoursOld > 2) sla = 'Breached';
          if (c.priority === 'High' && hoursOld > 24) sla = 'Breached';

          return { ...c, age, sla };
        });

        setComplaints(enriched);
      } catch (error) {
        console.error('Failed to fetch high priority complaints', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHighPriority();
  }, []);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || c.priority.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pending' && c.status === 'Pending') ||
                          (statusFilter === 'in-progress' && c.status === 'In Progress');

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeCriticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed').length;
  const pendingAssignmentCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const breachedCount = complaints.filter(c => c.sla === 'Breached').length;

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <Siren className="w-8 h-8 text-red-600 animate-pulse" /> 
          High Priority Operations
        </h1>
        <p className="text-muted-foreground mt-1">Monitor and manage critical and high-severity incidents requiring immediate action.</p>
      </div>

      {/* Emergency Alert Banner */}
      {breachedCount > 0 && (
        <div className="bg-red-600 text-white rounded-xl shadow-lg p-4 flex items-center justify-between border border-red-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="flex items-center gap-3 relative z-10">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-bold text-lg leading-tight">CRITICAL ALERT: {breachedCount} Tickets Breached SLA</h3>
              <p className="text-sm text-red-100 mt-0.5">SLA breached on active critical incidents. Immediate dispatch required.</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-none relative z-10">
            Acknowledge All
          </Button>
        </div>
      )}

      {/* KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-100 shadow-sm rounded-2xl bg-gradient-to-br from-white to-red-50/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 border border-red-200">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Critical</p>
              <h2 className="text-3xl font-black text-slate-800 mt-1">{activeCriticalCount}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-sm rounded-2xl bg-gradient-to-br from-white to-amber-50/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 border border-amber-200">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
              <h2 className="text-3xl font-black text-slate-800 mt-1">{pendingAssignmentCount}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm rounded-2xl bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
              <h2 className="text-3xl font-black text-slate-800 mt-1">{inProgressCount}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Table Column */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Filters Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input 
                  placeholder="Search critical tickets..." 
                  className="bg-slate-50 h-10 border-slate-200" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="bg-slate-50 h-10 border-slate-200">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 h-10 border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-10 border-slate-200 text-slate-600 bg-white">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </CardContent>
          </Card>

          {/* Critical Table */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden border-t-4 border-t-red-500">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-b border-slate-100">
                    <TableHead className="font-bold text-slate-500 h-12 px-6">TICKET / AGE</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12">COMPLAINT</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12">SEVERITY</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12">STATUS</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12">SLA STATUS</TableHead>
                    <TableHead className="text-right font-bold text-slate-500 h-12 px-6">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-slate-500">Loading high priority tickets...</TableCell>
                    </TableRow>
                  ) : filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-slate-500">No high priority tickets found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((ticket) => (
                      <TableRow key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        
                        <TableCell className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{ticket.ticketId}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ticket.age}
                          </p>
                        </TableCell>

                        <TableCell className="py-4">
                          <p className="text-sm font-bold text-slate-800">{ticket.title}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{ticket.district}</p>
                        </TableCell>

                        <TableCell className="py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                            ${ticket.priority === 'Critical' ? 'bg-red-600 text-white shadow-sm' : 'bg-orange-50 text-orange-600 border border-orange-100'}
                          `}>
                            {ticket.priority}
                          </span>
                        </TableCell>

                        <TableCell className="py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border
                            ${ticket.status === 'Pending' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-700 bg-slate-100 border-slate-200'}
                          `}>
                            {ticket.status}
                          </span>
                        </TableCell>

                        <TableCell className="py-4">
                          {ticket.sla === 'Breached' ? (
                            <span className="text-xs font-bold text-red-600 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Breached</span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> On Track</span>
                          )}
                        </TableCell>

                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/complaints/${ticket.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link to={`/complaints/${ticket.id}`}>
                              <Button size="sm" className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm">
                                Take Action
                              </Button>
                            </Link>
                          </div>
                        </TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidecards Column */}
        <div className="space-y-6">
          
          {/* SLA Overview Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" /> SLA Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Critical SLA Limit</p>
                <p className="text-xl font-black mt-1">2 Hours</p>
              </div>
              <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                <p className="text-xs font-semibold text-red-200 uppercase tracking-wider">Currently Breached</p>
                <p className="text-xl font-black text-white mt-1">{breachedCount} Tickets</p>
              </div>
              <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30">
                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">SLA Compliance</p>
                <p className="text-xl font-black text-white mt-1">
                  {complaints.length > 0 ? Math.round(((complaints.length - breachedCount) / complaints.length) * 100) : 100}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Map View Placeholder */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Map className="w-4 h-4 text-slate-500" /> Active Hotspots
              </CardTitle>
            </CardHeader>
            <div className="h-48 bg-[#e5e7eb] relative flex items-center justify-center overflow-hidden">
              {/* Fake Map Grid Pattern */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              
              {/* Fake Map Markers */}
              <div className="absolute top-12 left-12 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-ping"></div>
              <div className="absolute top-12 left-12 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md"></div>
              
              <div className="absolute bottom-16 right-20 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md"></div>
              <div className="absolute top-24 right-12 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-md"></div>
              
              <div className="relative z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center">
                <Map className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Map View Offline</p>
                <p className="text-[10px] text-slate-500 mt-0.5">API Key Required for live GIS</p>
              </div>
            </div>
            <div className="p-3 bg-white flex justify-center">
               <Button variant="ghost" size="sm" className="text-xs font-bold text-blue-600 hover:bg-blue-50">Open Full Map <ChevronRight className="w-3 h-3 ml-1"/></Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default HighPriorityPage;
