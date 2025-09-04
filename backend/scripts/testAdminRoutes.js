const axios = require('axios');

const testAdminRoutes = async () => {
    try {
        console.log('🔐 Testing Admin Login...');
        
        // Login as admin
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'admin@rentease.com',
            password: 'admin123'
        });
        
        console.log('✅ Admin login successful');
        console.log('Admin user:', {
            username: loginResponse.data.username,
            email: loginResponse.data.email,
            isAdmin: loginResponse.data.isAdmin
        });
        
        const token = loginResponse.data.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('\n📊 Testing Admin Dashboard Stats...');
        try {
            const statsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/stats', { headers });
            console.log('✅ Dashboard stats working');
            console.log('Stats:', statsResponse.data);
        } catch (error) {
            console.log('❌ Dashboard stats failed:', error.response?.data || error.message);
        }
        
        console.log('\n👥 Testing Admin Users Route...');
        try {
            const usersResponse = await axios.get('http://localhost:5000/api/admin/users', { headers });
            console.log('✅ Admin users route working');
            console.log('Users count:', usersResponse.data.users.length);
        } catch (error) {
            console.log('❌ Admin users route failed:', error.response?.data || error.message);
        }
        
        console.log('\n📦 Testing Admin Items Route...');
        try {
            const itemsResponse = await axios.get('http://localhost:5000/api/admin/items', { headers });
            console.log('✅ Admin items route working');
            console.log('Items count:', itemsResponse.data.items.length);
        } catch (error) {
            console.log('❌ Admin items route failed:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

testAdminRoutes();
