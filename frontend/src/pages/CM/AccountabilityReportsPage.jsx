import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Download, Building2, MapPin, Trophy, AlertTriangle } from 'lucide-react';
import { cmService } from '../../services/cmService';

const AccountabilityReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptData, distData] = await Promise.all([
          cmService.getDepartmentPerformance(),
          cmService.getDistrictAnalytics()
        ]);
        setDepartments(deptData);
        setDistricts(distData);
      } catch (error) {
        console.error("Failed to load Accountability Reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !departments.length || !districts.length) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading Accountability Data...</div>;
  }

  const bestDept = [...departments].sort((a,b) => b.resolutionRate - a.resolutionRate)[0];
  const worstDept = [...departments].sort((a,b) => a.resolutionRate - b.resolutionRate)[0];
  
  const bestDist = [...districts].sort((a,b) => b.resolutionRate - a.resolutionRate)[0];
  const worstDist = [...districts].sort((a,b) => a.resolutionRate - b.resolutionRate)[0];

  const handleDownload = (type) => {
    alert(`Generating ${type} Official Accountability Report... (Mock Action)`);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-blue-600" />
            Accountability Reports
          </h1>
          <p className="text-muted-foreground mt-1">Official performance scorecards for state departments and districts.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold" onClick={() => handleDownload('Monthly')}>
            <Download className="w-4 h-4 mr-2" /> Monthly Report
          </Button>
          <Button className="bg-slate-800 hover:bg-slate-700 text-white font-bold" onClick={() => handleDownload('Quarterly')}>
            <Download className="w-4 h-4 mr-2" /> Quarterly Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Department Accountability */}
        <Card className="border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Building2 className="w-48 h-48" />
          </div>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-xl text-slate-800">Department Performance</CardTitle>
            <CardDescription>Evaluation of civic bodies</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-full shrink-0">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Top Performing Department</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800">{bestDept.name}</h3>
                  <span className="text-lg font-black text-emerald-700">{bestDept.resolutionRate}%</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">Commended for exceeding SLA targets and maintaining the highest resolution efficiency across the state.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Underperforming Department</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800">{worstDept.name}</h3>
                  <span className="text-lg font-black text-red-700">{worstDept.resolutionRate}%</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">Flagged for official review. Consistently missing SLA targets with growing backlog of unresolved complaints.</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* District Accountability */}
        <Card className="border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <MapPin className="w-48 h-48" />
          </div>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-xl text-slate-800">District Performance</CardTitle>
            <CardDescription>Evaluation of geographic administration</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-full shrink-0">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Top Performing District</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800">{bestDist.name}</h3>
                  <span className="text-lg font-black text-emerald-700">{bestDist.resolutionRate}%</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">District administration has successfully managed grievances with prompt cross-department coordination.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Underperforming District</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800">{worstDist.name}</h3>
                  <span className="text-lg font-black text-amber-700">{worstDist.resolutionRate}%</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">Requires immediate attention. Escalation rates are high and local coordination is causing resolution delays.</p>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AccountabilityReportsPage;
