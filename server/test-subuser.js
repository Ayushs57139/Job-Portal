const axios = require('axios');

async function testSubuserInvitation() {
    try {
        console.log('Testing subuser invitation functionality...');
        
        // Step 1: Login as company user
        console.log('\n1. Logging in as company user...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            loginId: 'company@test.com',
            password: 'password123',
            userType: 'employer',
            employerType: 'company'
        });
        
        const token = loginResponse.data.token;
        console.log('✓ Login successful, token received');
        
        // Step 2: Invite a subuser
        console.log('\n2. Inviting a subuser...');
        const inviteResponse = await axios.post('http://localhost:5000/api/subusers/invite', {
            email: 'subuser@test.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'member',
            permissions: {
                canViewJobs: true,
                canPostJobs: false,
                canManageApplications: false,
                canViewAnalytics: false,
                canManageSubusers: false,
                canManageCompanyProfile: false
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✓ Subuser invited successfully');
        console.log('Subuser details:', inviteResponse.data.subuser);
        
        // Step 3: Get all subusers
        console.log('\n3. Getting all subusers...');
        const subusersResponse = await axios.get('http://localhost:5000/api/subusers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✓ Subusers retrieved successfully');
        console.log('Subusers count:', subusersResponse.data.subusers.length);
        console.log('Subusers:', subusersResponse.data.subusers);
        
        // Step 4: Test subuser login
        console.log('\n4. Testing subuser login...');
        const subuserLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            loginId: 'subuser@test.com',
            password: 'temp123456',
            userType: 'employer',
            employerType: 'company'
        });
        
        console.log('✓ Subuser login successful');
        console.log('Subuser details:', subuserLoginResponse.data.user);
        
        console.log('\n✅ All tests passed! Subuser invitation system is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testSubuserInvitation();
