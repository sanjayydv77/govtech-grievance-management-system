import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchOfficers, fetchAllTickets, assignOfficerToTicket, dischargeOfficerFromTicket, createUserByAdmin } from '../../services/api';

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const s = {
        'Resolved': 'bg-emerald-100 text-emerald-700', 'In Progress': 'bg-blue-100 text-blue-700',
        'Assigned': 'bg-blue-100 text-blue-700', 'Rejected': 'bg-red-100 text-red-700',
        'Pending': 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
};

const DEPARTMENTS = ['PWD', 'Jal Board', 'Health', 'Education', 'Electricity', 'Transport', 'Revenue', 'Social Welfare', 'Police', 'Fire', 'Other'];

// ── Add Officer Modal ─────────────────────────────────────────
const AddOfficerModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.department) { setError('Please select a department.'); return; }
        setLoading(true);
        try {
            const data = await createUserByAdmin({ ...form, role: 'officer' });
            onCreated(data.user);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create officer. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Add New Officer</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Creates a government officer account on the portal</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xl transition-colors">×</button>
                </div>
                {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-xl mb-4 border border-red-100">⚠ {error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} required placeholder="Officer Name"
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number"
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Official Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="officer@delhi.gov.in"
                            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Department *</label>
                        <select name="department" value={form.department} onChange={handleChange} required
                            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Temporary Password *</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters"
                            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-slate-400 mt-1.5">Officer should change this after first login.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm shadow-blue-200">
                            {loading ? 'Creating…' : 'Create Officer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Officer Complaints Modal ──────────────────────────────────
const OfficerModal = ({ officerData, allTickets, allOfficers, onClose, onTicketsUpdated }) => {
    const { officer, tickets } = officerData;
    const [reassigningId, setReassigningId] = useState(null);
    const [newOfficerId, setNewOfficerId] = useState('');
    const [saving, setSaving] = useState(false);
    const [localTickets, setLocalTickets] = useState(tickets);
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleReassign = async (ticketId) => {
        if (!newOfficerId) return;
        setSaving(true);
        try {
            const data = await assignOfficerToTicket(ticketId, newOfficerId);
            const updated = localTickets.filter(t => t._id !== ticketId);
            setLocalTickets(updated);
            onTicketsUpdated(data.ticket);
            setReassigningId(null);
            showToast('Officer reassigned successfully');
        } catch (e) { showToast('Failed to reassign. Try again.'); }
        finally { setSaving(false); }
    };

    const handleDischarge = async (ticketId) => {
        setSaving(true);
        try {
            await dischargeOfficerFromTicket(ticketId);
            const updated = localTickets.filter(t => t._id !== ticketId);
            setLocalTickets(updated);
            onTicketsUpdated(null); // signal refresh
            showToast('Officer discharged. Ticket reset to Pending.');
        } catch (e) { showToast('Failed to discharge. Try again.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
                {toast && <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg z-10">{toast}</div>}

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-base flex items-center justify-center shadow-md">
                            {officer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">{officer.name}</h2>
                            <p className="text-xs text-slate-400">{officer.department} · {officer.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 text-xl flex items-center justify-center transition-colors">×</button>
                </div>

                {/* Stats */}
                <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex gap-6 flex-shrink-0">
                    <div className="text-center"><p className="text-lg font-bold text-slate-800">{localTickets.length}</p><p className="text-xs text-slate-400">Assigned</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-blue-600">{localTickets.filter(t => t.status === 'In Progress').length}</p><p className="text-xs text-slate-400">In Progress</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-emerald-600">{localTickets.filter(t => t.status === 'Resolved').length}</p><p className="text-xs text-slate-400">Resolved</p></div>
                </div>

                {/* Ticket List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {localTickets.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-slate-300 gap-2">
                            <span className="text-5xl">📭</span>
                            <p className="text-sm font-medium text-slate-400">No complaints currently assigned to this officer</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {localTickets.map(ticket => (
                                <div key={ticket._id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <p className="font-bold text-slate-800 text-sm truncate">{ticket.title}</p>
                                                <StatusBadge status={ticket.status} />
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{ticket.location} · {ticket.department}</p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">{ticket.ticketId}</p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex-shrink-0 flex flex-col gap-2">
                                            {reassigningId === ticket._id ? (
                                                <div className="flex gap-1.5 items-center">
                                                    <select value={newOfficerId} onChange={e => setNewOfficerId(e.target.value)} autoFocus
                                                        className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px]">
                                                        <option value="">Select officer…</option>
                                                        {allOfficers.filter(o => o._id !== officer._id).map(o => (
                                                            <option key={o._id} value={o._id}>{o.name} ({o.department})</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={() => handleReassign(ticket._id)} disabled={saving || !newOfficerId}
                                                        className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40">
                                                        {saving ? '…' : '✓'}
                                                    </button>
                                                    <button onClick={() => setReassigningId(null)} className="text-slate-400 hover:text-red-500 text-xs px-1">✕</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => { setReassigningId(ticket._id); setNewOfficerId(''); }}
                                                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                                        Reassign
                                                    </button>
                                                    <button onClick={() => handleDischarge(ticket._id)} disabled={saving}
                                                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                                                        Discharge
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────
const ManageOfficers = () => {
    const [officers, setOfficers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [o, t] = await Promise.all([fetchOfficers(), fetchAllTickets()]);
            setOfficers(o);
            setTickets(t);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Per-officer ticket stats
    const officerStats = useMemo(() => {
        const map = {};
        tickets.forEach(t => {
            if (t.assignedOfficerId?._id) {
                const id = t.assignedOfficerId._id;
                if (!map[id]) map[id] = { total: 0, resolved: 0, inProgress: 0, tickets: [] };
                map[id].total++;
                map[id].tickets.push(t);
                if (t.status === 'Resolved') map[id].resolved++;
                if (t.status === 'In Progress') map[id].inProgress++;
            }
        });
        return map;
    }, [tickets]);

    const filteredOfficers = useMemo(() => {
        let r = [...officers];
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(o => o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || o.department?.toLowerCase().includes(q));
        }
        if (deptFilter) r = r.filter(o => o.department === deptFilter);
        return r;
    }, [officers, search, deptFilter]);

    const allDepts = useMemo(() => [...new Set(officers.map(o => o.department).filter(Boolean))].sort(), [officers]);

    const handleOfficerCreated = (newOfficer) => {
        setOfficers(prev => [newOfficer, ...prev]);
    };

    const handleTicketsUpdated = () => { loadData(); };

    const openOfficerModal = (officer) => {
        const stats = officerStats[officer._id] || { total: 0, resolved: 0, inProgress: 0, tickets: [] };
        setSelectedOfficer({ officer, ...stats });
    };

    // Overall stats
    const totalAssigned = Object.values(officerStats).reduce((s, o) => s + o.total, 0);
    const avgWorkload = officers.length > 0 ? (totalAssigned / officers.length).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manage Officers</h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {loading ? 'Loading…' : `${filteredOfficers.length} officers · ${totalAssigned} total assignments`}
                    </p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Officer
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">👮</div>
                    <div><p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Officers</p><p className="text-3xl font-bold text-slate-800">{loading ? '—' : officers.length}</p></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">📋</div>
                    <div><p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Avg Workload</p><p className="text-3xl font-bold text-slate-800">{loading ? '—' : avgWorkload}</p></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">⭐</div>
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Top Performer</p>
                        <p className="text-base font-bold text-slate-800 truncate">
                            {loading ? '—' : Object.values(officerStats).sort((a,b) => b.resolved - a.resolved)[0]
                                ? (() => { const top = Object.values(officerStats).sort((a,b) => b.resolved - a.resolved)[0]; return officers.find(o => officerStats[o._id] === top)?.name || '—'; })()
                                : 'No data'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search officers by name, email, department…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    <option value="">All Departments</option>
                    {allDepts.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>

            {/* ── Officer Cards Grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
                            <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-3.5 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div></div>
                            <div className="h-2 bg-slate-200 rounded" /><div className="h-8 bg-slate-200 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : filteredOfficers.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-slate-300 gap-2">
                    <span className="text-6xl">👮</span>
                    <p className="text-sm font-semibold text-slate-400">{search || deptFilter ? 'No officers match your search' : 'No officers registered yet'}</p>
                    <button onClick={() => setShowAddModal(true)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2">Add your first officer →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOfficers.map(officer => {
                        const stats = officerStats[officer._id] || { total: 0, resolved: 0, inProgress: 0 };
                        const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                        return (
                            <div key={officer._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col group">
                                {/* Officer Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold text-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-500 group-hover:to-blue-700 group-hover:text-white transition-all duration-200">
                                        {officer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate text-sm">{officer.name}</p>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{officer.department || 'No Dept'}</span>
                                        <p className="text-xs text-slate-400 truncate mt-1">{officer.email}</p>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                                        <p className="text-base font-bold text-slate-700">{stats.total}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Assigned</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                                        <p className="text-base font-bold text-blue-600">{stats.inProgress}</p>
                                        <p className="text-xs text-blue-400 mt-0.5">Active</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                                        <p className="text-base font-bold text-emerald-600">{stats.resolved}</p>
                                        <p className="text-xs text-emerald-400 mt-0.5">Resolved</p>
                                    </div>
                                </div>

                                {/* Resolution Rate Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs text-slate-500 font-medium">Resolution Rate</span>
                                        <span className={`text-xs font-bold ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{rate}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-1.5 rounded-full transition-all duration-700 ${rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                                            style={{ width: `${rate}%` }} />
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button onClick={() => openOfficerModal(officer)}
                                    className="w-full text-sm font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 py-2.5 rounded-xl transition-all duration-200 mt-auto">
                                    View Complaints ({stats.total})
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modals ── */}
            {showAddModal && (
                <AddOfficerModal onClose={() => setShowAddModal(false)} onCreated={handleOfficerCreated} />
            )}
            {selectedOfficer && (
                <OfficerModal
                    officerData={selectedOfficer}
                    allOfficers={officers}
                    allTickets={tickets}
                    onClose={() => setSelectedOfficer(null)}
                    onTicketsUpdated={handleTicketsUpdated}
                />
            )}
        </div>
    );
};

export default ManageOfficers;
