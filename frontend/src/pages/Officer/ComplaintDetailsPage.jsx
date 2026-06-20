import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, MapPin, Phone, User, Calendar, AlertTriangle, ShieldCheck, UploadCloud, CheckCircle2, History, ImageIcon, FileText, Archive } from 'lucide-react';
import { complaintService } from '../../services/complaintService';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
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
      await complaintService.updateComplaintStatus(id, status, remark);
      setRemark(''); // Clear remark after submit
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await complaintService.uploadProof(id, e.target.result, file.name);
        await fetchComplaint(); // Reload data
      } catch (error) {
        console.error('Failed to upload proof', error);
      }
    };
    reader.readAsDataURL(file);
    // Reset the input value so the same file can be selected again if needed
    event.target.value = null;
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold min-h-screen">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500 font-semibold min-h-screen">Ticket not found.</div>;

  // Generate dynamic timeline based on real status
  const statusesOrder = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
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
      <div className="flex items-center gap-4">
        <Link to="/complaints">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Ticket Details: {ticket.ticketId}</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage and track the lifecycle of this complaint.</p>
        </div>
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
                      <div key={att.id} className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 hover:bg-slate-200 cursor-pointer transition-colors relative overflow-hidden">
                        <img src={att.url} alt={att.name} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply" />
                        <span className="text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded absolute bottom-2 w-11/12 truncate text-center z-10">{att.name}</span>
                      </div>
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
                      <div key={att.id} className="w-32 h-32 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center shrink-0 hover:bg-emerald-100 cursor-pointer transition-colors relative overflow-hidden">
                        <img src={att.url} alt={att.name} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply" />
                        <span className="text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded absolute bottom-2 w-11/12 truncate text-center z-10">{att.name}</span>
                      </div>
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
                  <div 
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-center"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-700">Click to upload file</p>
                    <p className="text-xs text-slate-500 mt-1">Images or PDF (Max 5MB)</p>
                  </div>
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
