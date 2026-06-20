import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { cmService } from '../../services/cmService';

const CriticalIssuesPage = () => {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await cmService.getCriticalIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to load Critical Issues", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading Critical Issues...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Critical Issues & Emergencies
          </h1>
          <p className="text-muted-foreground mt-1">High-priority and SLA breached complaints requiring immediate governance intervention.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 shadow-sm bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-1">Total Critical</p>
              <h3 className="text-3xl font-black text-slate-800">{issues.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 shadow-sm bg-amber-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">SLA Breached</p>
              <h3 className="text-3xl font-black text-slate-800">{Math.max(0, issues.length - 1)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-sm bg-purple-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Emergency Escalations</p>
              <h3 className="text-3xl font-black text-slate-800">{issues.filter(i => i.priority === 'Critical').length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-lg text-slate-800">Active Critical Cases</CardTitle>
          <CardDescription>All currently open high-severity tickets</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-bold text-slate-500 h-12 px-6">TICKET ID</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">DEPARTMENT</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">DISTRICT</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">PRIORITY</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">STATUS</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">DELAY DURATION</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-right px-6">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500 font-semibold">No critical issues active at the moment.</TableCell>
                </TableRow>
              ) : issues.map((issue) => (
                <TableRow key={issue.id} className="border-b border-slate-50 hover:bg-red-50/30 transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-slate-800">{issue.ticketId}</TableCell>
                  <TableCell className="font-semibold text-slate-600">{issue.category}</TableCell>
                  <TableCell className="font-semibold text-slate-600">{issue.district}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                      ${issue.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                    `}>
                      {issue.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                     <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex border
                      ${issue.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-purple-50 text-purple-600 border-purple-100'}
                    `}>
                      {issue.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-red-600 flex items-center gap-1.5 pt-4">
                    <Clock className="w-4 h-4" /> 
                    {issue.priority === 'Critical' ? '48 Hours' : '3 Days'}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs shadow-sm" onClick={() => alert(`Opening governance details for ${issue.ticketId}`)}>
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
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

export default CriticalIssuesPage;
