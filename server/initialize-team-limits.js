const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function initializeTeamLimits() {
  try {
    console.log('Initializing team member limits for existing employers...');
    
    // Find all employers (companies and consultancies)
    const employers = await User.find({ userType: 'employer' });
    
    console.log(`Found ${employers.length} employers to process`);
    
    for (const employer of employers) {
      // Initialize team member limits if not already set
      if (!employer.teamMemberLimits) {
        employer.teamMemberLimits = {
          maxTeamMembers: 5, // Default limit
          currentTeamMembers: 0,
          limitSetBy: null,
          limitSetAt: new Date()
        };
        
        await employer.save();
        console.log(`Initialized team limits for ${employer.firstName} ${employer.lastName} (${employer.email})`);
      }
      
      // Update current team member count
      const currentCount = await User.countDocuments({ 
        parentUserId: employer._id, 
        isSubuser: true,
        isActive: true
      });
      
      employer.teamMemberLimits.currentTeamMembers = currentCount;
      await employer.save();
      
      console.log(`Updated team count for ${employer.firstName} ${employer.lastName}: ${currentCount} members`);
    }
    
    console.log('Team member limits initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing team limits:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the initialization
initializeTeamLimits();
