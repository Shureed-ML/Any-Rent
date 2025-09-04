const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all admin users
        const adminUsers = await User.find({ isAdmin: true });
        console.log('\n📋 Admin Users Found:', adminUsers.length);
        
        adminUsers.forEach((admin, index) => {
            console.log(`\n👤 Admin User ${index + 1}:`);
            console.log('  ID:', admin._id);
            console.log('  Username:', admin.username);
            console.log('  Email:', admin.email);
            console.log('  isAdmin:', admin.isAdmin);
            console.log('  isActive:', admin.isActive);
            console.log('  isSuspended:', admin.isSuspended);
            console.log('  Created:', admin.createdAt);
        });

        // Find all users to see the structure
        const allUsers = await User.find({}).limit(3);
        console.log('\n📊 Sample Users (first 3):');
        allUsers.forEach((user, index) => {
            console.log(`\n👤 User ${index + 1}:`);
            console.log('  Username:', user.username);
            console.log('  Email:', user.email);
            console.log('  isAdmin:', user.isAdmin);
            console.log('  Has isAdmin field:', user.hasOwnProperty('isAdmin'));
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

checkAdminUser();
