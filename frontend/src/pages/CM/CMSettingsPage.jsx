import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Bell, User, Lock, Mail } from 'lucide-react';

const CMSettingsPage = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-600" />
            Command Center Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage executive dashboard preferences and security configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Profile Configuration
            </CardTitle>
            <CardDescription>Update your executive profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Display Name</label>
              <input type="text" defaultValue="Chief Minister's Office" className="w-full mt-1 p-2 border border-slate-300 rounded-md bg-slate-50" readOnly />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Contact Email</label>
              <input type="email" defaultValue="cm.office@delhi.gov.in" className="w-full mt-1 p-2 border border-slate-300 rounded-md bg-slate-50" readOnly />
            </div>
            <Button className="mt-2" variant="outline">Request Details Update</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" /> Alert Preferences
            </CardTitle>
            <CardDescription>Configure threshold alerts for critical issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">SLA Breach Alerts (Level 3)</p>
                <p className="text-sm text-slate-500">Get notified immediately when an SLA is breached.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Daily Executive Summary</p>
                <p className="text-sm text-slate-500">Receive an email digest of statewide performance.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <Button className="mt-2 bg-blue-600 hover:bg-blue-500 text-white">Save Preferences</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Security & Access
            </CardTitle>
            <CardDescription>Manage your secure session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
               <Lock className="w-8 h-8 text-slate-400" />
               <div>
                 <p className="font-bold text-slate-800">Level 5 Security Clearance Active</p>
                 <p className="text-xs text-slate-500">Session encrypted and monitored.</p>
               </div>
             </div>
             <Button variant="destructive" className="w-full">Revoke All Active Sessions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CMSettingsPage;
