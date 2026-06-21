const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/Users');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB Connected.');

        const users = [
            {
                name: 'Aam Aadmi (Citizen)',
                email: 'citizen@delhi.gov.in',
                password: 'password123',
                phone: '9999999999',
                role: 'citizen',
            },
            {
                name: 'Delhi Officer',
                email: 'officer@delhi.gov.in',
                password: 'password123',
                phone: '8888888888',
                role: 'officer',
                department: 'Public Works Department (PWD)'
            },
            {
                name: 'System Admin',
                email: 'admin@delhi.gov.in',
                password: 'password123',
                phone: '7777777777',
                role: 'admin',
            },
            {
                name: 'Chief Minister',
                email: 'cm@delhi.gov.in',
                password: 'password123',
                phone: '6666666666',
                role: 'cm',
            }
        ];

        for (const u of users) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                const salt = await bcrypt.genSalt(12);
                const hashed = await bcrypt.hash(u.password, salt);
                await User.create({ ...u, password: hashed });
                console.log(`Created: ${u.email}`);
            } else {
                console.log(`Already exists: ${u.email}`);
            }
        }

        console.log('Done!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
