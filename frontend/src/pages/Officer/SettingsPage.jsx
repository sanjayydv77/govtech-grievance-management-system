import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShieldCheck, Settings, Building2, HelpCircle, Activity, Save, AlertCircle, FileText, Download } from 'lucide-react';

const SettingsPage = () => {
  const [officer, setOfficer] = useState({ 
    name: 'Officer', 
    department: 'Your Department',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    empId: 'GOV-DEL-8942',
    designation: 'Assistant Engineer',
    email: 'officer@delhi.gov.in',
    phone: '+91 98765 43210',
    office: 'Headquarters, ITO',
    deptCode: 'PWD-DEL',
    authority: 'Chief Engineer',
    role: 'Nodal Officer'
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem('officerSession');
    if (sessionStr) {
      setOfficer(prev => ({ ...prev, ...JSON.parse(sessionStr) }));
    }
  }, []);

  return (
    <div className="p-8 space-y-8 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings, preferences, and security.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        
        {/* Tab List */}
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm h-auto inline-flex overflow-x-auto w-full md:w-auto">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 text-sm font-semibold">
            <User className="w-4 h-4 mr-2" /> Profile & Dept
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 text-sm font-semibold">
            <Settings className="w-4 h-4 mr-2" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 text-sm font-semibold">
            <Activity className="w-4 h-4 mr-2" /> Activity & Support
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Dept */}
        <TabsContent value="profile" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Profile Information</CardTitle>
                <CardDescription>Update your personal details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                    <AvatarImage src={officer.avatar} />
                    <AvatarFallback>OF</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="font-semibold text-slate-600">Change Picture</Button>
                    <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-600 font-semibold">Full Name</Label>
                    <Input id="fullName" defaultValue={officer.name} className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empId" className="text-slate-600 font-semibold">Employee ID</Label>
                    <Input id="empId" defaultValue={officer.empId} readOnly className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-slate-600 font-semibold">Designation</Label>
                    <Input id="designation" defaultValue={officer.designation} className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-600 font-semibold">Email Address</Label>
                    <Input id="email" type="email" defaultValue={officer.email} className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-600 font-semibold">Phone Number</Label>
                    <Input id="phone" defaultValue={officer.phone} className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="office" className="text-slate-600 font-semibold">Office Location</Label>
                    <Input id="office" defaultValue={officer.office} className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-6">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Department Information (Read Only) */}
            <Card className="border-slate-200 shadow-sm rounded-2xl h-fit">
              <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-2xl">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" /> Department Information
                </CardTitle>
                <CardDescription>Your assigned departmental scope (Read Only).</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Department Name</span>
                  <span className="text-sm font-bold text-slate-800">{officer.department}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Department Code</span>
                  <span className="text-sm font-bold text-slate-800">{officer.deptCode}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Reporting Authority</span>
                  <span className="text-sm font-bold text-slate-800">{officer.authority}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-500">Officer Role</span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{officer.role}</span>
                </div>
                
                <div className="mt-6 bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    To request changes to your departmental assignment or reporting hierarchy, please contact the Super Admin or Central IT Division.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Security */}
        <TabsContent value="security" className="space-y-6 outline-none">
           <div className="grid gap-6 md:grid-cols-2">
            {/* Security Settings */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-800">Security Settings</CardTitle>
                    <CardDescription>Manage your password and authentication.</CardDescription>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secured
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Change Password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentPass" className="text-slate-600 font-semibold">Current Password</Label>
                    <Input id="currentPass" type="password" placeholder="••••••••" className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPass" className="text-slate-600 font-semibold">New Password</Label>
                    <Input id="newPass" type="password" placeholder="••••••••" className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPass" className="text-slate-600 font-semibold">Confirm Password</Label>
                    <Input id="confirmPass" type="password" placeholder="••••••••" className="bg-slate-50 focus-visible:ring-blue-500" />
                  </div>
                  <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold mt-2">
                    Update Password
                  </Button>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Two-Factor Authentication (2FA)</h3>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Enable 2FA</p>
                      <p className="text-xs text-slate-500 mt-1">Require an OTP when logging in.</p>
                    </div>
                    <Switch id="2fa-toggle" defaultChecked />
                  </div>
                </div>

              </CardContent>
            </Card>
           </div>
        </TabsContent>

        {/* Tab 3: Preferences */}
        <TabsContent value="preferences" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Notification Preferences */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you receive alerts.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                  <div>
                    <Label className="text-sm font-bold text-slate-700">Email Notifications</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Receive updates via email.</p>
                  </div>
                  <Switch id="email-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                  <div>
                    <Label className="text-sm font-bold text-slate-700">SMS Notifications</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Receive critical alerts via SMS.</p>
                  </div>
                  <Switch id="sms-notif" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                  <div>
                    <Label className="text-sm font-bold text-slate-700">In-App Notifications</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Show notifications in the portal bell icon.</p>
                  </div>
                  <Switch id="app-notif" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                  <div>
                    <Label className="text-sm font-bold text-red-600">High Priority Alerts</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Immediate push for High Priority tickets.</p>
                  </div>
                  <Switch id="high-priority-notif" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                  <div>
                    <Label className="text-sm font-bold text-amber-600">Escalated Complaint Alerts</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Alerts when a ticket misses SLA.</p>
                  </div>
                  <Switch id="escalated-notif" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className="text-sm font-bold text-slate-700">Daily Summary Report</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Receive a digest at 8:00 AM daily.</p>
                  </div>
                  <Switch id="daily-digest" />
                </div>

              </CardContent>
            </Card>

            {/* Dashboard Preferences */}
            <Card className="border-slate-200 shadow-sm rounded-2xl h-fit">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Dashboard Preferences</CardTitle>
                <CardDescription>Customize your workspace experience.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">Theme</Label>
                  <Select defaultValue="light">
                    <SelectTrigger className="bg-slate-50 focus:ring-blue-500">
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">Default Landing Page</Label>
                  <Select defaultValue="dashboard">
                    <SelectTrigger className="bg-slate-50 focus:ring-blue-500">
                      <SelectValue placeholder="Select Page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Overview Dashboard</SelectItem>
                      <SelectItem value="complaints">Assigned Complaints</SelectItem>
                      <SelectItem value="high-priority">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">Table Rows Per Page</Label>
                  <Select defaultValue="10">
                    <SelectTrigger className="bg-slate-50 focus:ring-blue-500">
                      <SelectValue placeholder="Select Rows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Rows</SelectItem>
                      <SelectItem value="10">10 Rows</SelectItem>
                      <SelectItem value="25">25 Rows</SelectItem>
                      <SelectItem value="50">50 Rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-slate-50 focus:ring-blue-500">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Tab 4: Activity & Help */}
        <TabsContent value="activity" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Activity Log */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Activity Log</CardTitle>
                <CardDescription>Recent actions performed by your account.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-sm font-bold text-slate-800">Status Update: TKT-1088</p>
                    <p className="text-xs text-slate-500 mt-1">Changed status from Assigned to In Progress.</p>
                    <p className="text-xs font-semibold text-slate-400 mt-2">Today, 10:42 AM</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-sm font-bold text-slate-800">Successful Login</p>
                    <p className="text-xs text-slate-500 mt-1">IP Address: 114.143.XX.XX</p>
                    <p className="text-xs font-semibold text-slate-400 mt-2">Today, 09:00 AM</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-sm font-bold text-slate-800">Settings Modified</p>
                    <p className="text-xs text-slate-500 mt-1">Updated Notification Preferences.</p>
                    <p className="text-xs font-semibold text-slate-400 mt-2">Yesterday, 16:30 PM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 text-slate-600 border-slate-200 shadow-none">View Full Log</Button>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="border-slate-200 shadow-sm rounded-2xl h-fit">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Help & Support</CardTitle>
                <CardDescription>Get assistance or report issues.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Raise Technical Issue</p>
                      <p className="text-xs text-slate-500 mt-0.5">Report bugs or portal errors.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Contact Administrator</p>
                      <p className="text-xs text-slate-500 mt-0.5">Reach out to Dept Super Admin.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Download User Manual</p>
                      <p className="text-xs text-slate-500 mt-0.5">PDF Guide for Officers.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">FAQ</p>
                      <p className="text-xs text-slate-500 mt-0.5">Frequently Asked Questions.</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default SettingsPage;
