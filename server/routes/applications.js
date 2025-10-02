const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply to job (comprehensive application)
// @access  Public
router.post('/', [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('maritalStatus').notEmpty().withMessage('Marital status is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('pincode').notEmpty().withMessage('Pincode is required'),
  body('expectedSalary').isNumeric().withMessage('Expected salary must be a number'),
  body('jobType').notEmpty().withMessage('Job type is required'),
  body('jobStatus').notEmpty().withMessage('Job status is required'),
  body('totalExperience').notEmpty().withMessage('Total experience is required'),
  body('noticePeriod').notEmpty().withMessage('Notice period is required'),
  body('education').notEmpty().withMessage('Education is required'),
  body('skills').notEmpty().withMessage('Skills are required'),
  body('currentState').notEmpty().withMessage('Current state is required'),
  body('currentCity').notEmpty().withMessage('Current city is required'),
  body('preferredLanguage').notEmpty().withMessage('Preferred language is required'),
  body('englishFluency').notEmpty().withMessage('English fluency is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      jobId, fullName, email, mobileNumber, whatsappNumber, gender, maritalStatus, 
      dateOfBirth, pincode, currentJobTitle, currentCompanyName, currentSalary, 
      expectedSalary, jobType, jobStatus, totalExperience, noticePeriod, education, 
      course, skills, currentState, currentCity, currentLocality, homeTown, 
      preferredLanguage, englishFluency, preferredJobCities, companyType, 
      jobIndustry, department, jobRole, assetRequirements, resumeUrl, coverLetter 
    } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        email,
        phone: mobileNumber,
        userType: 'jobseeker',
        isEmailVerified: false,
        password: 'temp-password-' + Date.now() // Temporary password
      });

      await user.save();
    }

    // Check if user already applied to this job
    const existingApplication = await Application.findOne({
      user: user._id,
      job: jobId
    });
    
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already applied to this job' 
      });
    }

    // Create comprehensive application
    const application = new Application({
      user: user._id,
      job: jobId,
      
      // Personal Information
      fullName,
      email,
      mobileNumber,
      whatsappNumber,
      gender,
      maritalStatus,
      dateOfBirth: new Date(dateOfBirth),
      pincode,

      // Professional Information
      currentJobTitle,
      currentCompanyName,
      currentSalary,
      expectedSalary,
      jobType,
      jobStatus,
      totalExperience,
      noticePeriod,

      // Education & Skills
      education,
      course,
      skills,

      // Location & Preferences
      currentState,
      currentCity,
      currentLocality,
      homeTown,
      preferredLanguage,
      englishFluency,
      preferredJobCities,

      // Company & Industry Information
      companyType,
      jobIndustry,
      department,
      jobRole,

      // Asset Requirements
      assetRequirements: assetRequirements || [],

      // Resume & Cover Letter
      resumeUrl,
      coverLetter: coverLetter || 'No cover letter provided',

      // Application Status
      status: 'applied',
      appliedAt: new Date()
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        jobId: application.job,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during application submission' 
    });
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/applications/guest-apply
// @desc    Apply to job as guest (creates account automatically)
// @access  Public
router.post('/guest-apply', [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('user.firstName').notEmpty().withMessage('First name is required'),
  body('user.lastName').notEmpty().withMessage('Last name is required'),
  body('user.email').isEmail().withMessage('Please include a valid email'),
  body('user.password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('user.phone').notEmpty().withMessage('Phone number is required'),
  body('application.coverLetter').notEmpty().withMessage('Cover letter is required'),
  body('application.availability').notEmpty().withMessage('Availability is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, user: userData, application: applicationData } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: userData.email });
    
    if (user) {
      // User exists, check if they already applied to this job
      const existingApplication = await Application.findOne({
        user: user._id,
        job: jobId
      });
      
      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied to this job' });
      }
    } else {
      // Create new user
      user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        userType: 'jobseeker',
        isEmailVerified: false
      });

      await user.save();
    }

    // Create application
    const application = new Application({
      user: user._id,
      job: jobId,
      coverLetter: applicationData.coverLetter,
      expectedSalary: applicationData.expectedSalary,
      availability: applicationData.availability,
      status: 'applied',
      appliedAt: new Date()
    });

    await application.save();

    // Generate token for the user
    const token = generateToken(user._id);

    // Return user data without password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'Application submitted successfully',
      token,
      user: userResponse,
      application: {
        id: application._id,
        jobId: application.job,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Guest application error:', error);
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// @route   POST /api/applications/apply
// @desc    Apply to job (authenticated user)
// @access  Private
router.post('/apply', auth, [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('coverLetter').notEmpty().withMessage('Cover letter is required'),
  body('availability').notEmpty().withMessage('Availability is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, coverLetter, expectedSalary, availability } = req.body;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      user: userId,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Create application
    const application = new Application({
      user: userId,
      job: jobId,
      coverLetter,
      expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
      availability,
      status: 'applied',
      appliedAt: new Date()
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        jobId: application.job,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get user's applications
// @access  Private
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job', 'title company location salary createdAt')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job (employer only)
// @access  Private
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if user is employer and owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('user', 'firstName lastName email phone')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:applicationId/status
// @desc    Update application status (employer only)
// @access  Private
router.put('/:applicationId/status', auth, [
  body('status').isIn(['applied', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'postedBy');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the job
    if (application.job.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application details
// @access  Private (Admin/Employer)
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location salary postedBy')
      .populate('user', 'firstName lastName email phone');

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      });
    }

    // Check if user has permission to view this application
    const user = req.user;
    const job = application.job;
    
    // Allow if user is admin, or if user posted the job, or if user is the applicant
    const canView = user.userType === 'admin' || 
                   user.userType === 'superadmin' ||
                   (job && job.postedBy && job.postedBy.toString() === user._id.toString()) ||
                   application.user._id.toString() === user._id.toString();

    if (!canView) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
});

module.exports = router;