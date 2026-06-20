import { MOCK_COMPLAINTS } from './mockData';

// Generate realistic aggregate numbers once for CM Dashboard (15k+ complaints)
const generateCMScaleData = () => {
  const data = [...MOCK_COMPLAINTS]; // Include operational base data
  
  const distWeights = {
    'East Delhi': 3800,        // Red (Critical > 3000)
    'South Delhi': 2400,       // Orange (High > 2000)
    'North East Delhi': 2100,  // Orange
    'West Delhi': 1800,        // Yellow (Moderate > 1000)
    'North Delhi': 1200,       // Yellow
    'South East Delhi': 1050,  // Yellow
    'Central Delhi': 800,      // Green (Low <= 1000)
    'South West Delhi': 600,   // Green
    'Shahdara': 500,           // Green
    'North West Delhi': 400,   // Green
    'New Delhi': 150           // Green
  };

  const depts = ['Water Supply', 'Electricity', 'Roads & Traffic', 'Sanitation'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  Object.entries(distWeights).forEach(([dist, count]) => {
    // Add random variance to make it look organic
    const actualCount = count + Math.floor(Math.random() * 200) - 100;
    for (let i = 0; i < actualCount; i++) {
      // Slightly bias older tickets to be resolved
      const isResolved = Math.random() > 0.3; 
      data.push({
        id: `SYS-${Math.floor(Math.random() * 1000000)}`,
        ticketId: `DEL-${Math.floor(Math.random() * 1000000)}`,
        district: dist,
        category: depts[Math.floor(Math.random() * depts.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: isResolved ? 'Resolved' : statuses[Math.floor(Math.random() * 3)],
      });
    }
  });

  return data;
};

const CM_DATA = generateCMScaleData();

export const cmService = {
  // Returns high-level metrics for the entire state
  getExecutiveOverview: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const total = CM_DATA.length;
        const resolved = CM_DATA.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
        const active = total - resolved;
        const critical = CM_DATA.filter(c => c.priority === 'Critical').length;
        
        // Mock escalated count (e.g. 10% of active)
        const escalated = Math.floor(active * 0.1) || 1;
        
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        resolve({
          totalComplaints: total,
          activeComplaints: active,
          resolvedComplaints: resolved,
          resolutionRate: resolutionRate,
          criticalIssues: critical,
          escalatedComplaints: escalated
        });
      }, 300);
    });
  },

  getDistrictAnalytics: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const districtMap = {};
        CM_DATA.forEach(c => {
          if (!districtMap[c.district]) {
            districtMap[c.district] = { name: c.district, total: 0, resolved: 0, critical: 0 };
          }
          districtMap[c.district].total += 1;
          if (c.status === 'Resolved' || c.status === 'Closed') districtMap[c.district].resolved += 1;
          if (c.priority === 'Critical') districtMap[c.district].critical += 1;
        });

        const districts = Object.values(districtMap).map(d => ({
          ...d,
          resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
        })).sort((a, b) => b.total - a.total);

        resolve(districts);
      }, 300);
    });
  },

  getSingleDistrictDetails: async (districtName) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const districtData = CM_DATA.filter(c => c.district === districtName);
        
        // KPIs
        const total = districtData.length;
        const resolved = districtData.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
        const pending = total - resolved;
        const critical = districtData.filter(c => c.priority === 'Critical').length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        // Department Breakdown
        const deptMap = {};
        districtData.forEach(c => {
          if (!deptMap[c.category]) {
            deptMap[c.category] = { name: c.category, total: 0, resolved: 0, critical: 0 };
          }
          deptMap[c.category].total += 1;
          if (c.status === 'Resolved' || c.status === 'Closed') deptMap[c.category].resolved += 1;
          if (c.priority === 'Critical') deptMap[c.category].critical += 1;
        });

        const departments = Object.values(deptMap).map(d => ({
          ...d,
          resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
        })).sort((a, b) => b.total - a.total);

        // Critical Tickets (Top 5 open critical issues)
        const criticalTickets = districtData
          .filter(c => c.status !== 'Resolved' && c.status !== 'Closed' && c.priority === 'Critical')
          .slice(0, 5)
          .map(c => ({
            id: c.id,
            ticketId: c.ticketId,
            department: c.category,
            status: c.status
          }));

        resolve({
          kpis: { total, resolved, pending, critical, resolutionRate },
          departments,
          criticalTickets
        });
      }, 300);
    });
  },

  getDepartmentPerformance: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const deptMap = {};
        CM_DATA.forEach(c => {
          if (!deptMap[c.category]) {
            deptMap[c.category] = { name: c.category, total: 0, resolved: 0, pending: 0, avgResTimeDays: Math.floor(Math.random() * 5) + 1 };
          }
          deptMap[c.category].total += 1;
          if (c.status === 'Resolved' || c.status === 'Closed') {
            deptMap[c.category].resolved += 1;
          } else {
            deptMap[c.category].pending += 1;
          }
        });

        const depts = Object.values(deptMap).map(d => ({
          ...d,
          resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
        })).sort((a, b) => b.resolutionRate - a.resolutionRate);

        resolve(depts);
      }, 300);
    });
  },

  getCriticalIssues: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const critical = CM_DATA.filter(c => c.priority === 'Critical' || c.priority === 'High' && c.status !== 'Closed');
        resolve(critical.slice(0, 100)); // Cap at 100 for table performance
      }, 300);
    });
  },

  getTrendsAndInsights: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { type: 'warning', text: 'Water Supply complaints in South Delhi increased by 23% this week.' },
          { type: 'success', text: 'Roads & Traffic resolution rate improved by 12% across all districts.' },
          { type: 'danger', text: 'East Delhi generated the highest critical complaint volume in the last 48 hours.' },
          { type: 'info', text: 'Sanitation department average resolution time has stabilized at 2.4 days.' }
        ]);
      }, 300);
    });
  },

  getEscalations: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock escalations based on pending critical/high issues
        const escalations = CM_DATA
          .filter(c => c.status !== 'Resolved' && c.status !== 'Closed' && (c.priority === 'Critical' || c.priority === 'High'))
          .slice(0, 50) // Cap to realistic escalation board volume
          .map(c => ({
            id: c.id,
            ticketId: c.ticketId,
            district: c.district,
            department: c.category,
            delay: c.priority === 'Critical' ? '48 Hours' : '5 Days',
            escalationLevel: c.priority === 'Critical' ? 'Level 3 (CM Office)' : 'Level 2 (Secretary)'
          }));
        resolve(escalations);
      }, 300);
    });
  }
};
