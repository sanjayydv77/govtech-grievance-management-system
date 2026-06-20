import React, { useState } from 'react';
import { sendAdminFeedback } from '../services/api';

const TicketDetailsModal = ({ ticket, onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [sending, setSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    if (!ticket) return null;

    const handleSendFeedback = async () => {
        if (!feedback.trim()) return;
        setSending(true);
        try {
            await sendAdminFeedback(ticket._id, feedback);
            setSuccessMsg('Feedback sent successfully!');
            setFeedback('');
            setTimeout(() => setSuccessMsg(''), 3000);
            
            // Optimistically update the ticket's local state so the new message shows
            ticket.adminMessages = ticket.adminMessages || [];
            ticket.adminMessages.push({ message: feedback, timestamp: new Date().toISOString() });
        } catch (error) {
            console.error('Error sending feedback', error);
            alert('Failed to send feedback.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Complaint Details</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Details */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Title</p>
                            <p className="text-lg font-medium text-slate-900 mt-1">{ticket.title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                            <p className="text-slate-700 mt-1 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{ticket.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Location</p>
                                <p className="text-slate-800 mt-1 font-medium">{ticket.location}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                      ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                                      ticket.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700' : 
                                      'bg-amber-100 text-amber-700'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Citizen</p>
                                <p className="text-slate-800 mt-1 font-medium">{ticket.citizenId?.name || 'Anonymous'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Assigned Officer</p>
                                <p className="text-slate-800 mt-1 font-medium">{ticket.assignedOfficerId?.name || 'Unassigned'}</p>
                            </div>
                        </div>

                        {/* Citizen Uploaded Media */}
                        {ticket.citizenMedia && ticket.citizenMedia.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Citizen Uploaded Media</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {ticket.citizenMedia.map((url, i) => (
                                        <img key={i} src={url} alt={`Citizen upload ${i}`} className="h-32 w-48 object-cover rounded-lg shadow-sm border border-slate-200" />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Previous Admin Messages */}
                        {ticket.adminMessages && ticket.adminMessages.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3">Feedback History</p>
                                <div className="space-y-3">
                                    {ticket.adminMessages.map((msg, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                                            <p className="text-xs text-slate-400 mb-1">{new Date(msg.timestamp).toLocaleString()}</p>
                                            <p className="text-sm text-slate-700">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Admin Actions */}
                    <div className="w-full lg:w-1/3 flex flex-col space-y-4">
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex-1 flex flex-col">
                            <h3 className="text-md font-bold text-slate-800 mb-4">Officer Feedback</h3>
                            <p className="text-sm text-slate-600 mb-4">Send a direct message or feedback to the assigned officer regarding this complaint.</p>
                            
                            <textarea
                                className="w-full flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                                placeholder="Type your message here..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            ></textarea>

                            {successMsg && (
                                <p className="text-emerald-600 text-sm font-medium mt-3">{successMsg}</p>
                            )}

                            <button
                                onClick={handleSendFeedback}
                                disabled={sending || !feedback.trim() || !ticket.assignedOfficerId}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
                            >
                                {sending ? 'Sending...' : 'Send Feedback'}
                            </button>
                            
                            {!ticket.assignedOfficerId && (
                                <p className="text-xs text-red-500 mt-2 text-center">Cannot send feedback: No officer assigned.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsModal;
