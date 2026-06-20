import React, { useState } from 'react';
import { sendAdminFeedback } from '../services/api';

// ── Status badge helper ────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        'Resolved':    'bg-emerald-100 text-emerald-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Assigned':    'bg-indigo-100 text-indigo-700',
        'Rejected':    'bg-red-100 text-red-700',
        'Pending':     'bg-amber-100 text-amber-700',
    };
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
        </span>
    );
};

// ── Media gallery helper ───────────────────────────────────────
const MediaGallery = ({ urls, label }) => {
    if (!urls || urls.length === 0) return null;
    return (
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                            src={url}
                            alt={`${label} ${i + 1}`}
                            className="h-28 w-44 object-cover rounded-lg shadow-sm border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
                        />
                    </a>
                ))}
            </div>
        </div>
    );
};

// ── Main Modal ─────────────────────────────────────────────────
const TicketDetailsModal = ({ ticket, onClose, onTicketUpdated }) => {
    const [feedback, setFeedback] = useState('');
    const [sending, setSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!ticket) return null;

    const handleSendFeedback = async () => {
        if (!feedback.trim()) return;
        setSending(true);
        setErrorMsg('');
        try {
            const data = await sendAdminFeedback(ticket._id, feedback);

            setSuccessMsg('Feedback sent successfully!');
            setFeedback('');
            setTimeout(() => setSuccessMsg(''), 3000);

            // ✅ Fixed: call parent callback instead of mutating prop
            if (onTicketUpdated && data.ticket) {
                onTicketUpdated(data.ticket);
            }
        } catch (error) {
            console.error('Error sending feedback', error);
            setErrorMsg('Failed to send feedback. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

                {/* ── Header ── */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Complaint Details</h2>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {ticket._id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors text-xl font-light"
                    >
                        ×
                    </button>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">

                    {/* Left column — Full complaint info */}
                    <div className="flex-1 space-y-5 min-w-0">

                        {/* Title + Description */}
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Title</p>
                            <p className="text-base font-semibold text-slate-900">{ticket.title}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {ticket.description}
                            </p>
                        </div>

                        {/* Grid: meta info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <StatusBadge status={ticket.status} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Verification</p>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    ticket.verificationStatus === 'Verified Real' ? 'bg-emerald-100 text-emerald-700' :
                                    ticket.verificationStatus === 'Flagged False' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {ticket.verificationStatus}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                <p className="text-slate-800 font-medium">{ticket.location}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                <p className="text-slate-800 font-medium">{ticket.department || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Citizen</p>
                                <p className="text-slate-800 font-medium">{ticket.citizenId?.name || 'Anonymous'}</p>
                                <p className="text-xs text-slate-400">{ticket.citizenId?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Assigned Officer</p>
                                <p className="text-slate-800 font-medium">{ticket.assignedOfficerId?.name || 'Unassigned'}</p>
                                <p className="text-xs text-slate-400">{ticket.assignedOfficerId?.department}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                                <p className="text-slate-800">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                                <p className="text-slate-800">{new Date(ticket.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Resolution Notes */}
                        {ticket.resolutionNotes && (
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-1">Resolution Notes</p>
                                <p className="text-sm text-emerald-800">{ticket.resolutionNotes}</p>
                            </div>
                        )}

                        {/* ── Media Galleries — ALL 4 stages ── */}
                        <div className="space-y-4 pt-2">
                            <MediaGallery urls={ticket.citizenMedia} label="📎 Citizen Uploaded Media" />
                            <MediaGallery urls={ticket.officerVerificationMedia} label="🔍 Officer Verification Media" />
                            <MediaGallery urls={ticket.officerProgressMedia} label="🔧 Officer Progress Media" />
                            <MediaGallery urls={ticket.officerResolutionMedia} label="✅ Officer Resolution Media" />
                        </div>

                        {/* Admin Messages History */}
                        {ticket.adminMessages && ticket.adminMessages.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">
                                    💬 Admin Feedback History ({ticket.adminMessages.length})
                                </p>
                                <div className="space-y-2">
                                    {ticket.adminMessages.map((msg, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                                            <p className="text-xs text-slate-400 mb-1">
                                                {new Date(msg.timestamp).toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-sm text-slate-700">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — Admin Actions */}
                    <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col gap-3 sticky top-0">
                            <h3 className="text-sm font-bold text-slate-800">📨 Send Feedback to Officer</h3>
                            <p className="text-xs text-slate-500">
                                Message will be logged on the ticket and visible to the assigned officer.
                            </p>
                            <textarea
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm h-28"
                                placeholder="Type your instruction or feedback..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />

                            {successMsg && (
                                <p className="text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                                    ✓ {successMsg}
                                </p>
                            )}
                            {errorMsg && (
                                <p className="text-red-600 text-xs font-medium bg-red-50 px-3 py-2 rounded-lg">
                                    ✗ {errorMsg}
                                </p>
                            )}

                            <button
                                onClick={handleSendFeedback}
                                disabled={sending || !feedback.trim() || !ticket.assignedOfficerId}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
                            >
                                {sending ? 'Sending...' : 'Send Feedback'}
                            </button>

                            {!ticket.assignedOfficerId && (
                                <p className="text-xs text-amber-600 text-center">
                                    ⚠ Assign an officer first before sending feedback.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsModal;
