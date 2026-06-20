import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { Building2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { cmService } from '../../services/cmService';

const DepartmentPerformancePage = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const deptData = await cmService.getDepartmentPerformance();
        setDepartments(deptData);
      } catch (error) {
        console.error("Failed to load Department Performance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !departments.length) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading Department Performance...</div>;
  }

  const topDepartment = [...departments].sort((a, b) => b.resolutionRate - a.resolutionRate)[0];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Department Performance</h1>
          <p className="text-muted-foreground mt-1">Evaluate resolution efficiency and workload distribution across civic bodies</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 shadow-sm bg-blue-50">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Top Department</p>
                  <h3 className="text-2xl font-black text-slate-800">{topDepartment.name}</h3>
                </div>
                <Building2 className="w-8 h-8 text-blue-500 opacity-50" />
             </div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-200 shadow-sm bg-emerald-50">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Best Resolution Rate</p>
                  <h3 className="text-2xl font-black text-slate-800">{topDepartment.resolutionRate}%</h3>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
             </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Fastest Resolution</p>
                  <h3 className="text-2xl font-black text-slate-800">
                    {[...departments].sort((a,b) => a.avgResTimeDays - b.avgResTimeDays)[0].avgResTimeDays} Days
                  </h3>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-50" />
             </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-sm bg-purple-50">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Highest Workload</p>
                  <h3 className="text-2xl font-black text-slate-800">
                     {[...departments].sort((a,b) => b.total - a.total)[0].name}
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Radar Comparison */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Department Comparison</CardTitle>
            <CardDescription>Relative performance across total vs resolved metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={departments}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Total Workload" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Resolved" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vertical Ranking Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Resolution Rate Ranking (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} width={120} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="resolutionRate" name="Resolution Rate (%)" fill="#0B1120" radius={[0, 4, 4, 0]} barSize={24}>
                    {departments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.resolutionRate >= 80 ? '#10b981' : entry.resolutionRate >= 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Metrics Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-800">Comprehensive Department Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-bold text-slate-500 h-12 px-6">DEPARTMENT</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-center">TOTAL</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-center">RESOLVED</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-center">PENDING</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-center">AVG RESOLUTION TIME</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-right px-6">RESOLUTION RATE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d, idx) => (
                <TableRow key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    {d.name}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-slate-600">{d.total}</TableCell>
                  <TableCell className="text-center font-semibold text-emerald-600">{d.resolved}</TableCell>
                  <TableCell className="text-center font-semibold text-amber-600">{d.pending}</TableCell>
                  <TableCell className="text-center font-semibold text-slate-600">{d.avgResTimeDays} Days</TableCell>
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

export default DepartmentPerformancePage;
