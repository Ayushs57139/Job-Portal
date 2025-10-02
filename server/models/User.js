const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: false,
    index: true
  },
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
      levelOfEducation: {
        type: String,
        enum: ['No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'PPG', 'Doctorate', 'Ph.D', 'Other']
      },
      degree: {
        type: String,
        trim: true
      },
      specialization: {
        type: String,
        trim: true
      },
      institution: {
        type: String,
        trim: true
      },
      educationStatus: {
        type: String,
        enum: ['Pursuing / Running', 'Pass Out / Completed']
      },
      startDate: {
        type: String, // MM-YYYY format
        trim: true
      },
      endDate: {
        type: String, // MM-YYYY format
        trim: true
      },
      educationType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Correspondence', 'Any']
      },
      educationMedium: {
        type: String,
        trim: true
      },
      marks: {
        type: String,
        trim: true
      },
      marksType: {
        type: String,
        enum: ['Grade', 'Percentage', 'Division', 'CGPA']
      },
      marksValue: {
        type: String,
        trim: true
      },
      // ITI specific fields
      itiTrade: {
        type: String,
        enum: ['Electrical', 'Mechanical Engineering', 'Electronics', 'Civil Engineering', 'Fitter', 'Electrical Engineering', 'Wireman', 'Computer Science & Engineering', 'Diesel Mechanic', 'Electronics & Communication Engineering', 'Mechanical', 'Automobile Engineering', 'Electrician', 'Information Technology (IT)', 'Mechanic Motor Vehicle', 'Mechatronics', 'Draughtsman (Mechanical)', 'Aeronautical Engineering', 'Draughtsman (Civil)', 'Mining Engineering', 'Tool & Die Maker', 'Medical Laboratory Technology (DMLT)', 'Mechanic Machine Tool Maintenance', 'Radiology & Imaging Technology', 'Electronics Mechanic', 'Nursing', 'Mechanic (Refrigeration & Air-Conditioning)', 'Pharmacy', 'Welder', 'Physiotherapy', 'COPA', 'Optometry', 'Stenographer', 'Veterinary Science', 'Hair & Skin Care', 'Ayurveda Pharmacy', 'Secretarial Practice', 'Accounting & Finance', 'Dress Making', 'Business Administration', 'Sewing Technology', 'Banking & Insurance', 'Plumber', 'Digital Marketing', 'Painter', 'Retail Management', 'Mechanic Two and Three Wheeler', 'Taxation', 'Financial Management', 'E-commerce', 'Office Management', 'Fashion Designing', 'Interior Designing', 'Graphic Designing', 'Animation & Multimedia', 'Journalism & Mass Communication', 'Photography', 'Event Management', 'Hotel Management', 'Fine Arts', 'Travel & Tourism', 'Biotechnology', 'Microbiology', 'Environmental Science', 'Forensic Science', 'Food Technology', 'Clinical Research', 'Education (Special Education, Early Childhood)', 'Social Work', 'Public Administration', 'Psychology', 'Library & Information Science', 'Dairy Technology', 'Food Processing', 'Industrial Safety', 'Fire & Safety Engineering', 'Applied Art', 'Drawing & Painting', 'Sculpture & Modelling', 'Textile Designing', 'Aerospace Engineering', 'Industrial Engineering', 'Information Engineering', 'Chemical Engineering', 'Instrumentation Engineering', 'Marine Engineering', 'Computer Engineering', 'Petroleum Engineering', 'Electronics Engineering', 'Textile Engineering', 'Geographic Information Systems (GIS)', 'Paint Technology', 'Elementary Education', 'Architecture', 'Chemical Fertilizer', 'Metallurgical Engineering', 'IT Smart', 'Other']
      },
      // Diploma specific fields
      diplomaField: {
        type: String,
        enum: ['Electrical', 'Mechanical Engineering', 'Electronics', 'Civil Engineering', 'Fitter', 'Electrical Engineering', 'Wireman', 'Computer Science & Engineering', 'Diesel Mechanic', 'Electronics & Communication Engineering', 'Mechanical', 'Automobile Engineering', 'Electrician', 'Information Technology (IT)', 'Mechanic Motor Vehicle', 'Mechatronics', 'Draughtsman (Mechanical)', 'Aeronautical Engineering', 'Draughtsman (Civil)', 'Mining Engineering', 'Tool & Die Maker', 'Medical Laboratory Technology (DMLT)', 'Mechanic Machine Tool Maintenance', 'Radiology & Imaging Technology', 'Electronics Mechanic', 'Nursing', 'Mechanic (Refrigeration & Air-Conditioning)', 'Pharmacy', 'Welder', 'Physiotherapy', 'COPA', 'Optometry', 'Stenographer', 'Veterinary Science', 'Hair & Skin Care', 'Ayurveda Pharmacy', 'Secretarial Practice', 'Accounting & Finance', 'Dress Making', 'Business Administration', 'Sewing Technology', 'Banking & Insurance', 'Plumber', 'Digital Marketing', 'Painter', 'Retail Management', 'Mechanic Two and Three Wheeler', 'Taxation', 'Financial Management', 'E-commerce', 'Office Management', 'Fashion Designing', 'Interior Designing', 'Graphic Designing', 'Animation & Multimedia', 'Journalism & Mass Communication', 'Photography', 'Event Management', 'Hotel Management', 'Fine Arts', 'Travel & Tourism', 'Biotechnology', 'Microbiology', 'Environmental Science', 'Forensic Science', 'Food Technology', 'Clinical Research', 'Education (Special Education, Early Childhood)', 'Social Work', 'Public Administration', 'Psychology', 'Library & Information Science', 'Dairy Technology', 'Food Processing', 'Industrial Safety', 'Fire & Safety Engineering', 'Applied Art', 'Drawing & Painting', 'Sculpture & Modelling', 'Textile Designing', 'Aerospace Engineering', 'Industrial Engineering', 'Information Engineering', 'Chemical Engineering', 'Instrumentation Engineering', 'Marine Engineering', 'Computer Engineering', 'Petroleum Engineering', 'Electronics Engineering', 'Textile Engineering', 'Geographic Information Systems (GIS)', 'Paint Technology', 'Elementary Education', 'Architecture', 'Chemical Fertilizer', 'Metallurgical Engineering', 'IT Smart', 'Other']
      },
      // Graduate specific fields
      graduateDegree: {
        type: String,
        enum: ['B.A', 'B.Arch', 'B.A Hons', 'B.Com', 'B.Com Hons.', 'B.Design', 'B.Ed', 'B.EI.Ed', 'B.E / B.Tech', 'B.F Tech', 'B.Sc', 'B.Sc Hons.', 'B.P.Ed', 'B.U.M.S', 'B.Voc', 'B.Pharma', 'B.Pharma Hons.', 'Bachelor', 'BASc', 'BAF', 'BAMS', 'BBA', 'BBA Hons.', 'BCA', 'BDS', 'BFA', 'BHM', 'BHMS', 'BHMCT', 'BPA', 'BMS', 'MBBS', 'LLB', 'LLB Hons.', 'Pharma.D', 'BS', 'BVSC', 'Dual Degree (BE/B.Tech + ME/M.Tech)', 'B.Ed Special Education', 'Bachelor of Audiology and Speech Language Pathology', 'Bachelor of Commerce in Banking and Finance', 'Bachelor of Commerce in Business Economics', 'Bachelor of Development Studies', 'Bachelor of Environmental Design', 'Bachelor of Environmental Management', 'Bachelor of Event Management', 'Bachelor of international economics', 'Bachelor of Journalism and Mass Communication', 'Bachelor of Music', 'Bachelor of Music Therapy', 'Bachelor of Naturopathy and Yogic Science', 'Bachelor of Occupational Therapy', 'Bachelor of Physiotherapy', 'Bachelor of Public Health', 'Bachelor of Social innovation', 'Bachelor of Social Work', 'Bachelor of Tourism Studies in Cultural Heritage', 'Bachelor of Urban Planning', 'Bachelor of Veterinary Science', 'Bachelor of Vocational Studies', 'Bachelors of Liberal Arts', 'Certified Financial Planner', 'Company Secretary', 'Nursery Teacher Training', 'Other']
      },
      // Post Graduate specific fields
      postGraduateDegree: {
        type: String,
        enum: ['M.A', 'M.Arch', 'M.A Hons', 'M.Com', 'M.Com Hons.', 'M.Design', 'M.Ed', 'M.EI.Ed', 'M.E / M.Tech', 'M.F Tech', 'M.Sc', 'M.Sc Hons.', 'M.P.Ed', 'M.U.M.S', 'M.Voc', 'M.Pharma', 'M.Pharma Hons.', 'Master', 'MASc', 'MAF', 'MAMS', 'MBA', 'MBA Hons.', 'MCA', 'MDS', 'MFA', 'MHM', 'MHMS', 'MHMCT', 'MPA', 'MMS', 'MD', 'LLM', 'LLM Hons.', 'Pharma.D', 'MS', 'MVSC', 'Dual Degree (BE/B.Tech + ME/M.Tech)', 'M.Ed Special Education', 'Master of Audiology and Speech Language Pathology', 'Master of Commerce in Banking and Finance', 'Master of Commerce in Business Economics', 'Master of Development Studies', 'Master of Environmental Design', 'Master of Environmental Management', 'Master of Event Management', 'Master of international economics', 'Master of Journalism and Mass Communication', 'Master of Music', 'Master of Music Therapy', 'Master of Naturopathy and Yogic Science', 'Master of Occupational Therapy', 'Master of Physiotherapy', 'Master of Public Health', 'Master of Social innovation', 'Master of Social Work', 'Master of Tourism Studies in Cultural Heritage', 'Master of Urban Planning', 'Master of Veterinary Science', 'Master of Vocational Studies', 'Masters of Liberal Arts', 'Certified Financial Planner', 'Company Secretary', 'Nursery Teacher Training', 'Other']
      },
      // Doctorate specific fields
      doctorateDegree: {
        type: String,
        enum: ['Ph.D', 'D.Phil', 'D.Sc', 'D.Litt', 'D.M', 'M.Ch', 'D.M.S', 'Other']
      },
      // Additional fields
      year: Number,
      percentage: Number,
      field: String,
      isHighest: {
        type: Boolean,
        default: false
      }
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
  },
  // Employer verification fields
  isEmployerVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDetails: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    documents: [{
      type: {
        type: String,
        enum: ['business_license', 'registration_certificate', 'tax_certificate', 'company_profile', 'other']
      },
      url: String,
      name: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notes: String
  },
  // Team member limits (for companies and consultancies)
  teamMemberLimits: {
    maxTeamMembers: {
      type: Number,
      default: 5, // Default limit
      min: 0
    },
    currentTeamMembers: {
      type: Number,
      default: 0
    },
    limitSetBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    limitSetAt: {
      type: Date,
      default: Date.now
    }
  },
  // Subuser fields
  isSubuser: {
    type: Boolean,
    default: false
  },
  parentUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isSubuser === true;
    }
  },
  subuserRole: {
    type: String,
    enum: ['member', 'manager', 'admin'],
    default: 'member'
  },
  subuserPermissions: {
    canViewJobs: { type: Boolean, default: true },
    canPostJobs: { type: Boolean, default: false },
    canManageApplications: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageSubusers: { type: Boolean, default: false },
    canManageCompanyProfile: { type: Boolean, default: false }
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  invitationAccepted: {
    type: Boolean,
    default: false
  },
  invitationAcceptedAt: Date
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

// Check if employer is verified
userSchema.methods.isEmployerVerifiedUser = function() {
  return this.userType === 'employer' && this.isEmployerVerified === true && this.verificationStatus === 'verified';
};

// Check if user can post jobs
userSchema.methods.canPostJobs = function() {
  if (this.userType === 'admin' || this.userType === 'superadmin') return true;
  if (this.userType === 'employer') return this.isEmployerVerifiedUser();
  if (this.isSubuser) return this.subuserPermissions.canPostJobs;
  return false;
};

// Check if user is a subuser
userSchema.methods.isSubuserAccount = function() {
  return this.isSubuser === true;
};

// Get parent company/consultancy user
userSchema.methods.getParentUser = async function() {
  if (!this.isSubuser) return null;
  return await this.constructor.findById(this.parentUserId);
};

// Check subuser permission
userSchema.methods.hasSubuserPermission = function(permission) {
  if (!this.isSubuser) return false;
  return this.subuserPermissions[permission] === true;
};

// Get all subusers for a parent user
userSchema.statics.getSubusers = async function(parentUserId) {
  return await this.find({ 
    parentUserId: parentUserId, 
    isSubuser: true 
  }).select('-password');
};

// Update team member count for a company/consultancy
userSchema.statics.updateTeamMemberCount = async function(parentUserId) {
  const count = await this.countDocuments({ 
    parentUserId: parentUserId, 
    isSubuser: true,
    isActive: true
  });
  
  await this.findByIdAndUpdate(parentUserId, {
    'teamMemberLimits.currentTeamMembers': count
  });
  
  return count;
};

// Check if company/consultancy can invite more team members
userSchema.methods.canInviteTeamMember = function() {
  if (this.userType !== 'employer') return false;
  return this.teamMemberLimits.currentTeamMembers < this.teamMemberLimits.maxTeamMembers;
};

// Get remaining team member slots
userSchema.methods.getRemainingTeamSlots = function() {
  if (this.userType !== 'employer') return 0;
  return Math.max(0, this.teamMemberLimits.maxTeamMembers - this.teamMemberLimits.currentTeamMembers);
};

// Check if user can manage subusers
userSchema.methods.canManageSubusers = function() {
  if (this.userType === 'admin' || this.userType === 'superadmin') return true;
  if (this.userType === 'employer') return true; // Allow all employers to manage subusers
  if (this.isSubuser) return this.subuserPermissions.canManageSubusers;
  return false;
};

// Generate unique user ID before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    try {
      let userId;
      let isUnique = false;
      
      while (!isUnique) {
        // Generate user ID with format: JW + 8 random digits
        const randomNum = Math.floor(10000000 + Math.random() * 90000000);
        userId = `JW${randomNum}`;
        
        // Check if this userId already exists
        const existingUser = await this.constructor.findOne({ userId });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      this.userId = userId;
    } catch (error) {
      console.error('Error generating userId:', error);
      return next(error);
    }
  }
  next();
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
