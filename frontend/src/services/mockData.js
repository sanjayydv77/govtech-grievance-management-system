export const MOCK_COMPLAINTS = [
  {
    id: 1,
    ticketId: 'DEL-TKT-0092',
    title: 'Major Water Pipe Burst',
    description: 'A large water pipe has burst near the main intersection, causing significant flooding and traffic disruption.',
    category: 'Water Supply',
    district: 'South Delhi',
    priority: 'Critical',
    status: 'Pending',
    assignedOfficer: 'Unassigned',
    createdAt: '2026-06-19T08:00:00Z',
    updatedAt: '2026-06-19T08:00:00Z',
    citizen: {
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      address: 'Near M-Block Market, Greater Kailash I, New Delhi'
    },
    attachments: [
      { id: 1, name: 'flood_view1.jpg', url: 'https://images.unsplash.com/photo-1542045618-971ccbe3e46c?w=500&q=80', uploader: 'citizen' },
      { id: 2, name: 'pipe_damage.jpg', url: 'https://images.unsplash.com/photo-1582236528704-5f50efd0637c?w=500&q=80', uploader: 'citizen' }
    ]
  },
  {
    id: 2,
    ticketId: 'DEL-TKT-0105',
    title: 'Live Wire on Main Road',
    description: 'An electric pole has fallen and a live wire is sparking on the sidewalk.',
    category: 'Electricity',
    district: 'East Delhi',
    priority: 'Critical',
    status: 'In Progress',
    assignedOfficer: 'Elec-QRT-1',
    createdAt: '2026-06-19T09:15:00Z',
    updatedAt: '2026-06-19T10:00:00Z',
    citizen: {
      name: 'Priya Sharma',
      phone: '+91 91234 56789',
      address: 'Laxmi Nagar, near Metro Pillar 42'
    },
    attachments: []
  },
  {
    id: 3,
    ticketId: 'DEL-TKT-0118',
    title: 'Sewer Overflow near Hospital',
    description: 'Sewage water is overflowing onto the road directly in front of the local clinic.',
    category: 'Sanitation',
    district: 'Central',
    priority: 'High',
    status: 'Pending',
    assignedOfficer: 'Unassigned',
    createdAt: '2026-06-19T10:30:00Z',
    updatedAt: '2026-06-19T10:30:00Z',
    citizen: {
      name: 'Dr. Anita Desai',
      phone: '+91 99887 76655',
      address: 'Paharganj Main Road'
    },
    attachments: []
  },
  {
    id: 4,
    ticketId: 'DEL-TKT-0089',
    title: 'Deep Pothole on Ring Road',
    description: 'A massive pothole has developed, causing damage to multiple vehicles.',
    category: 'Roads & Traffic',
    district: 'South Delhi',
    priority: 'High',
    status: 'In Progress',
    assignedOfficer: 'PWD-Eng-Alpha',
    createdAt: '2026-06-18T14:20:00Z',
    updatedAt: '2026-06-19T11:00:00Z',
    citizen: {
      name: 'Rahul Sharma',
      phone: '+91 98712 34567',
      address: 'Ring Road near South Extension'
    },
    attachments: []
  },
  {
    id: 5,
    ticketId: 'DEL-TKT-0042',
    title: 'Streetlights Not Working',
    description: 'Entire block is completely dark. High security risk.',
    category: 'Electricity',
    district: 'West Delhi',
    priority: 'Medium',
    status: 'Resolved',
    assignedOfficer: 'Elec-Team-B',
    createdAt: '2026-06-15T18:00:00Z',
    updatedAt: '2026-06-17T09:00:00Z',
    citizen: {
      name: 'Vikram Singh',
      phone: '+91 90000 11111',
      address: 'Janakpuri C-Block'
    },
    attachments: []
  },
  {
    id: 6,
    ticketId: 'DEL-TKT-0010',
    title: 'Garbage Dump Not Cleared',
    description: 'Garbage hasn\'t been collected for 5 days. Severe odor.',
    category: 'Sanitation',
    district: 'North Delhi',
    priority: 'Medium',
    status: 'Closed',
    assignedOfficer: 'Sanitation-North',
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-06-14T10:00:00Z',
    citizen: {
      name: 'Sunita Verma',
      phone: '+91 98888 22222',
      address: 'Model Town Phase 2'
    },
    attachments: []
  }
];

export const MOCK_REMARKS = [
  {
    id: 1,
    complaintId: 2,
    remark: 'Team dispatched to location. Power to the line has been cut remotely.',
    createdAt: '2026-06-19T09:45:00Z',
    author: 'System Admin'
  },
  {
    id: 2,
    complaintId: 4,
    remark: 'Initial inspection complete. Asphalt laying scheduled for tonight to minimize traffic impact.',
    createdAt: '2026-06-19T11:00:00Z',
    author: 'A.K. Singh (Asst. Engineer)'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    complaintId: 1,
    title: 'SLA Breach Warning: DEL-TKT-0092',
    message: 'The SLA for Major Water Pipe Burst is expiring soon.',
    type: 'sla',
    read: false,
    priority: 'Critical',
    createdAt: '2026-06-19T12:00:00Z'
  },
  {
    id: 2,
    complaintId: 4,
    title: 'Citizen Added a Remark',
    message: 'Rahul Sharma has uploaded new photos regarding the Ring Road Pothole.',
    type: 'citizen',
    read: false,
    priority: 'Medium',
    createdAt: '2026-06-19T11:05:00Z'
  },
  {
    id: 3,
    complaintId: null,
    title: 'Weekly Maintenance Scheduled',
    message: 'The portal will be offline for 15 minutes on Sunday at 2:00 AM for updates.',
    type: 'system',
    read: true,
    priority: 'Low',
    createdAt: '2026-06-18T10:00:00Z'
  },
  {
    id: 4,
    complaintId: 3,
    title: 'New Task Assigned: DEL-TKT-0118',
    message: 'A new ticket has been assigned to you. Click to review and update status.',
    type: 'assignment',
    read: false,
    priority: 'High',
    createdAt: '2026-06-20T19:00:00Z'
  }
];
