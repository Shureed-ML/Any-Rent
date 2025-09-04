const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            console.log('❌ Admin user already exists:', existingAdmin.username);
            process.exit(1);
        }

        // Create admin user
        const adminData = {
            username: 'admin',
            email: 'admin@rentease.com',
            password: 'admin123', // Change this to a secure password
            isAdmin: true
        };

        // Hash password
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        // Save admin user
        const adminUser = new User(adminData);
        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('Username:', adminData.username);
        console.log('Email:', adminData.email);
        console.log('Password: admin123 (please change this after first login)');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

createAdminUser();
