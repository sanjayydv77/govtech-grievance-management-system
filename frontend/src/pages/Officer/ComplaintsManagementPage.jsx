import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RefreshCw, MoreVertical, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';

const ComplaintsManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const data = await complaintService.getActiveComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Failed to fetch complaints', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDistrictFilter('all');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || c.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesDistrict = districtFilter === 'all' || c.district.toLowerCase().replace(' ', '') === districtFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesDistrict;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage));
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Assigned Complaints</h1>
          <p className="text-muted-foreground mt-1">Manage and track all complaints assigned to your department.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          <FileText className="w-5 h-5" />
          <span>Total: {complaints.length} Tickets</span>
        </div>
      </div>

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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-slate-50 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-slate-50 h-10">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                <TableHead className="text-xs font-bold text-slate-400 h-12">STATUS</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">ASSIGNED DATE</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-right px-6">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">Loading complaints...</TableCell>
                </TableRow>
              ) : paginatedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">No complaints found matching your filters.</TableCell>
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
                    
                    {/* Status Badge */}
                    <TableCell className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex
                        ${complaint.status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
                        ${complaint.status === 'In Progress' ? 'bg-purple-50 text-purple-600' : ''}
                        ${complaint.status === 'Assigned' ? 'bg-blue-50 text-blue-600' : ''}
                        ${complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : ''}
                        ${complaint.status === 'Closed' ? 'bg-slate-100 text-slate-600' : ''}
                      `}>
                        {complaint.status}
                      </span>
                    </TableCell>
                    
                    <TableCell className="py-4 text-sm font-medium text-slate-500">
                      {new Date(complaint.createdAt).toLocaleDateString('en-GB')}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/complaints/${complaint.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs shadow-sm">
                            View Details
                          </Button>
                        </Link>
                        <Link to={`/complaints/${complaint.id}`}>
                          <Button size="sm" className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm">
                            Update Status
                          </Button>
                        </Link>
                        <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors ml-1">
                          <MoreVertical size={16} />
                        </button>
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
                    className={`h-8 w-8 p-0 ${currentPage === idx + 1 ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white' : 'text-slate-600'}`}
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

export default ComplaintsManagementPage;
