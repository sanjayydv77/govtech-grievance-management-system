import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { cmService } from '../../services/cmService';

const TrendsInsightsPage = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await cmService.getTrendsAndInsights();
        setInsights(data);
      } catch (error) {
        console.error("Failed to load Trends & Insights", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading AI Insights...</div>;
  }

  const getIconForType = (type) => {
    switch(type) {
      case 'warning': return <TrendingUp className="w-6 h-6 text-amber-500" />;
      case 'success': return <TrendingUp className="w-6 h-6 text-emerald-500" />;
      case 'danger': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'info': default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColorForType = (type) => {
    switch(type) {
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'danger': return 'bg-red-50 border-red-100';
      case 'info': default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-600" />
            AI Trends & Insights
          </h1>
          <p className="text-muted-foreground mt-1">Automated analysis and actionable intelligence derived from statewide grievance data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
        {insights.map((insight, idx) => (
          <Card key={idx} className={`shadow-sm border ${getBgColorForType(insight.type)} transition-all hover:shadow-md`}>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
                {getIconForType(insight.type)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-snug">{insight.text}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <BrainCircuit className="w-3 h-3" /> Auto-Generated Insight
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decorative large insight card */}
      <Card className="border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden relative mt-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BrainCircuit className="w-48 h-48" />
        </div>
        <CardContent className="p-10 relative z-10">
          <h2 className="text-2xl font-black mb-4">Strategic Recommendation</h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Based on the current trajectory, it is highly recommended to allocate additional quick response teams to <strong>East Delhi</strong> and <strong>South Delhi</strong> over the weekend. Historical patterns suggest a 15% spike in electricity-related complaints during the upcoming heatwave.
          </p>
          <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
            Authorize Preemptive Deployment
          </button>
        </CardContent>
      </Card>

    </div>
  );
};

export default TrendsInsightsPage;
