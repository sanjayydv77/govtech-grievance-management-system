const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/Users');
const Ticket = require('../models/Ticket');

const MONGO_URI = process.env.MONGODB_URI;

const generateTicketId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase().padStart(5, '0');
    return `DL-${dateStr}-${randomHex}`;
};

const DEPARTMENTS = [
    'Public Works Department (PWD)',
    'Delhi Jal Board (DJB)',
    'Transport Department',
    'Health & Family Welfare',
    'Education Directorate',
    'Power (BSES/Tata Power)',
    'Municipal Corporation of Delhi (MCD)'
];

const LOCATIONS = [
    'Connaught Place, New Delhi',
    'Rohini Sector 15, North West Delhi',
    'Saket, South Delhi',
    'Laxmi Nagar, East Delhi',
    'Dwarka Sector 21, South West Delhi',
    'Karol Bagh, Central Delhi',
    'Chandni Chowk, Old Delhi',
    'Vasant Kunj, South Delhi',
    'Pitampura, North West Delhi',
    'Mayur Vihar Phase 1, East Delhi'
];

const CITIZEN_NAMES = ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Gupta', 'Vikram Malhotra', 'Sneha Desai'];

const COMPLAINT_TEMPLATES = [
    { title: 'Severe Waterlogging on Main Road', dept: 'Public Works Department (PWD)', desc: 'The recent rains have caused severe waterlogging. It is impossible for pedestrians and small vehicles to cross.' },
    { title: 'No Water Supply for 3 Days', dept: 'Delhi Jal Board (DJB)', desc: 'We have not received any water supply for the last 3 days. We are forced to buy expensive private tankers.' },
    { title: 'Pothole Causing Accidents', dept: 'Public Works Department (PWD)', desc: 'A massive pothole has formed in the middle of the road. Multiple two-wheelers have skidded and fallen.' },
    { title: 'Frequent Power Cuts', dept: 'Power (BSES/Tata Power)', desc: 'We are experiencing 4-5 hours of power cuts daily without any prior schedule or notice.' },
    { title: 'Garbage Dump Overflowing', dept: 'Municipal Corporation of Delhi (MCD)', desc: 'The local garbage dump has not been cleared for a week. The smell is unbearable and it is a health hazard.' },
    { title: 'Streetlights Not Working', dept: 'Power (BSES/Tata Power)', desc: 'The entire street is pitch dark at night because the streetlights have been broken for weeks.' },
    { title: 'Sewer Line Choked', dept: 'Delhi Jal Board (DJB)', desc: 'Sewer water is overflowing onto the streets and entering houses. This needs immediate clearing.' },
    { title: 'Illegal Encroachment on Footpath', dept: 'Municipal Corporation of Delhi (MCD)', desc: 'Vendors have completely blocked the pedestrian footpath, forcing people to walk on the busy road.' },
    { title: 'School Building Needs Repair', dept: 'Education Directorate', desc: 'The ceiling in the primary wing of the local government school is leaking during rains.' },
    { title: 'DTC Bus Not Stopping at Designated Stop', dept: 'Transport Department', desc: 'Buses on route 543 regularly skip this bus stop even when there is space inside.' }
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully!');

        console.log('Wiping existing data...');
        await User.deleteMany({});
        await Ticket.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log('Creating Admin & CM...');
        const adminUser = await User.create({ name: 'Admin Chief', email: 'admin@delhi.gov.in', password: hashedPassword, role: 'admin' });
        await User.create({ name: 'Chief Minister', email: 'cm@delhi.gov.in', password: hashedPassword, role: 'cm' });

        console.log('Creating Officers...');
        const officers = [];
        for (const dept of DEPARTMENTS) {
            const officer = await User.create({
                name: `${dept.split(' ')[0]} Officer`,
                email: `officer.${dept.split(' ')[0].toLowerCase()}@delhi.gov.in`,
                password: hashedPassword,
                role: 'officer',
                department: dept,
                phone: `98765${Math.floor(10000 + Math.random() * 90000)}`
            });
            officers.push(officer);
        }

        console.log('Creating Base Citizen...');
        const baseCitizen = await User.create({
            name: 'Aam Aadmi',
            email: 'citizen@delhi.gov.in',
            password: hashedPassword,
            role: 'citizen',
            phone: '9999999999'
        });

        console.log('Generating 50 Complaints...');
        const tickets = [];
        for (let i = 0; i < 50; i++) {
            const template = COMPLAINT_TEMPLATES[Math.floor(Math.random() * COMPLAINT_TEMPLATES.length)];
            const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const citizenName = CITIZEN_NAMES[Math.floor(Math.random() * CITIZEN_NAMES.length)];
            const citizenPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

            // Determine status
            const rand = Math.random();
            let status = 'Pending';
            let verificationStatus = 'Pending';
            let assignedOfficerId = null;
            let resolutionNotes = null;

            if (rand > 0.8) {
                status = 'Resolved';
                verificationStatus = 'Verified Real';
                assignedOfficerId = officers.find(o => o.department === template.dept)?._id;
                resolutionNotes = 'The issue has been inspected and fully resolved by the field team.';
            } else if (rand > 0.6) {
                status = 'In Progress';
                verificationStatus = 'Verified Real';
                assignedOfficerId = officers.find(o => o.department === template.dept)?._id;
            } else if (rand > 0.4) {
                status = 'Assigned';
                verificationStatus = 'Verified Real';
                assignedOfficerId = officers.find(o => o.department === template.dept)?._id;
            } else if (rand > 0.35) {
                status = 'Rejected';
                verificationStatus = 'Flagged False';
            }

            const ticket = {
                ticketId: generateTicketId(),
                citizenId: baseCitizen._id,
                citizenName,
                citizenPhone,
                citizenEmail: `${citizenName.replace(' ', '.').toLowerCase()}@gmail.com`,
                title: template.title,
                description: template.desc,
                location,
                department: template.dept,
                status,
                verificationStatus,
                assignedOfficerId,
                resolutionNotes,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date in last 30 days
            };
            tickets.push(ticket);
        }

        await Ticket.insertMany(tickets);
        console.log('Successfully inserted 50 realistic complaints!');
        
        console.log('Seeding Complete! You can log in with:');
        console.log('Admin: admin@delhi.gov.in / password123');
        console.log('Officer: officer.public@delhi.gov.in / password123 (Check MongoDB for other officer emails)');
        console.log('Citizen: citizen@delhi.gov.in / password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
