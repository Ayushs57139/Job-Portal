const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { adminAuth, superAdminAuth, requirePermission } = require('../middleware/adminAuth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email userType createdAt');
    
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'firstName lastName email')
      .select('title company.name location.city status createdAt');

    // Monthly statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        inactiveJobs: totalJobs - activeJobs
      },
      recentUsers,
      recentJobs,
      monthlyStats: {
        users: monthlyStats[0],
        jobs: monthlyStats[1],
        applications: monthlyStats[2]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin)
router.get('/users', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const userType = req.query.userType || '';
    const isActive = req.query.isActive;

    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) {
      query.userType = userType;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user by ID
// @access  Private (Admin)
router.get('/users/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/users/:id', requirePermission('canManageUsers'), [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('userType').optional().isIn(['jobseeker', 'employer', 'admin', 'superadmin']).withMessage('Invalid user type'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent non-superadmin from promoting to superadmin
    if (req.body.userType === 'superadmin' && !req.user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admin can create super admin accounts' });
    }

    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'userType', 'isActive', 'isEmailVerified', 'adminPermissions'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of super admin accounts
    if (user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Cannot delete super admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs with admin filters
// @access  Private (Admin)
router.get('/jobs', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const featured = req.query.featured;

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/jobs/:id
// @desc    Update job
// @access  Private (Admin)
router.put('/jobs/:id', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'description', 'status', 'featured', 'urgent', 'tags', 'benefits', 'applicationDeadline'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName email');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete job
// @access  Private (Admin)
router.delete('/jobs/:id', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Also delete related applications
    await Application.deleteMany({ job: req.params.id });
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/applications
// @desc    Get all applications with admin filters
// @access  Private (Admin)
router.get('/applications', requirePermission('canManageApplications'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    let query = {};
    
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email')
      .populate('job', 'title company.name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
// @access  Private (Admin)
router.put('/applications/:id/status', requirePermission('canManageApplications'), [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = req.body.status;
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create new admin user
// @access  Private (Super Admin)
router.post('/create-admin', superAdminAuth, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['admin', 'superadmin']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, userType, adminPermissions } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create admin user
    const adminUser = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
      adminPermissions: adminPermissions || {
        canManageUsers: false,
        canManageJobs: false,
        canManageApplications: false,
        canViewAnalytics: false,
        canManageSettings: false,
        canManageContent: false
      }
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        userType: adminUser.userType,
        adminPermissions: adminUser.adminPermissions
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error during admin creation' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', requirePermission('canViewAnalytics'), async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User analytics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Job analytics
    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Application analytics
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top companies by job count
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$company.name',
          jobCount: { $sum: 1 },
          avgSalary: { $avg: { $add: ['$salary.min', '$salary.max'] } }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    // Top skills
    const topSkills = await Job.aggregate([
      { $unwind: '$requirements.skills' },
      {
        $group: {
          _id: '$requirements.skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      userStats,
      jobStats,
      applicationStats,
      topCompanies,
      topSkills,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/team-limits
// @desc    Get all companies/consultancies with their team member limits
// @access  Private (Admin)
router.get('/team-limits', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const employerType = req.query.employerType || '';

    let query = { userType: 'employer' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.company.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (employerType) {
      query.employerType = employerType;
    }

    const employers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Update current team member counts
    for (let employer of employers) {
      await User.updateTeamMemberCount(employer._id);
      await employer.save();
    }

    const total = await User.countDocuments(query);

    res.json({
      employers: employers.map(emp => ({
        id: emp._id,
        userId: emp.userId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        employerType: emp.employerType,
        companyName: emp.profile?.company?.name || 'N/A',
        teamMemberLimits: emp.teamMemberLimits,
        isEmployerVerified: emp.isEmployerVerified,
        verificationStatus: emp.verificationStatus,
        createdAt: emp.createdAt
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get team limits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/team-limits/:id
// @desc    Update team member limit for a company/consultancy
// @access  Private (Admin)
router.put('/team-limits/:id', requirePermission('canManageUsers'), [
  body('maxTeamMembers').isInt({ min: 0 }).withMessage('Max team members must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { maxTeamMembers } = req.body;
    const employerId = req.params.id;

    const employer = await User.findById(employerId);
    if (!employer || employer.userType !== 'employer') {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Update team member limit
    employer.teamMemberLimits.maxTeamMembers = maxTeamMembers;
    employer.teamMemberLimits.limitSetBy = req.user._id;
    employer.teamMemberLimits.limitSetAt = new Date();

    await employer.save();

    res.json({
      message: 'Team member limit updated successfully',
      employer: {
        id: employer._id,
        userId: employer.userId,
        firstName: employer.firstName,
        lastName: employer.lastName,
        email: employer.email,
        employerType: employer.employerType,
        companyName: employer.profile?.company?.name || 'N/A',
        teamMemberLimits: employer.teamMemberLimits
      }
    });
  } catch (error) {
    console.error('Update team limit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/team-limits/:id/subusers
// @desc    Get subusers for a specific company/consultancy
// @access  Private (Admin)
router.get('/team-limits/:id/subusers', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const employerId = req.params.id;

    const employer = await User.findById(employerId);
    if (!employer || employer.userType !== 'employer') {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const subusers = await User.getSubusers(employerId);

    res.json({
      employer: {
        id: employer._id,
        userId: employer.userId,
        firstName: employer.firstName,
        lastName: employer.lastName,
        email: employer.email,
        employerType: employer.employerType,
        companyName: employer.profile?.company?.name || 'N/A',
        teamMemberLimits: employer.teamMemberLimits
      },
      subusers: subusers.map(subuser => ({
        id: subuser._id,
        userId: subuser.userId,
        firstName: subuser.firstName,
        lastName: subuser.lastName,
        email: subuser.email,
        role: subuser.subuserRole,
        permissions: subuser.subuserPermissions,
        invitedAt: subuser.invitedAt,
        invitationAccepted: subuser.invitationAccepted,
        invitationAcceptedAt: subuser.invitationAcceptedAt,
        lastLogin: subuser.lastLogin,
        isActive: subuser.isActive
      }))
    });
  } catch (error) {
    console.error('Get employer subusers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/jobs
// @desc    Create a new job (Admin)
// @access  Private (Admin)
router.post('/jobs', [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('company.name').notEmpty().withMessage('Company name is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('numberOfVacancy').isInt({ min: 1 }).withMessage('Number of vacancy must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Set default values for required fields if not provided
    const jobData = {
      // Basic job info
      title: req.body.title,
      description: req.body.description,
      
      // Company info
      company: {
        name: req.body.company?.name || 'Unknown Company',
        totalEmployees: req.body.company?.totalEmployees || '0-10',
        website: req.body.company?.website || '',
        type: req.body.company?.type || 'Startup',
        industry: req.body.company?.industry || ''
      },
      
      // Job details
      jobPostType: req.body.jobPostType || 'Sales',
      employmentType: req.body.employmentType || 'Permanent',
      jobModeType: req.body.jobModeType || 'Full Time',
      jobShiftType: req.body.jobShiftType || 'Day Shift',
      skills: req.body.skills || [],
      
      // Location
      location: {
        state: req.body.location?.state || 'Maharashtra',
        city: req.body.location?.city || 'Mumbai',
        locality: req.body.location?.locality || '',
        distanceFromLocation: req.body.location?.distanceFromLocation || '',
        includeWillingToRelocate: req.body.location?.includeWillingToRelocate || false
      },
      
      // Experience
      experienceType: req.body.experienceType || 'Fresher',
      totalExperience: {
        min: req.body.totalExperience?.min || req.body.totalExperience || 'Fresher',
        max: req.body.totalExperience?.max || req.body.totalExperience || 'Fresher'
      },
      
      // Salary
      salary: {
        min: req.body.salary?.min || 10000,
        max: req.body.salary?.max || 20000,
        currency: req.body.salary?.currency || 'INR',
        hideFromCandidates: req.body.salary?.hideFromCandidates || false
      },
      
      // Vacancy
      numberOfVacancy: req.body.numberOfVacancy || 1,
      
      // HR Contact
      hrContact: {
        name: req.body.hrContact?.name || 'HR Contact',
        number: req.body.hrContact?.number || '0000000000',
        email: req.body.hrContact?.email || 'hr@company.com',
        whatsappNumber: req.body.hrContact?.whatsappNumber || '',
        timing: req.body.hrContact?.timing || { start: '', end: '' },
        days: req.body.hrContact?.days || []
      },
      
      // Additional fields
      includeWalkinDetails: req.body.includeWalkinDetails || false,
      status: 'active',
      postedBy: req.user.id
    };

    console.log('Creating job with data:', JSON.stringify(jobData, null, 2));

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job: ' + error.message
    });
  }
});

module.exports = router;
