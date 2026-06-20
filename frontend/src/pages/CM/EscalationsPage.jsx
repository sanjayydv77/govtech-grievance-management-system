import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertOctagon, Mail, BellRing } from 'lucide-react';
import { cmService } from '../../services/cmService';

const EscalationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [escalations, setEscalations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await cmService.getEscalations();
        setEscalations(data);
      } catch (error) {
        console.error("Failed to load Escalations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 font-semibold">Loading Escalation Logs...</div>;
  }

  const handleIntervene = (ticketId) => {
    alert(`Initiating CM Office direct intervention for ${ticketId}. Notifications sent to Head of Department.`);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-purple-600" />
            Escalation Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Multi-level escalations for severely delayed or unresolved critical issues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-200 shadow-sm bg-purple-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
              <AlertOctagon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Total Escalated</p>
              <h3 className="text-3xl font-black text-slate-800">{escalations.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 shadow-sm bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
              <BellRing className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-1">CM Office Level (L3)</p>
              <h3 className="text-3xl font-black text-slate-800">
                {escalations.filter(e => e.escalationLevel.includes('Level 3')).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <Mail className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Secretary Level (L2)</p>
              <h3 className="text-3xl font-black text-slate-800">
                 {escalations.filter(e => e.escalationLevel.includes('Level 2')).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-lg text-slate-800">Escalation Log</CardTitle>
          <CardDescription>SLA breaches pushed to higher authority</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-bold text-slate-500 h-12 px-6">TICKET ID</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">DISTRICT</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">DEPARTMENT</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">DELAY</TableHead>
                <TableHead className="font-bold text-slate-500 h-12">ESCALATION LEVEL</TableHead>
                <TableHead className="font-bold text-slate-500 h-12 text-right px-6">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-semibold">No active escalations.</TableCell>
                </TableRow>
              ) : escalations.map((esc) => (
                <TableRow key={esc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-slate-800">{esc.ticketId}</TableCell>
                  <TableCell className="font-semibold text-slate-600">{esc.district}</TableCell>
                  <TableCell className="font-semibold text-slate-600">{esc.department}</TableCell>
                  <TableCell className="font-bold text-red-600">{esc.delay}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex border
                      ${esc.escalationLevel.includes('Level 3') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                    `}>
                      {esc.escalationLevel}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs shadow-sm" onClick={() => handleIntervene(esc.ticketId)}>
                      Intervene
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

export default EscalationsPage;
