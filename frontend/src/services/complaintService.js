import { MOCK_COMPLAINTS, MOCK_REMARKS } from './mockData';
import { notificationService } from './notificationService';

// In-memory state to act as our database for this session
let complaints = [...MOCK_COMPLAINTS];
let remarks = [...MOCK_REMARKS];

export const complaintService = {
  // Fetch all complaints
  getComplaints: async () => {
    // Simulating network delay
    return new Promise(resolve => setTimeout(() => resolve([...complaints]), 300));
  },

  // Fetch only active complaints (not Closed)
  getActiveComplaints: async () => {
    return new Promise(resolve => setTimeout(() => {
      resolve(complaints.filter(c => c.status !== 'Closed'));
    }, 300));
  },

  // Fetch only closed complaints
  getClosedComplaints: async () => {
    return new Promise(resolve => setTimeout(() => {
      resolve(complaints.filter(c => c.status === 'Closed'));
    }, 300));
  },

  // Fetch a single complaint by ID
  getComplaintById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const complaint = complaints.find(c => c.id === parseInt(id));
        if (complaint) {
          // Attach related remarks
          const relatedRemarks = remarks.filter(r => r.complaintId === complaint.id);
          resolve({ ...complaint, remarks: relatedRemarks });
        } else {
          reject(new Error('Complaint not found'));
        }
      }, 300);
    });
  },

  // Update complaint status
  updateComplaintStatus: async (id, newStatus, officerRemark) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = complaints.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
          const oldStatus = complaints[index].status;
          complaints[index] = { 
            ...complaints[index], 
            status: newStatus,
            updatedAt: new Date().toISOString()
          };

          // If a remark was provided, add it
          if (officerRemark) {
            remarks.push({
              id: Date.now(),
              complaintId: parseInt(id),
              remark: officerRemark,
              createdAt: new Date().toISOString(),
              author: 'Current Officer'
            });
          }

          // Generate a system notification automatically
          notificationService.addNotification({
            complaintId: parseInt(id),
            title: 'Status Updated',
            message: `Ticket ${complaints[index].ticketId} status changed from ${oldStatus} to ${newStatus}.`,
            type: 'system',
            priority: 'Medium'
          });

          resolve(complaints[index]);
        } else {
          reject(new Error('Complaint not found'));
        }
      }, 400);
    });
  },

  // Add a remark without changing status
  addRemark: async (id, remarkText) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const complaintExists = complaints.some(c => c.id === parseInt(id));
        if (complaintExists) {
          const newRemark = {
            id: Date.now(),
            complaintId: parseInt(id),
            remark: remarkText,
            createdAt: new Date().toISOString(),
            author: 'Current Officer'
          };
          remarks.push(newRemark);
          
          const index = complaints.findIndex(c => c.id === parseInt(id));
          complaints[index].updatedAt = new Date().toISOString();

          resolve(newRemark);
        } else {
          reject(new Error('Complaint not found'));
        }
      }, 200);
    });
  },

  // Upload proof (mock)
  uploadProof: async (id, fileUrl, fileName) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = complaints.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
          const newAttachment = {
            id: Date.now(),
            name: fileName || `proof_${Date.now()}.jpg`,
            url: fileUrl || 'https://images.unsplash.com/photo-1582236528704-5f50efd0637c?w=500&q=80',
            uploader: 'officer'
          };
          
          const updatedAttachments = [...(complaints[index].attachments || []), newAttachment];
          complaints[index] = {
            ...complaints[index],
            attachments: updatedAttachments,
            updatedAt: new Date().toISOString()
          };

          remarks.push({
            id: Date.now(),
            complaintId: parseInt(id),
            remark: `Uploaded resolution proof: ${newAttachment.name}`,
            createdAt: new Date().toISOString(),
            author: 'Current Officer'
          });

          resolve(complaints[index]);
        } else {
          reject(new Error('Complaint not found'));
        }
      }, 500);
    });
  }
};
