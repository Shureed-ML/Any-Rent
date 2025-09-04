const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateExistingUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Update all users without isAdmin field
        const result = await User.updateMany(
            { isAdmin: { $exists: false } },
            { 
                $set: { 
                    isAdmin: false,
                    isActive: true,
                    isSuspended: false,
                    verificationStatus: 'verified',
                    warningsCount: 0
                } 
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} users with admin fields`);

        // Verify the update
        const allUsers = await User.find({});
        console.log('\n📊 All Users After Update:');
        allUsers.forEach((user, index) => {
            console.log(`\n👤 User ${index + 1}:`);
            console.log('  Username:', user.username);
            console.log('  Email:', user.email);
            console.log('  isAdmin:', user.isAdmin);
            console.log('  isActive:', user.isActive);
            console.log('  isSuspended:', user.isSuspended);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

updateExistingUsers();
