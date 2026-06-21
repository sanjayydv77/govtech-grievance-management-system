import api from './api';

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

// Helper to fetch and normalize live CM data
const fetchAllData = async () => {
  try {
    const res = await api.get('/tickets/all');
    const data = res.data.map(t => ({
      id: t._id,
      ticketId: t.ticketId,
      district: extractDistrict(t.location),
      category: t.department || 'General',
      priority: 'Medium', // Backend doesn't support priority yet
      status: t.status
    }));
    return data;
  } catch (e) {
    console.error('CM Data fetch error:', e);
    return [];
  }
};

export const cmService = {
  // Returns high-level metrics for the entire state
  getExecutiveOverview: async () => {
    const CM_DATA = await fetchAllData();
    const total = CM_DATA.length;
    const resolved = CM_DATA.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const active = total - resolved;
    const critical = CM_DATA.filter(c => c.priority === 'Critical').length;
    
    // Escalated count (mocking for now since we don't have escalation schema)
    const escalated = Math.floor(active * 0.1) || 1;
    
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      totalComplaints: total,
      activeComplaints: active,
      resolvedComplaints: resolved,
      resolutionRate: resolutionRate,
      criticalIssues: critical,
      escalatedComplaints: escalated
    };
  },

  getDistrictAnalytics: async () => {
    const CM_DATA = await fetchAllData();
    const districtMap = {};
    CM_DATA.forEach(c => {
      if (!districtMap[c.district]) {
        districtMap[c.district] = { name: c.district, total: 0, resolved: 0, critical: 0 };
      }
      districtMap[c.district].total += 1;
      if (c.status === 'Resolved' || c.status === 'Closed') districtMap[c.district].resolved += 1;
      if (c.priority === 'Critical') districtMap[c.district].critical += 1;
    });

    return Object.values(districtMap).map(d => ({
      ...d,
      resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  },

  getSingleDistrictDetails: async (districtName) => {
    const CM_DATA = await fetchAllData();
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

    // Critical Tickets
    const criticalTickets = districtData
      .filter(c => c.status !== 'Resolved' && c.status !== 'Closed' && c.priority === 'Critical')
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        ticketId: c.ticketId,
        department: c.category,
        status: c.status
      }));

    return {
      kpis: { total, resolved, pending, critical, resolutionRate },
      departments,
      criticalTickets
    };
  },

  getDepartmentPerformance: async () => {
    const CM_DATA = await fetchAllData();
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

    return Object.values(deptMap).map(d => ({
      ...d,
      resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
    })).sort((a, b) => b.resolutionRate - a.resolutionRate);
  },

  getCriticalIssues: async () => {
    const CM_DATA = await fetchAllData();
    const critical = CM_DATA.filter(c => c.priority === 'Critical' || (c.priority === 'High' && c.status !== 'Closed'));
    return critical.slice(0, 100);
  },

  getTrendsAndInsights: async () => {
    // These are fully mocked insights since generating AI insights requires backend processing
    return [
      { type: 'warning', text: 'Recent ticket volume has increased by 15% across all regions.' },
      { type: 'success', text: 'Resolution rates for public works have improved slightly.' },
      { type: 'info', text: 'Most complaints are currently concentrated in general infrastructure.' }
    ];
  },

  getEscalations: async () => {
    const CM_DATA = await fetchAllData();
    const escalations = CM_DATA
      .filter(c => c.status !== 'Resolved' && c.status !== 'Closed' && (c.priority === 'Critical' || c.priority === 'High'))
      .slice(0, 50)
      .map(c => ({
        id: c.id,
        ticketId: c.ticketId,
        district: c.district,
        department: c.category,
        delay: '48 Hours',
        escalationLevel: 'Level 3 (CM Office)'
      }));
    return escalations;
  }
};
