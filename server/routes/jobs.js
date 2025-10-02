const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, employerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('location').optional().isString().withMessage('Location must be a string'),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  query('workMode').optional().isIn(['office', 'remote', 'hybrid']).withMessage('Invalid work mode'),
  query('minSalary').optional().isInt({ min: 0 }).withMessage('Min salary must be a positive integer'),
  query('maxSalary').optional().isInt({ min: 0 }).withMessage('Max salary must be a positive integer'),
  query('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive integer'),
  query('skills').optional().isString().withMessage('Skills must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      workMode,
      minSalary,
      maxSalary,
      experience,
      skills
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Location filter
    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Work mode filter
    if (workMode) {
      filter.workMode = workMode;
    }

    // Salary filter
    if (minSalary || maxSalary) {
      filter['salary.min'] = {};
      if (minSalary) filter['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) filter['salary.min'].$lte = parseInt(maxSalary);
    }

    // Experience filter
    if (experience) {
      filter['requirements.experience.min'] = { $lte: parseInt(experience) };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter['requirements.skills'] = { $in: skillsArray };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName company')
      .sort({ createdAt: -1, featured: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName company profile')
      .lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (Employer)
router.post('/', [
  employerAuth,
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('company.name').notEmpty().withMessage('Company name is required'),
  body('company.totalEmployees').notEmpty().withMessage('Total employees count is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('jobPostType').notEmpty().withMessage('Job post type is required'),
  body('employmentType').notEmpty().withMessage('Employment type is required'),
  body('jobModeType').notEmpty().withMessage('Job mode type is required'),
  body('jobShiftType').notEmpty().withMessage('Job shift type is required'),
  body('experienceType').notEmpty().withMessage('Experience type is required'),
  body('totalExperience.min').notEmpty().withMessage('Minimum experience is required'),
  body('totalExperience.max').notEmpty().withMessage('Maximum experience is required'),
  body('numberOfVacancy').isNumeric().withMessage('Number of vacancy must be a number'),
  body('joiningPeriod').notEmpty().withMessage('Joining period is required'),
  body('hrContact.name').notEmpty().withMessage('HR contact name is required'),
  body('hrContact.number').notEmpty().withMessage('HR contact number is required'),
  body('hrContact.email').isEmail().withMessage('Valid HR contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if employer is verified (only for employers, not admins)
    if (req.user.userType === 'employer' && !req.user.canPostJobs()) {
      return res.status(403).json({
        message: 'Your employer account is not verified yet. Please wait for admin verification before posting jobs.',
        verificationStatus: req.user.verificationStatus
      });
    }

    // Check for duplicate job posting within last 30 seconds
    const recentJob = await Job.findOne({
      postedBy: req.user._id,
      title: req.body.title,
      'company.name': req.body.company?.name,
      createdAt: { $gte: new Date(Date.now() - 30000) } // 30 seconds ago
    });

    if (recentJob) {
      return res.status(400).json({ 
        message: 'Duplicate job posting detected. Please wait before posting the same job again.' 
      });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    // Process skills array
    if (jobData.skills && typeof jobData.skills === 'string') {
      jobData.skills = jobData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    }

    // Process arrays for checkboxes
    const arrayFields = ['additionalBenefits', 'gender', 'maritalStatus', 'industry', 'department', 'jobRole', 'education', 'course', 'candidateIndustry', 'preferredLanguage', 'diversityHiring', 'disabilities', 'jobResponseMethods', 'communicationPreference', 'hrContact.days'];
    
    arrayFields.forEach(field => {
      if (jobData[field] && !Array.isArray(jobData[field])) {
        jobData[field] = [jobData[field]];
      }
    });

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'firstName lastName company');

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Employer)
router.put('/:id', employerAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName company');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Employer)
router.delete('/:id', employerAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get employer's jobs
// @access  Private (Employer)
router.get('/employer/my-jobs', employerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { postedBy: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(filter)
      .populate('applications', 'applicant status appliedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        totalJobs
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// @route   GET /api/jobs/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Job.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { 'company.name': { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
            { 'requirements.skills': { $regex: q, $options: 'i' } }
          ],
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: '$title' },
          companies: { $addToSet: '$company.name' },
          cities: { $addToSet: '$location.city' },
          skills: { $addToSet: '$requirements.skills' }
        }
      }
    ]);

    const result = suggestions[0] || {};
    const allSuggestions = [
      ...(result.titles || []),
      ...(result.companies || []),
      ...(result.cities || []),
      ...(result.skills?.flat() || [])
    ].filter((item, index, self) => 
      item && self.indexOf(item) === index
    ).slice(0, 10);

    res.json({ suggestions: allSuggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions' });
  }
});

module.exports = router;
