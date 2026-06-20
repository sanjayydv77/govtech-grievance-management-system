import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import './OfficerDashboard.css';

// Mock Fetch Implementation for the Dashboard
// Note: In production, the Lead Dev will replace this with real endpoints
const mockTickets = [
    { id: 'TKT-1029', title: 'Pothole on Main St', description: 'Large pothole causing traffic slowdowns and potential vehicle damage.', location: 'Main St. & 4th Ave', status: 'Assigned', createdAt: '2026-06-18T10:00:00Z' },
    { id: 'TKT-1030', title: 'Streetlight out', description: 'Streetlight has been out for 3 days in the residential area.', location: 'Oakwood Drive', status: 'In Progress', createdAt: '2026-06-19T14:30:00Z' },
    { id: 'TKT-1031', title: 'Water Leak', description: 'Water pipe leaking near the sidewalk.', location: '500 Block, Pine St', status: 'Assigned', createdAt: '2026-06-20T08:15:00Z' }
];

let serverData = [...mockTickets];

const mockFetch = (url, options = {}) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (url === '/api/tickets/officer' && (!options.method || options.method === 'GET')) {
                resolve({
                    ok: true,
                    json: () => Promise.resolve([...serverData])
                });
            } else if (url.startsWith('/api/tickets/officer/') && options.method === 'PUT') {
                const id = url.split('/').pop();
                const body = JSON.parse(options.body);
                serverData = serverData.map(ticket => 
                    ticket.id === id ? { ...ticket, ...body } : ticket
                );
                resolve({
                    ok: true,
                    json: () => Promise.resolve(serverData.find(t => t.id === id))
                });
            }
        }, 600); // simulated network delay
    });
};

const OfficerDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingTicketId, setResolvingTicketId] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await mockFetch('/api/tickets/officer');
            const data = await response.json();
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus, notes = '') => {
        try {
            setUpdatingId(id);
            const payload = { status: newStatus };
            if (notes) {
                payload.resolutionNotes = notes;
            }

            const response = await mockFetch(`/api/tickets/officer/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const updatedTicket = await response.json();
                setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
                if (newStatus === 'Resolved') {
                    setResolvingTicketId(null);
                    setResolutionNotes('');
                }
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Assigned': return 'status-assigned';
            case 'In Progress': return 'status-inprogress';
            case 'Resolved': return 'status-resolved';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="officer-dashboard">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your queue...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="officer-dashboard">
            <header className="dashboard-header">
                <div className="header-title">
                    <div className="header-icon">
                        <ClipboardList size={24} />
                    </div>
                    <h1>Officer Ticketing Queue</h1>
                </div>
            </header>

            <main className="dashboard-content">
                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2>No tickets assigned</h2>
                        <p>You're all caught up! Enjoy your day.</p>
                    </div>
                ) : (
                    <div className="tickets-grid">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="ticket-card">
                                <div className="ticket-card-header">
                                    <span className="ticket-id">{ticket.id}</span>
                                    <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                
                                <h3 className="ticket-title">{ticket.title}</h3>
                                <p className="ticket-description">{ticket.description}</p>
                                
                                <div className="ticket-meta">
                                    <div className="meta-item">
                                        <MapPin size={16} />
                                        <span>{ticket.location}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={16} />
                                        <span>{formatDate(ticket.createdAt)}</span>
                                    </div>
                                </div>

                                {ticket.status === 'Resolved' && ticket.resolutionNotes && (
                                    <div className="ticket-resolved-notes">
                                        <span className="resolved-notes-label">Resolution Notes:</span>
                                        <p className="resolved-notes-text">{ticket.resolutionNotes}</p>
                                    </div>
                                )}

                                <div className="ticket-actions">
                                    {ticket.status === 'Assigned' && (
                                        <button 
                                            className="action-btn btn-primary"
                                            onClick={() => handleStatusChange(ticket.id, 'In Progress')}
                                            disabled={updatingId === ticket.id}
                                        >
                                            {updatingId === ticket.id ? 'Updating...' : (
                                                <>
                                                    Start Progress <ArrowRight size={16} />
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {ticket.status === 'In Progress' && resolvingTicketId !== ticket.id && (
                                        <button 
                                            className="action-btn btn-primary"
                                            onClick={() => setResolvingTicketId(ticket.id)}
                                            disabled={updatingId === ticket.id}
                                        >
                                            Mark as Resolved <CheckCircle2 size={16} />
                                        </button>
                                    )}

                                    {resolvingTicketId === ticket.id && (
                                        <div className="resolution-input-container">
                                            <textarea 
                                                className="resolution-input"
                                                placeholder="Enter resolution notes... (required)"
                                                value={resolutionNotes}
                                                onChange={(e) => setResolutionNotes(e.target.value)}
                                            />
                                            <div className="resolution-actions">
                                                <button 
                                                    className="action-btn btn-cancel"
                                                    onClick={() => {
                                                        setResolvingTicketId(null);
                                                        setResolutionNotes('');
                                                    }}
                                                    disabled={updatingId === ticket.id}
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    className="action-btn btn-primary"
                                                    onClick={() => handleStatusChange(ticket.id, 'Resolved', resolutionNotes)}
                                                    disabled={!resolutionNotes.trim() || updatingId === ticket.id}
                                                >
                                                    {updatingId === ticket.id ? 'Saving...' : 'Submit Resolution'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OfficerDashboard;
