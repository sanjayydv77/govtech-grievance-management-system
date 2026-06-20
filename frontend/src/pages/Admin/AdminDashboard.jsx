import React, { useState, useEffect } from 'react';
import { fetchAllTickets, fetchOfficers } from '../../services/api';
import TicketDetailsModal from '../../components/TicketDetailsModal';

const AdminDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ticketsData, officersData] = await Promise.all([
                    fetchAllTickets(),
                    fetchOfficers()
                ]);
                setTickets(ticketsData);
                setOfficers(officersData);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Derived Statistics
    const totalComplaints = tickets.length;
    const resolvedComplaints = tickets.filter(t => t.status === 'Resolved').length;
    const pendingVerifications = tickets.filter(t => t.verificationStatus === 'Pending').length;
    const activeOfficers = officers.length;

    const stats = [
        { title: 'Total Complaints', value: totalComplaints, trend: '+5.2%', trendUp: true },
        { title: 'Resolved Complaints', value: resolvedComplaints, trend: '+12.1%', trendUp: true },
        { title: 'Active Officers', value: activeOfficers, trend: 'Stable', trendUp: true },
        { title: 'Pending Verifications', value: pendingVerifications, trend: '-1.5%', trendUp: true },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Top Section: Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div 
                        key={index} 
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300"
                    >
                        <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.title}</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-slate-800">{loading ? '...' : stat.value}</p>
                            <span className={`text-sm font-semibold flex items-center ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stat.trendUp ? '↑' : '↓'} {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">All Complaints Overview</h2>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        Export CSV
                    </button>
                </div>
                
                <div className="overflow-x-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Loading complaints...</div>
                    ) : tickets.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-slate-500 font-medium">No complaints found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold">Complaint Title</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Assigned Officer</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm">
                                {tickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-xs">{ticket.title}</td>
                                        <td className="px-6 py-4 text-slate-700 truncate max-w-[200px]">{ticket.location}</td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {ticket.assignedOfficerId?.name ? (
                                                <div className="flex flex-col">
                                                    <span>{ticket.assignedOfficerId.name}</span>
                                                    <span className="text-xs text-slate-400">{ticket.assignedOfficerId.department}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                                                ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                  ticket.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700' : 
                                                  'bg-amber-100 text-amber-700'}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
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
            </div>

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <TicketDetailsModal 
                    ticket={selectedTicket} 
                    onClose={() => setSelectedTicket(null)} 
                />
            )}
        </div>
    );
};

export default AdminDashboard;
