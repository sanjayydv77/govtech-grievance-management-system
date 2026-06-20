import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

const DistrictRankingCard = ({ districtData }) => {
  if (!districtData || districtData.length === 0) return null;

  // Derive Rankings
  const topProblemDistricts = [...districtData].sort((a, b) => b.total - a.total).slice(0, 5);
  const highestResRate = [...districtData].sort((a, b) => b.resolutionRate - a.resolutionRate)[0];
  const lowestResRate = [...districtData].sort((a, b) => a.resolutionRate - b.resolutionRate)[0];
  const mostCritical = [...districtData].sort((a, b) => b.critical - a.critical)[0];

  return (
    <Card className="border-slate-200 shadow-sm flex flex-col h-full">
      <CardHeader className="bg-slate-50 border-b border-slate-100 shrink-0">
        <CardTitle className="text-lg text-slate-800">District Insights</CardTitle>
        <CardDescription>Live geographical rankings</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="p-5 space-y-6">
          
          {/* Top 5 Problem Districts */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" /> Top 5 Problem Districts
            </h4>
            <div className="space-y-3">
              {topProblemDistricts.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${i === 0 ? 'bg-red-100 text-red-600' : 
                        i === 1 ? 'bg-orange-100 text-orange-600' : 
                        i === 2 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}
                    `}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none">{d.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">{d.total} Complaints</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Quick Stats */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Performance Extremes</h4>
            <div className="grid grid-cols-1 gap-3">
              
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Highest Res Rate</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{highestResRate.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-700">{highestResRate.resolutionRate}%</p>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Lowest Res Rate</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{lowestResRate.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-amber-700">{lowestResRate.resolutionRate}%</p>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Most Critical Issues</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{mostCritical.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-red-700">{mostCritical.critical}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default DistrictRankingCard;
