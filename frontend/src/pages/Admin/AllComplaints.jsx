import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllTickets, fetchOfficers, assignOfficerToTicket, adminUpdateTicketStatus } from '../../services/api';
import TicketDetailsModal from '../../components/TicketDetailsModal';

// ── Shared Helpers ────────────────────────────────────────────
const STATUS_STYLES = {
    'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Assigned': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
};

const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{status}</span>
);

const ITEMS_PER_PAGE = 15;

// ── Toast Notification ────────────────────────────────────────
const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all animate-bounce-in ${type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {type === 'error' ? '✗' : '✓'} {msg}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────
const AllComplaints = () => {
    const [tickets, setTickets] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // Filters & Sort
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Pagination
    const [page, setPage] = useState(1);

    // Inline assign state
    const [assigningId, setAssigningId] = useState(null);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [savingAssign, setSavingAssign] = useState(false);

    // Status override state
    const [overridingId, setOverridingId] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    // ── Data Fetch ──────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [t, o] = await Promise.all([fetchAllTickets(), fetchOfficers()]);
            setTickets(t);
            setOfficers(o);
        } catch (e) { showToast('Failed to load data', 'error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { setPage(1); }, [search, statusFilter, deptFilter]);

    // ── Derived Data ────────────────────────────────────────
    const departments = useMemo(() =>
        [...new Set(tickets.map(t => t.department).filter(Boolean))].sort()
    , [tickets]);

    const filteredTickets = useMemo(() => {
        let r = [...tickets];
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(t =>
                t.title?.toLowerCase().includes(q) ||
                t.location?.toLowerCase().includes(q) ||
                t.citizenId?.name?.toLowerCase().includes(q) ||
                t.department?.toLowerCase().includes(q) ||
                t._id?.toLowerCase().includes(q)
            );
        }
        if (statusFilter) r = r.filter(t => t.status === statusFilter);
        if (deptFilter) r = r.filter(t => t.department === deptFilter);
        r.sort((a, b) => sortBy === 'newest'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );
        return r;
    }, [tickets, search, statusFilter, deptFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
    const paginated = filteredTickets.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // ── Actions ─────────────────────────────────────────────
    const handleAssign = async (ticketId) => {
        if (!selectedOfficer) return;
        setSavingAssign(true);
        try {
            const data = await assignOfficerToTicket(ticketId, selectedOfficer);
            setTickets(prev => prev.map(t => t._id === ticketId ? data.ticket : t));
            setAssigningId(null);
            setSelectedOfficer('');
            showToast('Officer assigned successfully');
        } catch (e) { showToast('Failed to assign officer', 'error'); }
        finally { setSavingAssign(false); }
    };

    const handleStatusOverride = async (ticketId, newStatus) => {
        setOverridingId(ticketId);
        try {
            const data = await adminUpdateTicketStatus(ticketId, newStatus);
            setTickets(prev => prev.map(t => t._id === ticketId ? data.ticket : t));
            showToast(`Status updated to "${newStatus}"`);
        } catch (e) { showToast('Failed to update status', 'error'); }
        finally { setOverridingId(null); }
    };

    const handleTicketUpdated = (updated) => {
        setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
        setSelectedTicket(updated);
    };

    // ── CSV Export ──────────────────────────────────────────
    const handleExport = () => {
        const headers = ['Ticket ID', 'Title', 'Location', 'Department', 'Status', 'Verification Status', 'Citizen', 'Citizen Phone', 'Officer', 'Officer Dept', 'Filed On'];
        const rows = filteredTickets.map(t => [
            t._id, `"${(t.title || '').replace(/"/g, '""')}"`,
            `"${(t.location || '').replace(/"/g, '""')}"`,
            t.department || '', t.status, t.verificationStatus,
            t.citizenId?.name || 'Anonymous', t.citizenId?.phone || '',
            t.assignedOfficerId?.name || 'Unassigned', t.assignedOfficerId?.department || '',
            new Date(t.createdAt).toLocaleDateString('en-IN'),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast(`Exported ${filteredTickets.length} records`);
    };

    // ── Pagination helper ───────────────────────────────────
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const p = page, tp = totalPages;
        if (p <= 4) return [1, 2, 3, 4, 5, '…', tp];
        if (p >= tp - 3) return [1, '…', tp-4, tp-3, tp-2, tp-1, tp];
        return [1, '…', p-1, p, p+1, '…', tp];
    }, [page, totalPages]);

    return (
        <div className="space-y-5">
            <Toast msg={toast.msg} type={toast.type} />

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">All Complaints</h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {loading ? 'Loading...' : `Showing ${filteredTickets.length} of ${tickets.length} total complaints`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadData} className="flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-56">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Search title, location, citizen, ID..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
                        <option value="">All Statuses</option>
                        {['Pending','Assigned','In Progress','Resolved','Rejected'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    {(search || statusFilter || deptFilter) && (
                        <button onClick={() => { setSearch(''); setStatusFilter(''); setDeptFilter(''); }}
                            className="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 font-medium transition-colors">
                            ✕ Clear
                        </button>
                    )}
                </div>
                {/* Active filter chips */}
                {(statusFilter || deptFilter || search) && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {search && <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">Search: "{search}"</span>}
                        {statusFilter && <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">Status: {statusFilter}</span>}
                        {deptFilter && <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">Dept: {deptFilter}</span>}
                    </div>
                )}
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                            <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Loading complaints...</span>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
                            <span className="text-5xl">📭</span>
                            <p className="text-sm font-semibold text-slate-400">No complaints match your filters</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Complaint</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Location / Dept</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Assigned Officer</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Filed</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map(ticket => (
                                    <tr key={ticket._id} className="hover:bg-slate-50/60 transition-colors group">
                                        {/* Complaint Info */}
                                        <td className="px-5 py-4 max-w-[220px]">
                                            <p className="font-bold text-slate-800 truncate text-sm">{ticket.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ticket.citizenId?.name || 'Anonymous'}</p>
                                            <p className="text-xs text-slate-300 mt-0.5 font-mono">#{ticket._id.slice(-8).toUpperCase()}</p>
                                        </td>
                                        {/* Location */}
                                        <td className="px-5 py-4 max-w-[160px]">
                                            <p className="text-slate-700 truncate text-sm">{ticket.location}</p>
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg mt-1 inline-block font-medium">
                                                {ticket.department || 'Unclassified'}
                                            </span>
                                        </td>
                                        {/* Officer Column */}
                                        <td className="px-5 py-4 min-w-[180px]">
                                            {assigningId === ticket._id ? (
                                                <div className="flex gap-1.5 items-center">
                                                    <select value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)} autoFocus
                                                        className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white max-w-[140px]">
                                                        <option value="">Select officer…</option>
                                                        {officers.map(o => <option key={o._id} value={o._id}>{o.name} ({o.department})</option>)}
                                                    </select>
                                                    <button onClick={() => handleAssign(ticket._id)} disabled={savingAssign || !selectedOfficer}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors">
                                                        {savingAssign ? '…' : '✓'}
                                                    </button>
                                                    <button onClick={() => { setAssigningId(null); setSelectedOfficer(''); }}
                                                        className="text-slate-400 hover:text-red-500 px-1.5 py-1.5 rounded-lg text-xs transition-colors">✕</button>
                                                </div>
                                            ) : ticket.assignedOfficerId?.name ? (
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-xs">{ticket.assignedOfficerId.name}</p>
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">{ticket.assignedOfficerId.department}</span>
                                                    <div className="mt-1.5">
                                                        <button onClick={() => { setAssigningId(ticket._id); setSelectedOfficer(''); }}
                                                            className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 mr-2">
                                                            Reassign
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => { setAssigningId(ticket._id); setSelectedOfficer(''); }}
                                                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-3 py-1.5 rounded-xl transition-colors">
                                                    + Assign Officer
                                                </button>
                                            )}
                                        </td>
                                        {/* Status Column */}
                                        <td className="px-5 py-4 min-w-[160px]">
                                            <div className="space-y-1.5">
                                                <StatusBadge status={ticket.status} />
                                                <select
                                                    disabled={overridingId === ticket._id}
                                                    onChange={e => { if (e.target.value) { handleStatusOverride(ticket._id, e.target.value); e.target.value = ''; } }}
                                                    defaultValue=""
                                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer bg-white w-full disabled:opacity-50"
                                                >
                                                    <option value="" disabled>{overridingId === ticket._id ? 'Saving…' : 'Admin override…'}</option>
                                                    {['Pending','Assigned','In Progress','Resolved','Rejected'].map(s => (
                                                        <option key={s} value={s} disabled={s === ticket.status}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        {/* Date */}
                                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <button onClick={() => setSelectedTicket(ticket)}
                                                className="text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3.5 py-2 rounded-xl transition-colors">
                                                Details →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Pagination ── */}
                {!loading && totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            Page <b>{page}</b> of <b>{totalPages}</b> · <b>{filteredTickets.length}</b> results
                        </p>
                        <div className="flex gap-1 items-center">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors font-medium">← Prev</button>
                            {pageNumbers.map((p, i) => (
                                p === '…' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-xs">…</span>
                                ) : (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`w-8 h-8 text-xs rounded-lg transition-colors font-medium ${page === p ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 hover:bg-slate-100 text-slate-600'}`}>
                                        {p}
                                    </button>
                                )
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors font-medium">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Details Modal ── */}
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

export default AllComplaints;
