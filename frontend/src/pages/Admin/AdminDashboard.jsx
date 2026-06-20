import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllTickets, fetchStats, fetchOfficers, assignOfficerToTicket } from '../../services/api';
import TicketDetailsModal from '../../components/TicketDetailsModal';

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ title, value, icon, colorClass, loading }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-300`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colorClass}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-0.5">
                {loading ? <span className="inline-block w-8 h-7 bg-slate-200 rounded animate-pulse" /> : value}
            </p>
        </div>
    </div>
);

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        'Resolved':    'bg-emerald-100 text-emerald-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Assigned':    'bg-indigo-100 text-indigo-700',
        'Rejected':    'bg-red-100 text-red-700',
        'Pending':     'bg-amber-100 text-amber-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
        </span>
    );
};

// ── Main Dashboard ────────────────────────────────────────────
const AdminDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Assign officer UI state
    const [assigningTicketId, setAssigningTicketId] = useState(null);
    const [assigningOfficerId, setAssigningOfficerId] = useState('');
    const [assigning, setAssigning] = useState(false);

    // ── Data fetching ──────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (departmentFilter) filters.department = departmentFilter;

            const [ticketsData, officersData, statsData] = await Promise.all([
                fetchAllTickets(filters),
                fetchOfficers(),
                fetchStats(),
            ]);
            setTickets(ticketsData);
            setOfficers(officersData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, departmentFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Filtered tickets (client-side search) ─────────────────
    const filteredTickets = tickets.filter(ticket => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            ticket.title?.toLowerCase().includes(q) ||
            ticket.location?.toLowerCase().includes(q) ||
            ticket.citizenId?.name?.toLowerCase().includes(q) ||
            ticket.department?.toLowerCase().includes(q)
        );
    });

    // ── Assign officer handler ─────────────────────────────────
    const handleAssignOfficer = async (ticketId) => {
        if (!assigningOfficerId) return;
        setAssigning(true);
        try {
            const data = await assignOfficerToTicket(ticketId, assigningOfficerId);
            // Update ticket in state with the returned updated ticket
            setTickets(prev => prev.map(t => t._id === ticketId ? data.ticket : t));
            setAssigningTicketId(null);
            setAssigningOfficerId('');
            // Refresh stats after assignment
            const statsData = await fetchStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error assigning officer:', error);
            alert('Failed to assign officer. Please try again.');
        } finally {
            setAssigning(false);
        }
    };

    // ── Modal ticket update callback (fixes prop mutation bug) ─
    const handleTicketUpdated = (updatedTicket) => {
        setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        if (selectedTicket?._id === updatedTicket._id) {
            setSelectedTicket(updatedTicket);
        }
    };

    // ── Export CSV ─────────────────────────────────────────────
    const handleExportCSV = () => {
        if (filteredTickets.length === 0) return;
        const headers = ['ID', 'Title', 'Location', 'Department', 'Status', 'Verification', 'Citizen', 'Officer', 'Filed On'];
        const rows = filteredTickets.map(t => [
            t._id,
            `"${t.title}"`,
            `"${t.location}"`,
            t.department,
            t.status,
            t.verificationStatus,
            t.citizenId?.name || 'Anonymous',
            t.assignedOfficerId?.name || 'Unassigned',
            new Date(t.createdAt).toLocaleDateString('en-IN'),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Department list from stats ────────────────────────────
    const departments = stats?.byDepartment?.map(d => d._id).filter(Boolean) || [];

    return (
        <div className="max-w-7xl mx-auto space-y-7">

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Total Complaints" value={stats?.total ?? 0} icon="📋" colorClass="bg-slate-100" loading={loading} />
                <StatCard title="Pending Verification" value={stats?.pendingVerification ?? 0} icon="⏳" colorClass="bg-amber-100" loading={loading} />
                <StatCard title="In Progress" value={stats?.byStatus?.inProgress ?? 0} icon="🔧" colorClass="bg-blue-100" loading={loading} />
                <StatCard title="Resolved" value={stats?.byStatus?.resolved ?? 0} icon="✅" colorClass="bg-emerald-100" loading={loading} />
            </div>

            {/* ── Department Breakdown ── */}
            {stats?.byDepartment && stats.byDepartment.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Department Breakdown</h2>
                    <div className="flex flex-wrap gap-3">
                        {stats.byDepartment.map((dept) => (
                            <div key={dept._id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                                <span className="text-sm font-semibold text-slate-700">{dept._id || 'Unknown'}</span>
                                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{dept.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Complaints Table ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Table Header + Filters */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-800 flex-shrink-0">All Complaints</h2>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search title, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        />
                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        {/* Department filter */}
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {/* Export */}
                        <button
                            onClick={handleExportCSV}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            ↓ Export CSV
                        </button>
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                Loading complaints...
                            </div>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                            <span className="text-3xl">📭</span>
                            <p className="text-sm font-medium">No complaints match your filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                    <th className="px-5 py-3 font-semibold">Complaint</th>
                                    <th className="px-5 py-3 font-semibold">Location</th>
                                    <th className="px-5 py-3 font-semibold">Department</th>
                                    <th className="px-5 py-3 font-semibold">Assigned Officer</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-900 truncate max-w-[200px]">{ticket.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{ticket.citizenId?.name || 'Anonymous'}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 truncate max-w-[150px]">{ticket.location}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                                                {ticket.department || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {assigningTicketId === ticket._id ? (
                                                // Inline assign UI
                                                <div className="flex gap-2 items-center">
                                                    <select
                                                        value={assigningOfficerId}
                                                        onChange={(e) => setAssigningOfficerId(e.target.value)}
                                                        className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[130px]"
                                                    >
                                                        <option value="">Select officer</option>
                                                        {officers.map(o => (
                                                            <option key={o._id} value={o._id}>
                                                                {o.name} ({o.department})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleAssignOfficer(ticket._id)}
                                                        disabled={assigning || !assigningOfficerId}
                                                        className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-2 py-1 rounded-lg"
                                                    >
                                                        {assigning ? '...' : '✓'}
                                                    </button>
                                                    <button
                                                        onClick={() => setAssigningTicketId(null)}
                                                        className="text-xs text-slate-400 hover:text-slate-600 px-1"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : ticket.assignedOfficerId?.name ? (
                                                <div>
                                                    <p className="text-slate-800 font-medium text-xs">{ticket.assignedOfficerId.name}</p>
                                                    <p className="text-xs text-slate-400">{ticket.assignedOfficerId.department}</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setAssigningTicketId(ticket._id); setAssigningOfficerId(''); }}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
                                                >
                                                    + Assign Officer
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={ticket.status} />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Row count */}
                {!loading && filteredTickets.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-400">
                            Showing <span className="font-semibold text-slate-600">{filteredTickets.length}</span> of{' '}
                            <span className="font-semibold text-slate-600">{tickets.length}</span> complaints
                        </p>
                    </div>
                )}
            </div>

            {/* ── Ticket Details Modal ── */}
            {selectedTicket && (
                <TicketDetailsModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onTicketUpdated={handleTicketUpdated}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
