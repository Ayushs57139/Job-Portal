const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    maxlength: 100
  },
  mobileNumber: {
    type: String,
    required: true,
    maxlength: 15
  },
  whatsappNumber: {
    type: String,
    maxlength: 15
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Transgender', 'Other']
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: ['Single', 'Married', 'Separated', 'Widowed', 'Divorced']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  pincode: {
    type: String,
    required: true,
    maxlength: 10
  },

  // Professional Information
  currentJobTitle: {
    type: String,
    maxlength: 100
  },
  currentCompanyName: {
    type: String,
    maxlength: 100
  },
  currentSalary: {
    type: Number
  },
  expectedSalary: {
    type: Number,
    required: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Permanent', 'Temporary/Contract Job', 'Freelance', 'Apprenticeship', 'Internship', 'NAPS', 'Trainee', 'Fresher']
  },
  jobStatus: {
    type: String,
    required: true,
    enum: ['Working', 'Not Working', 'Serving Notice Period']
  },
  totalExperience: {
    type: String,
    required: true
  },
  noticePeriod: {
    type: String,
    required: true,
    enum: ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', '90 Days Plus']
  },

  // Education & Skills
  education: {
    type: String,
    required: true,
    enum: ['Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'MBA', 'M.Tech', 'Doctorate', 'Ph.D', 'PPG']
  },
  course: {
    type: String,
    maxlength: 100
  },
  skills: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Location & Preferences
  currentState: {
    type: String,
    required: true,
    maxlength: 50
  },
  currentCity: {
    type: String,
    required: true,
    maxlength: 50
  },
  currentLocality: {
    type: String,
    maxlength: 100
  },
  homeTown: {
    type: String,
    maxlength: 100
  },
  preferredLanguage: {
    type: String,
    required: true,
    maxlength: 50
  },
  englishFluency: {
    type: String,
    required: true,
    enum: ['Fluent English', 'Good English', 'Basic English', 'No English']
  },
  preferredJobCities: {
    type: String,
    maxlength: 200
  },

  // Company & Industry Information
  companyType: {
    type: String,
    enum: ['Indian MNC', 'Foreign MNC', 'Govt/PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy', 'LLP', 'Pvt Ltd', 'Proprietorship', 'MSME']
  },
  jobIndustry: {
    type: String,
    maxlength: 100
  },
  department: {
    type: String,
    maxlength: 100
  },
  jobRole: {
    type: String,
    maxlength: 100
  },

  // Asset Requirements
  assetRequirements: [{
    type: String,
    enum: ['LMV License', 'Heavy Driver License', 'Crane Operator License', 'Electrical License', 'Laptop', 'Android Smart Phone', 'iOS Smart Phone', 'Camera', 'Two Wheeler', 'Bike', 'E-Bike', 'Auto', 'E-Rikshaw', 'Three Wheeler', 'Four Wheeler', 'Tempo', 'Traveller/Van', 'Truck', 'Crane', 'Bus', 'Tractor']
  }],

  // Resume & Cover Letter
  resumeUrl: {
    type: String,
    maxlength: 500
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },

  // Application Status
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Additional fields for tracking
  notes: {
    type: String,
    maxlength: 1000
  },
  // Interview scheduling
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewNotes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ user: 1, status: 1 });

// Virtual for application age
applicationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24));
});

// Method to check if application is recent
applicationSchema.methods.isRecent = function() {
  return this.ageInDays <= 7;
};

// Method to get status display text
applicationSchema.methods.getStatusText = function() {
  const statusMap = {
    'applied': 'Applied',
    'reviewed': 'Under Review',
    'shortlisted': 'Shortlisted',
    'rejected': 'Not Selected',
    'hired': 'Hired'
  };
  return statusMap[this.status] || this.status;
};

// Method to get availability display text
applicationSchema.methods.getAvailabilityText = function() {
  const availabilityMap = {
    'immediately': 'Immediately',
    '1-week': '1 week',
    '2-weeks': '2 weeks',
    '1-month': '1 month',
    '2-months': '2 months',
    'negotiable': 'Negotiable'
  };
  return availabilityMap[this.availability] || this.availability;
};

// Pre-save middleware to update updatedAt
applicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);