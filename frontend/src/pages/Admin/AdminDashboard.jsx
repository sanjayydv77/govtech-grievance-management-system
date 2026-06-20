import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchAllTickets, fetchOfficers } from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const s = {
        'Resolved': 'bg-emerald-100 text-emerald-700', 'In Progress': 'bg-blue-100 text-blue-700',
        'Assigned': 'bg-indigo-100 text-indigo-700', 'Rejected': 'bg-red-100 text-red-700',
        'Pending': 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
};

const StatCard = ({ title, value, icon, bg, textColor, loading, onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${bg}`}>{icon}</div>
        <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
            <p className={`text-3xl font-bold mt-0.5 ${textColor || 'text-slate-800'}`}>
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
                    <h2 className="text-2xl font-bold text-slate-800">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Here's what's happening on the Delhi CM Portal today.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/dashboard/admin/complaints')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200">
                        Manage Complaints →
                    </button>
                </div>
            </div>

            {/* ── 6 Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Total" value={stats?.total} icon="📋" bg="bg-slate-100" loading={loading} onClick={() => navigate('/dashboard/admin/complaints')} />
                <StatCard title="Pending" value={stats?.byStatus?.pending} icon="⏳" bg="bg-amber-50" textColor="text-amber-700" loading={loading} onClick={() => navigate('/dashboard/admin/complaints?status=Pending')} />
                <StatCard title="Assigned" value={stats?.byStatus?.assigned} icon="📌" bg="bg-indigo-50" textColor="text-indigo-700" loading={loading} />
                <StatCard title="In Progress" value={stats?.byStatus?.inProgress} icon="🔧" bg="bg-blue-50" textColor="text-blue-700" loading={loading} />
                <StatCard title="Resolved" value={stats?.byStatus?.resolved} icon="✅" bg="bg-emerald-50" textColor="text-emerald-700" loading={loading} />
                <StatCard title="Rejected" value={stats?.byStatus?.rejected} icon="❌" bg="bg-red-50" textColor="text-red-600" loading={loading} />
            </div>

            {/* ── Middle Row: Dept Breakdown + Recent Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Department Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-5">Department Breakdown</h3>
                    {loading ? (
                        <div className="space-y-4">{[1,2,3,4].map(i => (<div key={i}><div className="flex justify-between mb-1.5"><Skeleton h="h-3.5" w="w-24" /><Skeleton h="h-3.5" w="w-8" /></div><Skeleton h="h-2" /></div>))}</div>
                    ) : stats?.byDepartment?.length ? (
                        <div className="space-y-5">
                            {stats.byDepartment.map(d => (
                                <div key={d._id}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-semibold text-slate-700">{d._id || 'Unknown'}</span>
                                        <span className="text-sm font-bold text-slate-800 tabular-nums">{d.count} <span className="text-xs text-slate-400 font-normal">complaints</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700 ease-out"
                                            style={{ width: `${Math.round((d.count / maxDeptCount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-10 text-slate-300">
                            <span className="text-4xl mb-2">📊</span>
                            <p className="text-sm">No department data yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
                        <button onClick={() => navigate('/dashboard/admin/complaints')} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                            View All →
                        </button>
                    </div>
                    {loading ? (
                        <div className="space-y-4">{[1,2,3,4,5,6].map(i => (<div key={i} className="flex items-center gap-3"><Skeleton h="h-8" w="w-8" className="rounded-full flex-shrink-0" /><div className="flex-1 space-y-1.5"><Skeleton h="h-3" /><Skeleton h="h-3" w="w-2/3" /></div></div>))}</div>
                    ) : recentTickets.length ? (
                        <div className="space-y-1">
                            {recentTickets.map(t => (
                                <div key={t._id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 group">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-indigo-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{t.location} · {t.department || 'Unclassified'} · {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-10 text-slate-300">
                            <span className="text-4xl mb-2">📭</span>
                            <p className="text-sm">No complaints yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Officer Performance Table ── */}
            {!loading && officerPerf.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-800">Officer Performance</h3>
                        <button onClick={() => navigate('/dashboard/admin/officers')} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
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
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                                        {officer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-slate-800 truncate">{officer.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-medium">{officer.department || '—'}</span>
                                            </td>
                                            <td className="py-3.5 pr-4 font-bold text-slate-800 tabular-nums">{total}</td>
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
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                    <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Active Officers</p>
                    <p className="text-4xl font-bold">{loading ? '—' : officers.length}</p>
                    <button onClick={() => navigate('/dashboard/admin/officers')} className="mt-3 text-xs text-indigo-200 hover:text-white font-medium">Manage →</button>
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
