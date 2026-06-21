import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, FileText, ChevronLeft, ChevronRight, Archive, Clock, Download, Calendar as CalendarIcon, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { reportService } from '../../services/reportService';

const HistoryPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historyData, kpiData] = await Promise.all([
          complaintService.getClosedComplaints(),
          reportService.getHistoryKPIs()
        ]);
        setComplaints(historyData);
        setKpis(kpiData);
      } catch (error) {
        console.error('Failed to fetch history data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReset = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setDistrictFilter('all');
    setCategoryFilter('all');
    setTimeframeFilter('all');
    setCurrentPage(1);
  };

  const calculateResolutionTime = (created, updated) => {
    const diffMs = new Date(updated) - new Date(created);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    return `${diffHours}h`;
  };

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || c.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesDistrict = districtFilter === 'all' || c.district.toLowerCase().replace(' ', '') === districtFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || c.category.toLowerCase().replace(' ', '') === categoryFilter.toLowerCase();
    
    // Timeframe logic
    let matchesTimeframe = true;
    if (timeframeFilter !== 'all') {
      const updatedDate = new Date(c.updatedAt);
      const now = new Date();
      const diffDays = (now - updatedDate) / (1000 * 60 * 60 * 24);
      if (timeframeFilter === 'today') matchesTimeframe = diffDays <= 1;
      if (timeframeFilter === '7days') matchesTimeframe = diffDays <= 7;
      if (timeframeFilter === '30days') matchesTimeframe = diffDays <= 30;
    }

    return matchesSearch && matchesPriority && matchesDistrict && matchesCategory && matchesTimeframe;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage));
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownloadReport = (complaint) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to download reports.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Complaint Report - ${complaint.ticketId}</title>
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
            <div class="ticket-id">${complaint.ticketId}</div>
          </div>
          
          <h1 class="title">${complaint.title}</h1>
          <div style="margin-bottom: 25px;">
            <span class="badge ${
              complaint.priority === 'Critical' ? 'badge-critical' :
              complaint.priority === 'High' ? 'badge-high' :
              complaint.priority === 'Medium' ? 'badge-medium' : 'badge-low'
            }">${complaint.priority} Priority</span>
            <span class="badge badge-status">${complaint.status}</span>
          </div>

          <div class="grid">
            <div class="section">
              <h3 class="section-title">Complaint Information</h3>
              <div class="label">Department</div>
              <div class="value">${complaint.category || complaint.department || 'General'}</div>
              <div class="label">Location / District</div>
              <div class="value">${complaint.district || 'Unknown District'}</div>
              <div class="label">Filed Date</div>
              <div class="value">${new Date(complaint.createdAt).toLocaleString()}</div>
              <div class="label">Closed Date</div>
              <div class="value">${new Date(complaint.updatedAt).toLocaleString()}</div>
            </div>
            
            <div class="section">
              <h3 class="section-title">Citizen Details</h3>
              <div class="label">Full Name</div>
              <div class="value">${complaint.citizen?.name || 'Anonymous'}</div>
              <div class="label">Phone Number</div>
              <div class="value">${complaint.citizen?.phone || 'Not Provided'}</div>
              <div class="label">Email Address</div>
              <div class="value">${complaint.citizen?.email || 'Not Provided'}</div>
              <div class="label">Address</div>
              <div class="value">${complaint.citizen?.address || 'Not Provided'}</div>
            </div>
          </div>

          <div class="section" style="margin-bottom: 25px;">
            <h3 class="section-title">Description</h3>
            <div class="description">${complaint.description}</div>
          </div>

          ${complaint.remarks && complaint.remarks.length > 0 ? `
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
                  ${complaint.remarks.map(r => `
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

          ${complaint.attachments && complaint.attachments.length > 0 ? `
            <div class="section" style="margin-bottom: 25px;">
              <h3 class="section-title">Attached Media Proofs</h3>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 10px;">
                ${complaint.attachments.map(att => `
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

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Complaint History</h1>
          <p className="text-muted-foreground mt-1">Review and analyze archived and permanently closed tickets.</p>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 shrink-0">
                  <Archive className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Total Closed</p>
                  <h3 className="text-2xl font-bold text-slate-800">{kpis.totalClosed}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 shrink-0">
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Closed This Month</p>
                  <h3 className="text-2xl font-bold text-slate-800">{kpis.closedThisMonth}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 shrink-0">
                  <Clock className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Avg Resolution</p>
                  <h3 className="text-2xl font-bold text-slate-800">{kpis.avgResolutionDays} Days</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 shrink-0">
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Archived High Priority</p>
                  <h3 className="text-2xl font-bold text-slate-800">{kpis.archivedHighPriority}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters Card */}
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by Ticket ID or Keyword..." 
                className="pl-9 bg-slate-50 focus-visible:ring-blue-500 h-10"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-slate-50 h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="watersupply">Water Supply</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="sanitation">Sanitation</SelectItem>
                <SelectItem value="roadstraffic">Roads & Traffic</SelectItem>
              </SelectContent>
            </Select>

            {/* District Filter */}
            <Select value={districtFilter} onValueChange={(v) => { setDistrictFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-slate-50 h-10">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="southdelhi">South Delhi</SelectItem>
                <SelectItem value="northdelhi">North Delhi</SelectItem>
                <SelectItem value="eastdelhi">East Delhi</SelectItem>
                <SelectItem value="westdelhi">West Delhi</SelectItem>
                <SelectItem value="central">Central</SelectItem>
              </SelectContent>
            </Select>

            {/* Timeframe Filter */}
            <Select value={timeframeFilter} onValueChange={(v) => { setTimeframeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-slate-50 h-10">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Closed Today</SelectItem>
                <SelectItem value="7days">Closed Last 7 Days</SelectItem>
                <SelectItem value="30days">Closed Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button variant="ghost" onClick={handleReset} className="h-10 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Complaint Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 h-12 px-6">TICKET ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">COMPLAINT TITLE</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">DISTRICT</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">PRIORITY</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">CLOSED DATE</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">RESOLUTION TIME</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-right px-6">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">Loading history data...</TableCell>
                </TableRow>
              ) : paginatedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">No archived complaints found matching your criteria.</TableCell>
                </TableRow>
              ) : (
                paginatedComplaints.map((complaint) => (
                  <TableRow key={complaint.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="px-6 py-4 text-sm font-semibold text-slate-500">{complaint.ticketId}</TableCell>
                    <TableCell className="py-4 text-sm font-bold text-slate-800">{complaint.title}</TableCell>
                    <TableCell className="py-4 text-sm font-medium text-slate-600">{complaint.district}</TableCell>
                    
                    {/* Priority Badge */}
                    <TableCell className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                        ${complaint.priority === 'Critical' ? 'bg-red-100 text-red-700' : ''}
                        ${complaint.priority === 'High' ? 'bg-red-50 text-red-600' : ''}
                        ${complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : ''}
                        ${complaint.priority === 'Low' ? 'bg-emerald-50 text-emerald-600' : ''}
                      `}>
                        {complaint.priority}
                      </span>
                    </TableCell>
                    
                    {/* Closed Date */}
                    <TableCell className="py-4 text-sm font-medium text-slate-500">
                      {new Date(complaint.updatedAt).toLocaleDateString('en-GB')}
                    </TableCell>

                    {/* Resolution Time */}
                    <TableCell className="py-4 text-sm font-semibold text-slate-600">
                      {calculateResolutionTime(complaint.createdAt, complaint.updatedAt)}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/dashboard/officer/complaints/${complaint.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs shadow-sm">
                            <FileText className="w-3 h-3 mr-1.5" /> View Details
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => handleDownloadReport(complaint)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs shadow-sm"
                        >
                          <Download className="w-3 h-3 mr-1.5" /> Report
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Footer */}
          {!loading && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-50">
              <span className="text-xs font-medium text-slate-500">
                Showing {paginatedComplaints.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} results
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {[...Array(totalPages)].map((_, idx) => (
                  <Button 
                    key={idx}
                    variant="outline" 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${currentPage === idx + 1 ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700 hover:text-white' : 'text-slate-600'}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default HistoryPage;
