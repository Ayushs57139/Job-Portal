// Test script for team limits functionality
const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testTeamLimits() {
  try {
    console.log('Testing team limits functionality...');
    
    // Test 1: Check if team limits are properly initialized
    console.log('\n1. Testing team limits initialization...');
    const employers = await User.find({ userType: 'employer' }).limit(3);
    
    for (const employer of employers) {
      console.log(`Employer: ${employer.firstName} ${employer.lastName}`);
      console.log(`- Max Team Members: ${employer.teamMemberLimits?.maxTeamMembers || 'Not set'}`);
      console.log(`- Current Team Members: ${employer.teamMemberLimits?.currentTeamMembers || 'Not set'}`);
      console.log(`- Can Invite More: ${employer.canInviteTeamMember ? employer.canInviteTeamMember() : 'Method not available'}`);
      console.log(`- Remaining Slots: ${employer.getRemainingTeamSlots ? employer.getRemainingTeamSlots() : 'Method not available'}`);
      console.log('---');
    }
    
    // Test 2: Test team member count update
    console.log('\n2. Testing team member count update...');
    if (employers.length > 0) {
      const employer = employers[0];
      const oldCount = employer.teamMemberLimits?.currentTeamMembers || 0;
      
      await User.updateTeamMemberCount(employer._id);
      await employer.save();
      
      console.log(`Updated team count for ${employer.firstName}: ${oldCount} -> ${employer.teamMemberLimits?.currentTeamMembers}`);
    }
    
    // Test 3: Test subuser creation with limits
    console.log('\n3. Testing subuser limit validation...');
    if (employers.length > 0) {
      const employer = employers[0];
      console.log(`Testing with employer: ${employer.firstName} ${employer.lastName}`);
      console.log(`Current limit: ${employer.teamMemberLimits?.maxTeamMembers}`);
      console.log(`Current members: ${employer.teamMemberLimits?.currentTeamMembers}`);
      console.log(`Can invite more: ${employer.canInviteTeamMember ? employer.canInviteTeamMember() : 'Method not available'}`);
    }
    
    console.log('\n✅ Team limits functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing team limits:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testTeamLimits();
