import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, FileText, FileSpreadsheet, TrendingUp, CheckCircle, Clock, AlertTriangle, Activity, RefreshCw, BarChart2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { complaintService } from '../../services/complaintService';

const STATUS_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#64748b'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [severityMetrics, setSeverityMetrics] = useState([]);
  const [historyKpis, setHistoryKpis] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiData, trend, dist, stat, sev, hist] = await Promise.all([
          reportService.getDashboardKPIs(),
          reportService.getTrendData(),
          reportService.getDistrictWorkload(),
          reportService.getStatusDistribution(),
          reportService.getSeverityMetrics(),
          reportService.getHistoryKPIs()
        ]);
        setKpis(kpiData);
        setTrendData(trend);
        setDistrictData(dist);
        setStatusData(stat);
        setSeverityMetrics(sev);
        setHistoryKpis(hist);
      } catch (error) {
        console.error("Failed to load report data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !kpis) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading reports...</div>;
  }

  const activeStatusData = statusData.filter(d => d.value > 0);
  const totalStatus = activeStatusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans pb-16">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-600" /> Performance Reports
          </h1>
          <p className="text-muted-foreground mt-1">Monitor your departmental productivity, SLA compliance, and workloads.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="bg-white border-slate-200 h-10 w-40 font-semibold text-slate-600">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-semibold gap-2">
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 font-semibold gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Monthly Report
          </Button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Closed</p>
                <h3 className="text-3xl font-black text-slate-800">{historyKpis.totalClosed}</h3>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Active Resolved</p>
                <h3 className="text-3xl font-black text-emerald-600">{kpis.resolved}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Pending/In Progress</p>
                <h3 className="text-3xl font-black text-amber-500">{kpis.pending + kpis.inProgress}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Resolution</p>
                <h3 className="text-3xl font-black text-slate-800">{historyKpis.avgResolutionDays} <span className="text-lg font-bold text-slate-400">Days</span></h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Performance Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Activity className="w-16 h-16 text-white" /></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">Resolution Rate</p>
          <p className="text-2xl font-black text-white mt-1 relative z-10">
            {kpis.totalAssigned > 0 ? Math.round(((kpis.resolved + kpis.closed) / kpis.totalAssigned) * 100) : 0}%
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle className="w-16 h-16 text-emerald-400" /></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">SLA Compliance</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 relative z-10">94.5%</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><AlertTriangle className="w-16 h-16 text-red-400" /></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">High Priority Resolved</p>
          <p className="text-2xl font-black text-white mt-1 relative z-10">
             {severityMetrics.reduce((acc, curr) => acc + curr.resolved, 0)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><RefreshCw className="w-16 h-16 text-amber-400" /></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">Reopened Cases</p>
          <p className="text-2xl font-black text-amber-400 mt-1 relative z-10">1</p>
        </div>
      </div>

      {/* Visualizations Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resolution Trend Area Chart */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">Resolution Trend (Monthly)</CardTitle>
            <CardDescription>Performance tracking over the last 4 weeks.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}/>
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
                  <Area type="monotone" dataKey="received" name="Received" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Status Donut */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">Status Distribution</CardTitle>
            <CardDescription>Current state of assigned tickets.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={activeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {activeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-y-3 gap-x-2">
                {activeStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800">{totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

      </div>

      {/* Visualizations Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Workload Bar Chart */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">District Workload</CardTitle>
            <CardDescription>Complaints assigned per district.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="complaints" name="Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* High Priority Performance Table */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
           <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50">
            <CardTitle className="text-lg text-slate-800">Priority Resolution Efficiency</CardTitle>
            <CardDescription>Resolution rates broken down by severity.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="font-bold text-slate-500 h-12 px-6">SEVERITY</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12 text-center">TOTAL</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12 text-center">RESOLVED</TableHead>
                    <TableHead className="font-bold text-slate-500 h-12 text-right px-6">RATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {severityMetrics.map((item, idx) => (
                    <TableRow key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <TableCell className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                          ${item.severity === 'Critical' ? 'bg-red-50 text-red-600' : ''}
                          ${item.severity === 'High' ? 'bg-amber-50 text-amber-600' : ''}
                          ${item.severity === 'Medium' ? 'bg-blue-50 text-blue-600' : ''}
                          ${item.severity === 'Low' ? 'bg-emerald-50 text-emerald-600' : ''}
                        `}>
                          {item.severity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-slate-600">{item.total}</TableCell>
                      <TableCell className="text-center font-semibold text-slate-600">{item.resolved}</TableCell>
                      <TableCell className="text-right px-6 font-black text-slate-800">{item.rate}</TableCell>
                    </TableRow>
                  ))}
                  {severityMetrics.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-4 text-center text-slate-500">No priority metrics available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default ReportsPage;
