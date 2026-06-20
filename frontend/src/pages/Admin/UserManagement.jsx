import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllUsers, deleteUser, createUserByAdmin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Role Badge ────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
    const s = {
        admin:   'bg-purple-100 text-purple-700 border border-purple-200',
        cm:      'bg-rose-100 text-rose-700 border border-rose-200',
        officer: 'bg-blue-100 text-blue-700 border border-blue-200',
        citizen: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
    const labels = { admin: '⚙ Admin', cm: '🏛 CM', officer: '👮 Officer', citizen: '👤 Citizen' };
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${s[role] || 'bg-slate-100 text-slate-600'}`}>
            {labels[role] || role}
        </span>
    );
};

const TABS = ['All', 'Citizens', 'Officers', 'Admins'];
const TAB_ROLES = { 'All': null, 'Citizens': 'citizen', 'Officers': 'officer', 'Admins': ['admin', 'cm'] };

const DEPARTMENTS = ['PWD', 'Jal Board', 'Health', 'Education', 'Electricity', 'Transport', 'Revenue', 'Social Welfare', 'Police', 'Fire', 'Other'];

// ── Add User Modal ────────────────────────────────────────────
const AddUserModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'officer', department: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.role === 'officer' && !form.department) { setError('Department required for officer.'); return; }
        setLoading(true);
        try {
            const data = await createUserByAdmin({ ...form });
            onCreated(data.user);
            onClose();
        } catch (err) { setError(err.response?.data?.error || 'Failed to create user.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Create User Account</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Create officer, admin, or CM accounts</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xl transition-colors">×</button>
                </div>
                {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-xl mb-4 border border-red-100">⚠ {error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name"
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number"
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="user@delhi.gov.in"
                            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Role *</label>
                            <select name="role" value={form.role} onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="officer">Officer</option>
                                <option value="admin">Admin</option>
                                <option value="cm">CM</option>
                            </select>
                        </div>
                        {form.role === 'officer' && (
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Department *</label>
                                <select name="department" value={form.department} onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="">Select…</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Password *</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters"
                            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm shadow-blue-200">
                            {loading ? 'Creating…' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Delete Confirmation ───────────────────────────────────────
const DeleteConfirmInline = ({ userName, onConfirm, onCancel, loading }) => (
    <div className="flex items-center gap-2">
        <p className="text-xs text-red-600 font-medium">Delete <b>{userName}</b>?</p>
        <button onClick={onConfirm} disabled={loading}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50">
            {loading ? '…' : 'Yes, Delete'}
        </button>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg">Cancel</button>
    </div>
);

// ── Main Component ────────────────────────────────────────────
const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllUsers();
            setUsers(data);
        } catch (e) { showToast('Failed to load users', 'error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Role-filtered + searched users
    const filteredUsers = useMemo(() => {
        let r = [...users];
        const roleFilter = TAB_ROLES[activeTab];
        if (roleFilter) {
            if (Array.isArray(roleFilter)) r = r.filter(u => roleFilter.includes(u.role));
            else r = r.filter(u => u.role === roleFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q));
        }
        return r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [users, activeTab, search]);

    // Tab counts
    const counts = useMemo(() => ({
        All: users.length,
        Citizens: users.filter(u => u.role === 'citizen').length,
        Officers: users.filter(u => u.role === 'officer').length,
        Admins: users.filter(u => ['admin','cm'].includes(u.role)).length,
    }), [users]);

    const handleDelete = async (userId, userName) => {
        setDeleteLoading(true);
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(u => u._id !== userId));
            setDeletingId(null);
            showToast(`"${userName}" removed successfully`);
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to delete user.', 'error');
        } finally { setDeleteLoading(false); }
    };

    const handleUserCreated = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        showToast(`${newUser.role} account created for ${newUser.name}`);
    };

    return (
        <div className="space-y-5">
            {/* Toast */}
            {toast.msg && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
                    {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm mt-0.5">{loading ? 'Loading…' : `${filteredUsers.length} of ${users.length} users`}</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Account
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: '👥', bg: 'bg-slate-50' },
                    { label: 'Citizens', value: counts.Citizens, icon: '👤', bg: 'bg-blue-50' },
                    { label: 'Officers', value: counts.Officers, icon: '👮', bg: 'bg-blue-50' },
                    { label: 'Admin/CM', value: counts.Admins, icon: '⚙', bg: 'bg-purple-50' },
                ].map(c => (
                    <div key={c.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-xl flex-shrink-0`}>{c.icon}</div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{c.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{loading ? '—' : c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabs + Search ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {tab} <span className="text-xs font-normal text-slate-400">({counts[tab]})</span>
                        </button>
                    ))}
                </div>
                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
            </div>

            {/* ── Users Table ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                        <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Loading users…</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
                        <span className="text-5xl">👥</span>
                        <p className="text-sm font-semibold text-slate-400">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">User</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Role</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Department</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Phone</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Registered</th>
                                    <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(u => {
                                    const isSelf = u._id === currentUser?._id;
                                    const isProtected = ['admin', 'cm'].includes(u.role);
                                    const canDelete = !isSelf && !isProtected;

                                    return (
                                        <tr key={u._id} className={`hover:bg-slate-50/60 transition-colors ${isSelf ? 'bg-blue-50/30' : ''}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        u.role === 'cm' ? 'bg-rose-100 text-rose-700' :
                                                        u.role === 'officer' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {(u.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 truncate">
                                                            {u.name} {isSelf && <span className="text-blue-500 text-xs font-semibold">(You)</span>}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                                            <td className="px-5 py-4">
                                                {u.department ? (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-medium">{u.department}</span>
                                                ) : <span className="text-slate-300 text-xs">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600 font-mono">{u.phone || '—'}</td>
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {deletingId === u._id ? (
                                                    <DeleteConfirmInline
                                                        userName={u.name}
                                                        onConfirm={() => handleDelete(u._id, u.name)}
                                                        onCancel={() => setDeletingId(null)}
                                                        loading={deleteLoading}
                                                    />
                                                ) : canDelete ? (
                                                    <button onClick={() => setDeletingId(u._id)}
                                                        className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-300 px-3 py-1.5">{isSelf ? 'Current user' : 'Protected'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && filteredUsers.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-400">Showing <b className="text-slate-600">{filteredUsers.length}</b> of <b className="text-slate-600">{users.length}</b> users</p>
                    </div>
                )}
            </div>

            {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onCreated={handleUserCreated} />}
        </div>
    );
};

export default UserManagement;
