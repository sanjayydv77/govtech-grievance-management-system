import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, MapPin, Phone, User, Calendar, AlertTriangle, ShieldCheck, UploadCloud, CheckCircle2, History, ImageIcon, FileText, Archive, Download } from 'lucide-react';
import { complaintService } from '../../services/complaintService';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaintById(id);
      setTicket(data);
      setStatus(data.status);
    } catch (error) {
      console.error('Failed to load complaint details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!status) return;
    setIsUpdating(true);
    try {
      await complaintService.updateComplaintStatus(id, status, remark, selectedFile);
      setRemark(''); // Clear remark after submit
      setSelectedFile(null); // Clear selected file after submit
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Reset input field
      }
      await fetchComplaint(); // Reload data
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleDownloadReport = () => {
    if (!ticket) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to download reports.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Complaint Report - ${ticket.ticketId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 40px; line-height: 1.6; }
            .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .ticket-id { font-size: 18px; color: #64748b; font-weight: 600; }
            .title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .section { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #f8fafc; page-break-inside: avoid; }
            .section-title { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; }
            .label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
            .value { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 12px; }
            .value:last-child { margin-bottom: 0; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .badge-critical { background-color: #fee2e2; color: #991b1b; }
            .badge-high { background-color: #fef2f2; color: #b91c1c; }
            .badge-medium { background-color: #fef3c7; color: #92400e; }
            .badge-low { background-color: #d1fae5; color: #065f46; }
            .badge-status { background-color: #e0f2fe; color: #0369a1; margin-left: 8px; }
            .description { font-size: 13px; color: #475569; background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-top: 8px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { border-bottom: 1px solid #cbd5e1; text-align: left; padding: 8px; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10px; }
            td { border-bottom: 1px solid #f1f5f9; padding: 10px 8px; color: #475569; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px;">
            <div class="logo">Delhi CM Portal</div>
            <div class="ticket-id">${ticket.ticketId}</div>
          </div>
          
          <h1 class="title">${ticket.title}</h1>
          <div style="margin-bottom: 25px;">
            <span class="badge ${
              ticket.priority === 'Critical' ? 'badge-critical' :
              ticket.priority === 'High' ? 'badge-high' :
              ticket.priority === 'Medium' ? 'badge-medium' : 'badge-low'
            }">${ticket.priority} Priority</span>
            <span class="badge badge-status">${ticket.status}</span>
          </div>

          <div class="grid">
            <div class="section">
              <h3 class="section-title">Complaint Information</h3>
              <div class="label">Department</div>
              <div class="value">${ticket.category || ticket.department || 'General'}</div>
              <div class="label">Location / District</div>
              <div class="value">${ticket.district || 'Unknown District'}</div>
              <div class="label">Filed Date</div>
              <div class="value">${new Date(ticket.createdAt).toLocaleString()}</div>
              <div class="label">Last Updated</div>
              <div class="value">${new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
            
            <div class="section">
              <h3 class="section-title">Citizen Details</h3>
              <div class="label">Full Name</div>
              <div class="value">${ticket.citizen?.name || 'Anonymous'}</div>
              <div class="label">Phone Number</div>
              <div class="value">${ticket.citizen?.phone || 'Not Provided'}</div>
              <div class="label">Email Address</div>
              <div class="value">${ticket.citizen?.email || 'Not Provided'}</div>
              <div class="label">Address</div>
              <div class="value">${ticket.citizen?.address || 'Not Provided'}</div>
            </div>
          </div>

          <div class="section" style="margin-bottom: 25px;">
            <h3 class="section-title">Description</h3>
            <div class="description">${ticket.description}</div>
          </div>

          ${ticket.remarks && ticket.remarks.length > 0 ? `
            <div class="section" style="margin-bottom: 25px;">
              <h3 class="section-title">Timeline & Remarks History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticket.remarks.map(r => `
                    <tr>
                      <td style="font-weight: bold; color: #334155;">${r.author}</td>
                      <td>${new Date(r.createdAt).toLocaleString()}</td>
                      <td>${r.remark}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${ticket.attachments && ticket.attachments.length > 0 ? `
            <div class="section" style="margin-bottom: 25px;">
              <h3 class="section-title">Attached Media Proofs</h3>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 10px;">
                ${ticket.attachments.map(att => `
                  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; text-align: center; background-color: #fff;">
                    <img src="${att.url}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px;" />
                    <div style="font-size: 8px; font-weight: bold; color: #94a3b8; margin-top: 4px; text-transform: uppercase;">${att.uploader === 'citizen' ? 'Citizen' : 'Officer'} File</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is a system generated report from the Delhi Government CM Portal. Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold min-h-screen">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500 font-semibold min-h-screen">Ticket not found.</div>;

  // Generate dynamic timeline based on real status
  const statusesOrder = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
  const currentIndex = statusesOrder.indexOf(ticket.status);
  const timeline = statusesOrder.map((s, idx) => ({
    status: s,
    completed: idx <= currentIndex,
    time: idx === 0 ? new Date(ticket.createdAt).toLocaleString() : (idx === currentIndex ? new Date(ticket.updatedAt).toLocaleString() : '-'),
    by: idx === 0 ? 'Citizen' : (idx <= currentIndex ? 'System/Officer' : '-')
  }));

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/officer/complaints">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Ticket Details: {ticket.ticketId}</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Manage and track the lifecycle of this complaint.</p>
          </div>
        </div>
        
        <Button 
          onClick={handleDownloadReport}
          variant="outline" 
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-semibold gap-2 shadow-sm h-10 px-4 rounded-xl"
        >
          <Download className="w-4 h-4 text-slate-500" /> Download PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Info & Overview */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Overview Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="h-2 bg-blue-600 w-full"></div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">{ticket.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> {ticket.category}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {ticket.district}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-md text-sm font-bold shadow-sm
                    ${ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
                    ${ticket.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : ''}
                    ${ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''}
                    ${ticket.priority === 'Low' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
                  `}>
                    {ticket.priority} Priority
                  </span>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 border rounded-md text-sm font-bold shadow-sm
                      ${ticket.verificationStatus === 'Verified Real' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        ticket.verificationStatus === 'Flagged False' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'}
                    `}>
                      Verification: {ticket.verificationStatus || 'Pending'}
                    </span>
                    <span className={`px-3 py-1 border rounded-md text-sm font-bold shadow-sm
                      ${ticket.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                      ${ticket.status === 'In Progress' ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
                      ${ticket.status === 'Assigned' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                      ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                      ${ticket.status === 'Closed' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                    `}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid for Citizen & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Citizen Information */}
            <Card className="border-slate-200 shadow-sm rounded-2xl h-fit">
               <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> Citizen Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {ticket.citizen ? (
                  <>
                    <div>
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</Label>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{ticket.citizen.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</Label>
                      <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" /> {ticket.citizen.phone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</Label>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{ticket.citizen.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</Label>
                      <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">{ticket.citizen.address}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Citizen details not provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Complaint Description */}
            <Card className="border-slate-200 shadow-sm rounded-2xl h-fit">
               <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Complaint Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Citizen Attachments */}
          {ticket.attachments && ticket.attachments.some(a => a.uploader === 'citizen') && (
            <Card className="border-slate-200 shadow-sm rounded-2xl">
               <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" /> Citizen Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {ticket.attachments.filter(a => a.uploader === 'citizen').map(att => (
                      <a 
                        key={att.id} 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 hover:border-blue-400 cursor-pointer transition-all relative overflow-hidden group shadow-sm"
                      >
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                        <span className="text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded absolute bottom-2 w-11/12 truncate text-center z-10">{att.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
            </Card>
          )}

          {/* Officer Attachments */}
          {ticket.attachments && ticket.attachments.some(a => a.uploader === 'officer') && (
            <Card className="border-slate-200 shadow-sm rounded-2xl border-l-4 border-l-emerald-500">
               <CardHeader className="border-b border-slate-100 pb-4 bg-emerald-50/30">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Resolution Proofs (Officer)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {ticket.attachments.filter(a => a.uploader === 'officer').map(att => (
                      <a 
                        key={att.id} 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-32 h-32 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center shrink-0 hover:border-emerald-400 cursor-pointer transition-all relative overflow-hidden group shadow-sm"
                      >
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                        <span className="text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded absolute bottom-2 w-11/12 truncate text-center z-10">{att.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
            </Card>
          )}
          
          {/* Remarks History */}
          {ticket.remarks && ticket.remarks.length > 0 && (
             <Card className="border-slate-200 shadow-sm rounded-2xl">
               <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" /> Remarks History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {ticket.remarks.map(r => (
                    <div key={r.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-700">{r.author}</span>
                        <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">{r.remark}</p>
                    </div>
                  ))}
                </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: Actions & Timeline */}
        <div className="space-y-6">
          
          {ticket.status !== 'Closed' ? (
            <>
              {/* Status Action Card */}
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white border-blue-100">
                <CardHeader className="border-b border-slate-50 pb-4 bg-blue-50/50 rounded-t-2xl">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" /> Update Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Current Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="bg-slate-50 focus:ring-blue-500 h-10 border-slate-200">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Add Remark</Label>
                    <Textarea 
                      placeholder="Enter official remarks..." 
                      className="bg-slate-50 focus-visible:ring-blue-500 resize-none h-24 border-slate-200"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm"
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Updates'}
                  </Button>
                </CardContent>
              </Card>

              {/* Resolution Proof Upload */}
              <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-emerald-500" /> Upload Resolution Proof
                  </CardTitle>
                  <CardDescription>Required before marking as Resolved.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,.pdf"
                  />
                  {selectedFile ? (
                    <div className="border border-emerald-250 rounded-xl p-4 bg-emerald-50/40 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        {selectedFile.type?.startsWith('image/') ? (
                          <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative bg-white flex-shrink-0 shadow-inner">
                            <img 
                              src={URL.createObjectURL(selectedFile)} 
                              alt="Selected proof preview" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white flex items-center justify-center flex-shrink-0">
                            <FileText className="w-8 h-8 text-emerald-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 max-w-[150px] truncate">{selectedFile.name}</p>
                          <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold rounded-lg px-2.5 h-8 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = null;
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div 
                      onClick={handleUploadClick}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-center"
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
                      <p className="text-sm font-bold text-slate-700">Click to upload file</p>
                      <p className="text-xs text-slate-500 mt-1">Images or PDF (Max 5MB)</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-slate-50">
              <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <Archive className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Archived Ticket</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  This complaint has been permanently closed. No further status updates or document uploads are permitted.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" /> Lifecycle Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
                {timeline.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white flex items-center justify-center
                      ${step.completed ? 'bg-emerald-500' : 'bg-slate-200'}
                    `}>
                      {step.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <p className={`text-sm font-bold ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.status}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{step.by}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1.5">{step.time}</p>
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

export default ComplaintDetailsPage;
