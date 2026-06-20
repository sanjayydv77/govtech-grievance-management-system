import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Map } from 'lucide-react';
import { cmService } from '../../services/cmService';
import DelhiHeatmap from '../../components/cm/DelhiHeatmap';
import DistrictRankingCard from '../../components/cm/DistrictRankingCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CMDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewData, distData, deptData] = await Promise.all([
          cmService.getExecutiveOverview(),
          cmService.getDistrictAnalytics(),
          cmService.getDepartmentPerformance()
        ]);
        setOverview(overviewData);
        setDistricts(distData);
        setDepartments(deptData);
      } catch (error) {
        console.error("Failed to load CM Dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !overview) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading Executive Analytics...</div>;
  }

  const topProblemDistricts = [...districts].sort((a, b) => b.total - a.total).slice(0, 3);
  const topPerformers = [...departments].sort((a, b) => b.resolutionRate - a.resolutionRate).slice(0, 3);
  const worstPerformers = [...departments].sort((a, b) => a.resolutionRate - b.resolutionRate).slice(0, 3);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Executive Overview</h1>
          <p className="text-muted-foreground mt-1">State-level grievance redressal analytics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Complaints</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-slate-800">{overview.totalComplaints}</h3>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm border-b-4 border-b-amber-500">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-slate-800">{overview.activeComplaints}</h3>
              <Activity className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm border-b-4 border-b-emerald-500">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolved</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-slate-800">{overview.resolvedComplaints}</h3>
              <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-slate-800 text-white">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Rate</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-white">{overview.resolutionRate}%</h3>
              <TrendingUp className="w-8 h-8 text-emerald-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm border-b-4 border-b-red-500">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Critical Issues</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-red-600">{overview.criticalIssues}</h3>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm border-b-4 border-b-purple-500">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Escalated</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-purple-600">{overview.escalatedComplaints}</h3>
              <AlertTriangle className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Centerpiece */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-600" /> Delhi Grievance Heatmap
              </CardTitle>
              <CardDescription>Live geographical concentration of statewide complaints</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[450px] w-full relative z-0">
                <DelhiHeatmap districtData={districts} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <div className="h-[535px]">
            <DistrictRankingCard districtData={districts} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Department Volume Chart */}
        <Card className="border-slate-200 shadow-sm h-[450px] flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-lg">Complaint Volume by Department</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" name="Total Complaints" fill="#0B1120" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 h-[450px]">
          {/* Best Performing Departments */}
          <Card className="border-slate-200 shadow-sm flex-1 flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-lg text-slate-800">Best Performing Departments</CardTitle>
              <CardDescription>Highest resolution rates</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {topPerformers.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <h4 className="text-sm font-bold text-slate-800">{d.name}</h4>
                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{d.resolutionRate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Worst Performing Departments */}
          <Card className="border-slate-200 shadow-sm flex-1 flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-lg text-slate-800">Worst Performing Departments</CardTitle>
              <CardDescription>Lowest resolution rates</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {worstPerformers.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <h4 className="text-sm font-bold text-slate-800">{d.name}</h4>
                    <span className="text-sm font-black text-red-600 bg-red-50 px-2 py-1 rounded">{d.resolutionRate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default CMDashboardPage;
