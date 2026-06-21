import api from './api';
import { notificationService } from './notificationService';

const extractDistrict = (locationStr) => {
  if (!locationStr) return 'Central Delhi';
  const loc = locationStr.toLowerCase();
  
  if (loc.includes('south west') || loc.includes('southwest')) return 'South West Delhi';
  if (loc.includes('north west') || loc.includes('northwest')) return 'North West Delhi';
  if (loc.includes('north east') || loc.includes('northeast')) return 'North East Delhi';
  if (loc.includes('south east') || loc.includes('southeast')) return 'South East Delhi';
  if (loc.includes('south delhi') || loc.includes('south')) return 'South Delhi';
  if (loc.includes('north delhi') || loc.includes('north')) return 'North Delhi';
  if (loc.includes('east delhi') || loc.includes('east')) return 'East Delhi';
  if (loc.includes('west delhi') || loc.includes('west')) return 'West Delhi';
  if (loc.includes('central delhi') || loc.includes('central') || loc.includes('old delhi') || loc.includes('karol bagh') || loc.includes('chandni') || loc.includes('indore')) return 'Central Delhi';
  if (loc.includes('new delhi')) return 'New Delhi';
  if (loc.includes('shahdara')) return 'Shahdara';
  
  const parts = locationStr.split(',');
  const lastPart = parts[parts.length - 1].trim();
  if (lastPart.toLowerCase().includes('delhi')) {
    return lastPart;
  }
  
  return 'Central Delhi';
};

// Adapter to transform backend Ticket to frontend Complaint format expected by Officer UI
const adaptTicketToComplaint = (ticket) => {
  // Aggregate all media into a unified attachments array
  const attachments = [];
  let attachmentIdCounter = 1;

  if (ticket.citizenMedia) {
    ticket.citizenMedia.forEach(url => {
      attachments.push({ id: `att-${attachmentIdCounter++}`, url, name: 'Citizen Upload', uploader: 'citizen' });
    });
  }
  const allOfficerMedia = [
    ...(ticket.officerVerificationMedia || []),
    ...(ticket.officerProgressMedia || []),
    ...(ticket.officerResolutionMedia || [])
  ];
  allOfficerMedia.forEach(url => {
    attachments.push({ id: `att-${attachmentIdCounter++}`, url, name: 'Officer Upload', uploader: 'officer' });
  });

  // Aggregate remarks
  const remarks = [];
  if (ticket.officerRemarks && ticket.officerRemarks.length > 0) {
    ticket.officerRemarks.forEach((r, idx) => {
      remarks.push({
        id: `officer-remark-${idx}`,
        author: `Officer (${r.statusAtTime})`,
        createdAt: r.timestamp || ticket.updatedAt || ticket.createdAt,
        remark: r.remark
      });
    });
  } else if (ticket.resolutionNotes) {
    remarks.push({
      id: 'res-1',
      author: 'Resolving Officer',
      createdAt: ticket.updatedAt || ticket.createdAt,
      remark: ticket.resolutionNotes
    });
  }
  if (ticket.adminMessages) {
    ticket.adminMessages.forEach((msg, idx) => {
      remarks.push({
        id: `admin-${idx}`,
        author: 'Admin',
        createdAt: msg.timestamp || ticket.updatedAt || ticket.createdAt,
        remark: msg.message
      });
    });
  }
  remarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    id: ticket._id, // The UI sometimes uses parseInt(id) but standard JS allows strings. We will pass string IDs.
    ticketId: ticket.ticketId,
    title: ticket.title,
    category: ticket.department || 'General',
    department: ticket.department,
    district: extractDistrict(ticket.location),
    priority: 'Medium', // Defaulting as backend doesn't have priority yet
    status: ticket.status,
    verificationStatus: ticket.verificationStatus || 'Pending',
    citizenName: ticket.citizenName || ticket.citizenId?.name || 'Anonymous',
    citizen: {
      name: ticket.citizenName || ticket.citizenId?.name || 'Anonymous',
      phone: ticket.citizenPhone || ticket.citizenId?.phone || 'Not Provided',
      email: ticket.citizenEmail || ticket.citizenId?.email || 'Not Provided',
      address: ticket.location || 'Not Provided'
    },
    description: ticket.description,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    attachments,
    remarks
  };
};

export const complaintService = {
  // Fetch all complaints
  getComplaints: async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      return res.data.map(adaptTicketToComplaint);
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Fetch only active complaints (not Closed)
  getActiveComplaints: async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      return res.data.map(adaptTicketToComplaint).filter(c => c.status !== 'Closed' && c.status !== 'Resolved');
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Fetch only closed complaints
  getClosedComplaints: async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      return res.data.map(adaptTicketToComplaint).filter(c => c.status === 'Resolved' || c.status === 'Closed');
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Fetch a single complaint by ID
  getComplaintById: async (id) => {
    try {
      const res = await api.get(`/tickets/${id}`);
      return adaptTicketToComplaint(res.data);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Update complaint status
  updateComplaintStatus: async (id, newStatus, officerRemark, file) => {
    const formData = new FormData();
    if (file) {
      formData.append('media', file);
    }
    if (newStatus) {
      formData.append('status', newStatus);
    }
    if (officerRemark) {
      formData.append('remark', officerRemark);
    }

    const res = await api.put(`/tickets/${id}/officer-status`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    
    // Notification
    notificationService.addNotification({
      complaintId: id,
      title: 'Status Updated',
      message: `Ticket status changed to ${newStatus}.`,
      type: 'system',
      priority: 'Medium'
    });

    return adaptTicketToComplaint(res.data.ticket || res.data);
  },

  // Add a remark without changing status
  addRemark: async (id, remarkText) => {
    // Backend doesn't have a generic "add remark" for officers, only resolve notes.
    // For now, we mock it since it's just frontend state in the original design anyway.
    console.warn('Add remark not supported by backend. Mocking.');
    return { id: Date.now(), remark: remarkText };
  },

  // Upload proof
  uploadProof: async (id, fileUrl, fileName) => {
    // To properly upload proof, we need a File object. Since the frontend passes base64 fileUrl,
    // we would need to convert base64 to File. For now, since it's an adapter, we'll mock this.
    // Ideally ComplaintDetailsPage should pass the actual File object instead of base64.
    console.warn('Upload proof with base64 not fully supported by backend. Mocking.');
    return { url: fileUrl };
  }
};
