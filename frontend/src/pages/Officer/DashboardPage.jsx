import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Activity, CheckCircle, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical, ShieldCheck } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { complaintService } from '../../services/complaintService';

// Custom Legend for Pie Charts
const renderCustomLegend = (props) => {
  const { payload } = props;
  const total = payload.reduce((acc, entry) => acc + entry.payload.value, 0);
  
  return (
    <ul className="flex flex-col gap-2.5 text-sm ml-4">
      {payload.map((entry, index) => {
        const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
        return (
          <li key={`item-${index}`} className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 font-medium w-24 truncate">{entry.value}</span>
            <span className="text-slate-800 font-bold w-8">{entry.payload.value}</span>
            <span className="text-slate-400 text-xs">({percentage}%)</span>
          </li>
        );
      })}
    </ul>
  );
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [kpiData, sData, dData, allComplaints] = await Promise.all([
          reportService.getDashboardKPIs(),
          reportService.getStatusDistribution(),
          reportService.getDistrictWorkload(),
          complaintService.getComplaints()
        ]);

        setKpis(kpiData);
        setStatusData(sData);
        setDistrictData(dData);

        // Calculate Priority Distribution dynamically
        const pData = { High: 0, Medium: 0, Low: 0, Critical: 0 };
        allComplaints.forEach(c => {
          if (pData[c.priority] !== undefined) pData[c.priority]++;
        });
        setPriorityData([
          { name: 'Critical', value: pData['Critical'], color: '#7f1d1d' },
          { name: 'High', value: pData['High'], color: '#EF4444' },
          { name: 'Medium', value: pData['Medium'], color: '#F59E0B' },
          { name: 'Low', value: pData['Low'], color: '#10B981' }
        ].filter(d => d.value > 0)); // Only show non-zero

        // Take 5 most recent active complaints
        const activeComplaints = allComplaints.filter(c => c.status !== 'Closed');
        setRecentComplaints(activeComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !kpis) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading dashboard data...</div>;
  }

  const summaryData = [
    { title: 'Total Assigned Complaints', value: kpis.totalAssigned, trend: '+12%', isPositive: true, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Pending Complaints', value: kpis.pending, trend: '+8%', isPositive: false, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'In Progress Complaints', value: kpis.inProgress, trend: '+15%', isPositive: true, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Resolved Complaints', value: kpis.resolved, trend: '+18%', isPositive: true, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'High Priority Complaints', value: kpis.highPriority, trend: '+5%', isPositive: false, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const performanceData = [
    { title: 'Average Resolution Time', value: '2.8 Days', trend: '-12%', isPositive: true, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'SLA Compliance', value: '82%', trend: '+8%', isPositive: true, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Escalated Complaints', value: '14', trend: '+3', isPositive: false, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Resolved This Week', value: kpis.resolved, trend: '+18%', isPositive: true, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const totalStatus = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const totalPriority = priorityData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-8 space-y-8 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Summary KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {summaryData.map((item, idx) => (
          <Card key={idx} className="border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 leading-tight w-24">{item.title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-2">{item.value}</h3>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                <span className={`flex items-center font-semibold ${item.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.isPositive ? <ArrowUpRight className="h-4 w-4 mr-0.5" /> : <ArrowUpRight className="h-4 w-4 mr-0.5" />}
                  {item.trend}
                </span>
                <span className="text-slate-400">from last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Status Distribution */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Complaint Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center p-0 pb-6 relative">
             <div className="h-[220px] w-full flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[50%]">
                 {renderCustomLegend({ payload: statusData.map(d => ({ value: d.name, color: d.color, payload: d })) })}
              </div>
            </div>
            <div className="absolute bottom-6 left-6 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-md">
              Total: {totalStatus}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center p-0 pb-6 relative">
            <div className="h-[220px] w-full flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[50%]">
                 {renderCustomLegend({ payload: priorityData.map(d => ({ value: d.name, color: d.color, payload: d })) })}
              </div>
            </div>
            <div className="absolute bottom-6 left-6 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-md">
              Total: {totalPriority}
            </div>
          </CardContent>
        </Card>

        {/* District Workload */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-800">District Workload</CardTitle>
            <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded border">This Month v</div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="complaints" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-[10px] text-slate-400 mt-2">Number of Complaints</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Performance Overview */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6">Performance Overview <span className="font-normal text-slate-400">(This Month)</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-x divide-slate-100">
          {performanceData.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-4 ${idx === 0 ? 'pr-6' : 'px-6'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{item.title}</p>
                <div className="flex items-end gap-3">
                  <h4 className="text-2xl font-bold text-slate-800 leading-none">{item.value}</h4>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs">
                  <span className={`flex items-center font-semibold ${item.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.isPositive ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                    {item.trend}
                  </span>
                  <span className="text-slate-400">from last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assigned Complaints Table */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-slate-50 py-5">
          <CardTitle className="text-base font-bold text-slate-800">Recent Assigned Complaints</CardTitle>
          <Link to="/complaints">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 rounded-lg font-semibold px-4">
              View All &gt;
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 h-10 px-6">TICKET ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-10">COMPLAINT</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-10">DISTRICT</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-10">PRIORITY</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-10">STATUS</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-10">DATE</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-10 text-right px-6">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4 text-sm font-semibold text-slate-500">{complaint.ticketId}</TableCell>
                  <TableCell className="py-4 text-sm font-bold text-slate-800">{complaint.title}</TableCell>
                  <TableCell className="py-4 text-sm font-medium text-slate-600">{complaint.district}</TableCell>
                  
                  {/* Priority Badge */}
                  <TableCell className="py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                      ${complaint.priority === 'Critical' ? 'bg-red-100 text-red-700' : ''}
                      ${complaint.priority === 'High' ? 'bg-red-50 text-red-600' : ''}
                      ${complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : ''}
                      ${complaint.priority === 'Low' ? 'bg-emerald-50 text-emerald-600' : ''}
                    `}>
                      {complaint.priority}
                    </span>
                  </TableCell>
                  
                  {/* Status Badge */}
                  <TableCell className="py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                      ${complaint.status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
                      ${complaint.status === 'In Progress' ? 'bg-purple-50 text-purple-600' : ''}
                      ${complaint.status === 'Assigned' ? 'bg-blue-50 text-blue-600' : ''}
                      ${complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : ''}
                      ${complaint.status === 'Closed' ? 'bg-slate-100 text-slate-600' : ''}
                    `}>
                      {complaint.status}
                    </span>
                  </TableCell>
                  
                  <TableCell className="py-4 text-sm font-medium text-slate-500">
                    {new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/complaints/${complaint.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold text-xs">
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/complaints/${complaint.id}`}>
                        <Button size="sm" className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm">
                          Update Status
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {recentComplaints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">No assigned complaints found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-50">
            <span className="text-xs font-medium text-slate-500">Showing 1 to {recentComplaints.length} of {kpis.totalAssigned} results</span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default DashboardPage;
