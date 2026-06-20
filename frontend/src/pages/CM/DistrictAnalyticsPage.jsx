import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MapPin, ArrowUpRight, ArrowDownRight, Filter, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cmService } from '../../services/cmService';

const DistrictAnalyticsPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [allDistricts, setAllDistricts] = useState([]);
  const [singleDistrictDetails, setSingleDistrictDetails] = useState(null);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState(location.state?.selectedDistrict || null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedDistrictFilter) {
          const details = await cmService.getSingleDistrictDetails(selectedDistrictFilter);
          setSingleDistrictDetails(details);
        } else {
          const distData = await cmService.getDistrictAnalytics();
          setAllDistricts(distData);
        }
      } catch (error) {
        console.error("Failed to load District Analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDistrictFilter]);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading District Analytics...</div>;
  }

  // ==== ALL DISTRICTS COMPARATIVE VIEW ====
  const renderAllDistrictsView = () => {
    if (!allDistricts.length) return null;
    const topDistricts = [...allDistricts].sort((a, b) => b.resolutionRate - a.resolutionRate);
    const bestDistrict = topDistricts[0];
    const worstDistrict = topDistricts[topDistricts.length - 1];

    return (
      <div className="space-y-6">
        {/* Top Level Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-200 shadow-sm bg-emerald-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Top Performing District</p>
                <h3 className="text-2xl font-black text-slate-800">{bestDistrict.name}</h3>
                <p className="text-sm font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> {bestDistrict.resolutionRate}% Resolution Rate
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 shadow-sm bg-red-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-1">Attention Required</p>
                <h3 className="text-2xl font-black text-slate-800">{worstDistrict.name}</h3>
                <p className="text-sm font-semibold text-red-700 mt-2 flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" /> {worstDistrict.resolutionRate}% Resolution Rate
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center border-4 border-white">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* District Volume Chart */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Complaint Volume by District</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allDistricts} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} width={100} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total" name="Total Complaints" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* District Resolution Rate Chart */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Resolution Rate by District (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={allDistricts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="resolutionRate" name="Resolution Rate (%)" stroke="#10b981" strokeWidth={3} dot={{r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* District Ranking Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-800">District Performance Ranking</CardTitle>
            <CardDescription>Comprehensive metrics across all Delhi districts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-500 h-12 px-6">RANK</TableHead>
                  <TableHead className="font-bold text-slate-500 h-12">DISTRICT NAME</TableHead>
                  <TableHead className="font-bold text-slate-500 h-12 text-center">TOTAL COMPLAINTS</TableHead>
                  <TableHead className="font-bold text-slate-500 h-12 text-center">RESOLVED</TableHead>
                  <TableHead className="font-bold text-slate-500 h-12 text-center">CRITICAL ISSUES</TableHead>
                  <TableHead className="font-bold text-slate-500 h-12 text-right px-6">RESOLUTION RATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDistricts.map((d, idx) => (
                  <TableRow key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="px-6 py-4 font-bold text-slate-400">#{idx + 1}</TableCell>
                    <TableCell className="font-bold text-slate-800">{d.name}</TableCell>
                    <TableCell className="text-center font-semibold text-slate-600">{d.total}</TableCell>
                    <TableCell className="text-center font-semibold text-emerald-600">{d.resolved}</TableCell>
                    <TableCell className="text-center font-semibold text-red-600">{d.critical}</TableCell>
                    <TableCell className="text-right px-6">
                      <span className={`px-3 py-1 rounded-md text-sm font-bold
                        ${d.resolutionRate >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                          d.resolutionRate >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {d.resolutionRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==== SINGLE DISTRICT DEEP-DIVE VIEW ====
  const renderSingleDistrictView = () => {
    if (!singleDistrictDetails) return null;
    const { kpis, departments, criticalTickets } = singleDistrictDetails;

    return (
      <div className="space-y-6">
        {/* District Specific KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Card className="border-slate-200 shadow-sm border-b-4 border-b-blue-500">
              <CardContent className="p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Complaints</p>
                <h3 className="text-3xl font-black text-slate-800">{kpis.total}</h3>
              </CardContent>
           </Card>
           <Card className="border-slate-200 shadow-sm border-b-4 border-b-amber-500">
              <CardContent className="p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pending</p>
                <h3 className="text-3xl font-black text-amber-600">{kpis.pending}</h3>
              </CardContent>
           </Card>
           <Card className="border-slate-200 shadow-sm border-b-4 border-b-emerald-500">
              <CardContent className="p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolved</p>
                <h3 className="text-3xl font-black text-emerald-600">{kpis.resolved}</h3>
              </CardContent>
           </Card>
           <Card className="border-slate-200 shadow-sm border-b-4 border-b-red-500">
              <CardContent className="p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Critical Issues</p>
                <h3 className="text-3xl font-black text-red-600">{kpis.critical}</h3>
              </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown Chart */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg text-slate-800">Department Volume Breakdown</CardTitle>
              <CardDescription>Major complaint areas in {selectedDistrictFilter}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total" name="Total Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Critical Tickets Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-red-50 border-b border-red-100 shrink-0">
              <CardTitle className="text-lg text-red-800">Top Critical Escalations</CardTitle>
              <CardDescription className="text-red-600">Immediate attention required for these open tickets</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-slate-500 h-10 px-4">TICKET ID</TableHead>
                    <TableHead className="font-bold text-slate-500 h-10">DEPARTMENT</TableHead>
                    <TableHead className="font-bold text-slate-500 h-10 text-right px-4">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-slate-500">No critical tickets found.</TableCell>
                    </TableRow>
                  ) : criticalTickets.map((t, idx) => (
                    <TableRow key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                      <TableCell className="px-4 py-3 font-bold text-slate-800">{t.ticketId}</TableCell>
                      <TableCell className="font-semibold text-slate-600">{t.department}</TableCell>
                      <TableCell className="text-right px-4 font-black text-amber-600">{t.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            District Analytics
            {selectedDistrictFilter && (
              <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1 mt-1">
                <Filter className="w-4 h-4" /> Filtered: {selectedDistrictFilter}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedDistrictFilter 
              ? `Deep-dive analytics and critical issues for ${selectedDistrictFilter}`
              : "Geographical distribution of grievances and performance"}
          </p>
        </div>
        {selectedDistrictFilter && (
          <button 
            onClick={() => setSelectedDistrictFilter(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors"
          >
            <X className="w-4 h-4" /> Clear Filter
          </button>
        )}
      </div>

      {selectedDistrictFilter ? renderSingleDistrictView() : renderAllDistrictsView()}

    </div>
  );
};

export default DistrictAnalyticsPage;
