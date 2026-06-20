import { complaintService } from './complaintService';

export const reportService = {
  getDashboardKPIs: async () => {
    const complaints = await complaintService.getComplaints();
    
    return {
      totalAssigned: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      closed: complaints.filter(c => c.status === 'Closed').length,
      highPriority: complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length
    };
  },

  getHistoryKPIs: async () => {
    const closedComplaints = await complaintService.getClosedComplaints();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const closedThisMonth = closedComplaints.filter(c => {
      const updated = new Date(c.updatedAt);
      return updated.getMonth() === currentMonth && updated.getFullYear() === currentYear;
    }).length;

    let totalResolutionTimeMs = 0;
    closedComplaints.forEach(c => {
      totalResolutionTimeMs += (new Date(c.updatedAt) - new Date(c.createdAt));
    });
    
    let avgResolutionDays = 0;
    if (closedComplaints.length > 0) {
      const avgMs = totalResolutionTimeMs / closedComplaints.length;
      avgResolutionDays = (avgMs / (1000 * 60 * 60 * 24)).toFixed(1);
    }

    const archivedHighPriority = closedComplaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length;

    return {
      totalClosed: closedComplaints.length,
      closedThisMonth,
      avgResolutionDays,
      archivedHighPriority
    };
  },

  getTrendData: async () => {
    const complaints = await complaintService.getComplaints();
    // In a real app, this would group by date. For this mock, we'll return a static shape 
    // but we can scale the numbers based on the total complaints.
    const multiplier = Math.max(1, Math.floor(complaints.length / 5));
    
    return [
      { name: 'Jan', received: 40 * multiplier, resolved: 24 * multiplier },
      { name: 'Feb', received: 30 * multiplier, resolved: 13 * multiplier },
      { name: 'Mar', received: 20 * multiplier, resolved: 48 * multiplier },
      { name: 'Apr', received: 27 * multiplier, resolved: 39 * multiplier },
      { name: 'May', received: 18 * multiplier, resolved: 48 * multiplier },
      { name: 'Jun', received: complaints.length * 10, resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length * 10 },
    ];
  },

  getDistrictWorkload: async () => {
    const complaints = await complaintService.getComplaints();
    const workload = {};
    
    complaints.forEach(c => {
      if (c.district) {
        if (!workload[c.district]) workload[c.district] = 0;
        workload[c.district]++;
      }
    });

    return Object.keys(workload).map(district => ({
      name: district,
      complaints: workload[district]
    }));
  },

  getStatusDistribution: async () => {
    const complaints = await complaintService.getComplaints();
    const statusCounts = {
      'Pending': 0,
      'In Progress': 0,
      'Resolved': 0,
      'Closed': 0
    };

    complaints.forEach(c => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
    });

    return [
      { name: 'Pending', value: statusCounts['Pending'], color: '#f59e0b' },
      { name: 'In Progress', value: statusCounts['In Progress'], color: '#3b82f6' },
      { name: 'Resolved', value: statusCounts['Resolved'], color: '#10b981' },
      { name: 'Closed', value: statusCounts['Closed'], color: '#64748b' }
    ];
  },

  getSeverityMetrics: async () => {
    const complaints = await complaintService.getComplaints();
    
    const critical = complaints.filter(c => c.priority === 'Critical');
    const high = complaints.filter(c => c.priority === 'High');
    
    const criticalResolved = critical.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const highResolved = high.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    return [
      {
        severity: 'Critical',
        total: critical.length,
        resolved: criticalResolved,
        rate: critical.length > 0 ? Math.round((criticalResolved / critical.length) * 100) + '%' : '0%'
      },
      {
        severity: 'High',
        total: high.length,
        resolved: highResolved,
        rate: high.length > 0 ? Math.round((highResolved / high.length) * 100) + '%' : '0%'
      }
    ];
  }
};
