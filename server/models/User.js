const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin', 'superadmin'],
    default: 'jobseeker'
  },
  employerType: {
    type: String,
    enum: ['consultancy', 'company'],
    required: function() {
      return this.userType === 'employer';
    }
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    resume: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: Number,
      default: 0
    },
    currentLocation: {
      type: String,
      trim: true
    },
    preferredLocations: [{
      type: String,
      trim: true
    }],
    currentSalary: {
      type: Number,
      default: 0
    },
    expectedSalary: {
      type: Number,
      default: 0
    },
    education: [{
      degree: String,
      institution: String,
      year: Number,
      percentage: Number,
      field: String
    }],
    workExperience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String,
      location: String,
      salary: Number
    }],
    // For job seekers
    jobPreferences: {
      jobTypes: [{
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
      }],
      workModes: [{
        type: String,
        enum: ['office', 'remote', 'hybrid']
      }],
      industries: [{
        type: String,
        trim: true
      }],
      companySizes: [{
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
      }]
    },
    // For employers
    company: {
      name: {
        type: String,
        trim: true
      },
      website: {
        type: String,
        trim: true
      },
      industry: {
        type: String,
        trim: true
      },
      size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
      },
      description: {
        type: String,
        maxlength: 1000
      },
      logo: {
        type: String,
        default: ''
      },
      location: {
        city: String,
        state: String,
        country: String
      },
      // For consultancies
      consultancy: {
        licenseNumber: String,
        registrationNumber: String,
        specializations: [String], // e.g., IT, Finance, Healthcare
        clientTypes: [String], // e.g., startups, enterprises, government
        serviceAreas: [String], // e.g., recruitment, consulting, training
        establishedYear: Number,
        teamSize: Number,
        clients: [{
          name: String,
          industry: String,
          projectType: String,
          duration: String,
          status: {
            type: String,
            enum: ['active', 'completed', 'on-hold']
          }
        }]
      },
      // For companies
      company: {
        foundedYear: Number,
        revenue: String,
        employeeCount: Number,
        departments: [String],
        benefits: [String],
        culture: String,
        workEnvironment: String,
        growthStage: {
          type: String,
          enum: ['startup', 'growth', 'established', 'enterprise']
        }
      }
    },
    // Social links
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String
    },
    // Notification preferences
    notifications: {
      email: {
        jobAlerts: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
      },
      push: {
        jobAlerts: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true }
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  // Admin specific fields
  adminPermissions: {
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageJobs: {
      type: Boolean,
      default: false
    },
    canManageApplications: {
      type: Boolean,
      default: false
    },
    canViewAnalytics: {
      type: Boolean,
      default: false
    },
    canManageSettings: {
      type: Boolean,
      default: false
    },
    canManageContent: {
      type: Boolean,
      default: false
    }
  },
  isAdminActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.userType === 'admin' || this.userType === 'superadmin';
};

// Check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.userType === 'superadmin';
};

// Check admin permission
userSchema.methods.hasAdminPermission = function(permission) {
  if (!this.isAdmin() || !this.isAdminActive) return false;
  if (this.isSuperAdmin()) return true;
  return this.adminPermissions[permission] === true;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
