import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchAllTickets, fetchOfficers } from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────
const Icons = {
    Document: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Clock: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Pin: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    Wrench: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Check: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    X: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Chart: <svg className="w-10 h-10 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Inbox: <svg className="w-10 h-10 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
};

const StatusBadge = ({ status }) => {
    const s = {
        'Resolved': 'bg-emerald-100 text-emerald-700', 'In Progress': 'bg-blue-100 text-blue-700',
        'Assigned': 'bg-blue-100 text-blue-700', 'Rejected': 'bg-red-100 text-red-700',
        'Pending': 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
};

const StatCard = ({ title, value, icon, bg, textColor, loading, onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${bg}`}>{icon}</div>
        <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
            <p className={`text-3xl font-bold mt-0.5 ${textColor || 'text-blue-900'}`}>
                {loading ? <span className="inline-block w-10 h-7 bg-slate-200 rounded animate-pulse" /> : (value ?? 0)}
            </p>
        </div>
    </div>
);

const Skeleton = ({ h = 'h-4', w = 'w-full', className = '' }) => (
    <div className={`${h} ${w} bg-slate-200 rounded animate-pulse ${className}`} />
);

// ── Main Component ────────────────────────────────────────────
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [s, t, o] = await Promise.all([fetchStats(), fetchAllTickets(), fetchOfficers()]);
                setStats(s);
                setTickets(t);
                setOfficers(o);
            } catch (e) { console.error('Overview load error:', e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    // Officer performance derived from ticket data
    const officerPerf = useMemo(() => {
        const map = {};
        tickets.forEach(t => {
            if (t.assignedOfficerId?._id) {
                const id = t.assignedOfficerId._id;
                if (!map[id]) map[id] = { officer: t.assignedOfficerId, total: 0, resolved: 0, inProgress: 0, pending: 0 };
                map[id].total++;
                if (t.status === 'Resolved') map[id].resolved++;
                else if (t.status === 'In Progress') map[id].inProgress++;
                else if (t.status === 'Pending' || t.status === 'Assigned') map[id].pending++;
            }
        });
        return Object.values(map).sort((a, b) => b.resolved - a.resolved).slice(0, 5);
    }, [tickets]);

    const recentTickets = tickets.slice(0, 8);
    const maxDeptCount = Math.max(...(stats?.byDepartment?.map(d => d.count) || [1]), 1);
    const resRate = stats?.total ? Math.round(((stats.byStatus?.resolved || 0) / stats.total) * 100) : 0;

    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Here's what's happening on the Delhi CM Portal today.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/dashboard/admin/complaints')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
                        Manage Complaints →
                    </button>
                </div>
            </div>

            {/* ── 6 Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Total" value={stats?.total} icon={Icons.Document} bg="bg-slate-100 text-slate-600" loading={loading} onClick={() => navigate('/dashboard/admin/complaints')} />
                <StatCard title="Pending" value={stats?.byStatus?.pending} icon={Icons.Clock} bg="bg-amber-50 text-amber-600" textColor="text-amber-700" loading={loading} onClick={() => navigate('/dashboard/admin/complaints?status=Pending')} />
                <StatCard title="Assigned" value={stats?.byStatus?.assigned} icon={Icons.Pin} bg="bg-blue-50 text-blue-600" textColor="text-blue-700" loading={loading} />
                <StatCard title="In Progress" value={stats?.byStatus?.inProgress} icon={Icons.Wrench} bg="bg-blue-50 text-blue-600" textColor="text-blue-700" loading={loading} />
                <StatCard title="Resolved" value={stats?.byStatus?.resolved} icon={Icons.Check} bg="bg-emerald-50 text-emerald-600" textColor="text-emerald-700" loading={loading} />
                <StatCard title="Rejected" value={stats?.byStatus?.rejected} icon={Icons.X} bg="bg-red-50 text-red-500" textColor="text-red-600" loading={loading} />
            </div>

            {/* ── Middle Row: Dept Breakdown + Recent Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Department Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-blue-900 mb-5">Department Breakdown</h3>
                    {loading ? (
                        <div className="space-y-4">{[1,2,3,4].map(i => (<div key={i}><div className="flex justify-between mb-1.5"><Skeleton h="h-3.5" w="w-24" /><Skeleton h="h-3.5" w="w-8" /></div><Skeleton h="h-2" /></div>))}</div>
                    ) : stats?.byDepartment?.length ? (
                        <div className="space-y-5">
                            {stats.byDepartment.map(d => (
                                <div key={d._id}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-semibold text-slate-700">{d._id || 'Unknown'}</span>
                                        <span className="text-sm font-bold text-blue-900 tabular-nums">{d.count} <span className="text-xs text-slate-400 font-normal">complaints</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out"
                                            style={{ width: `${Math.round((d.count / maxDeptCount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-10 text-slate-400">
                            {Icons.Chart}
                            <p className="text-sm font-medium">No department data yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-blue-900">Recent Activity</h3>
                        <button onClick={() => navigate('/dashboard/admin/complaints')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                            View All →
                        </button>
                    </div>
                    {loading ? (
                        <div className="space-y-4">{[1,2,3,4,5,6].map(i => (<div key={i} className="flex items-center gap-3"><Skeleton h="h-8" w="w-8" className="rounded-full flex-shrink-0" /><div className="flex-1 space-y-1.5"><Skeleton h="h-3" /><Skeleton h="h-3" w="w-2/3" /></div></div>))}</div>
                    ) : recentTickets.length ? (
                        <div className="space-y-1">
                            {recentTickets.map(t => (
                                <div key={t._id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 group">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-blue-900 truncate">{t.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{t.location} · {t.department || 'Unclassified'} · {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-10 text-slate-400">
                            {Icons.Inbox}
                            <p className="text-sm font-medium">No complaints yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Officer Performance Table ── */}
            {!loading && officerPerf.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-blue-900">Officer Performance</h3>
                        <button onClick={() => navigate('/dashboard/admin/officers')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                            Manage Officers →
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {['Officer', 'Department', 'Assigned', 'In Progress', 'Resolved', 'Resolution Rate'].map(h => (
                                        <th key={h} className="py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4 last:text-center">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {officerPerf.map(({ officer, total, resolved, inProgress }) => {
                                    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
                                    return (
                                        <tr key={officer._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 pr-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                                        {officer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-blue-900 truncate">{officer.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-medium">{officer.department || '—'}</span>
                                            </td>
                                            <td className="py-3.5 pr-4 font-bold text-blue-900 tabular-nums">{total}</td>
                                            <td className="py-3.5 pr-4">
                                                <span className="text-blue-600 font-bold tabular-nums">{inProgress}</span>
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <span className="text-emerald-600 font-bold tabular-nums">{resolved}</span>
                                            </td>
                                            <td className="py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full ${rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${rate}%` }} />
                                                    </div>
                                                    <span className={`font-bold tabular-nums text-xs ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Bottom Summary Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Active Officers</p>
                    <p className="text-4xl font-bold">{loading ? '—' : officers.length}</p>
                    <button onClick={() => navigate('/dashboard/admin/officers')} className="mt-3 text-xs text-blue-200 hover:text-white font-medium">Manage →</button>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200">
                    <p className="text-xs font-semibold text-amber-100 uppercase tracking-wider mb-1">Needs Attention</p>
                    <p className="text-4xl font-bold">{loading ? '—' : (stats?.pendingVerification ?? 0)}</p>
                    <p className="mt-3 text-xs text-amber-100">Pending verification</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
                    <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider mb-1">Resolution Rate</p>
                    <p className="text-4xl font-bold">{loading ? '—' : `${resRate}%`}</p>
                    <p className="mt-3 text-xs text-emerald-100">Overall portal performance</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
