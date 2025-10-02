const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { employerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/employers/dashboard
// @desc    Get employer dashboard data
// @access  Private (Employer)
router.get('/dashboard', employerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get employer's jobs
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('applications', 'applicant status appliedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total counts
    const totalJobs = await Job.countDocuments({ postedBy: req.user._id });
    const activeJobs = await Job.countDocuments({ 
      postedBy: req.user._id, 
      status: 'active' 
    });
    const totalApplications = await Application.countDocuments({ 
      employer: req.user._id 
    });

    // Get recent applications
    const recentApplications = await Application.find({ employer: req.user._id })
      .populate('job', 'title company')
      .populate('applicant', 'firstName lastName email profile')
      .sort({ appliedAt: -1 })
      .limit(5);

    // Get application statistics
    const applicationStats = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $unwind: '$job'
      },
      {
        $match: {
          'job.postedBy': req.user._id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      applied: 0,
      viewed: 0,
      shortlisted: 0,
      rejected: 0,
      interviewed: 0,
      hired: 0
    };

    applicationStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      jobs,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        statusCounts
      },
      recentApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        totalJobs
      }
    });
  } catch (error) {
    console.error('Get employer dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/employers/analytics
// @desc    Get employer analytics
// @access  Private (Employer)
router.get('/analytics', employerAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Job views analytics
    const jobViews = await Job.aggregate([
      {
        $match: {
          postedBy: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          views: { $sum: '$views' },
          applications: { $sum: '$applicationsCount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top performing jobs
    const topJobs = await Job.find({ postedBy: req.user._id })
      .sort({ views: -1, applicationsCount: -1 })
      .limit(5)
      .select('title company views applicationsCount');

    // Application trends
    const applicationTrends = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $unwind: '$job'
      },
      {
        $match: {
          'job.postedBy': req.user._id,
          appliedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Skills in demand
    const skillsInDemand = await Job.aggregate([
      {
        $match: { postedBy: req.user._id }
      },
      {
        $unwind: '$requirements.skills'
      },
      {
        $group: {
          _id: '$requirements.skills',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      jobViews,
      topJobs,
      applicationTrends,
      skillsInDemand
    });
  } catch (error) {
    console.error('Get employer analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// @route   POST /api/employers/company-profile
// @desc    Update company profile
// @access  Private (Employer)
router.post('/company-profile', [
  employerAuth,
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('industry').optional().isString().withMessage('Industry must be a string'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).withMessage('Invalid company size'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, industry, website, size, description } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'profile.company': {
            name: companyName,
            industry,
            website,
            size,
            description
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Company profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ message: 'Server error while updating company profile' });
  }
});

// @route   GET /api/employers/applications-summary
// @desc    Get applications summary for all jobs
// @access  Private (Employer)
router.get('/applications-summary', employerAuth, async (req, res) => {
  try {
    const { status, jobId } = req.query;

    const matchQuery = { employer: req.user._id };
    if (status) matchQuery.status = status;
    if (jobId) matchQuery.job = jobId;

    const applications = await Application.find(matchQuery)
      .populate('job', 'title company')
      .populate('applicant', 'firstName lastName email profile')
      .sort({ appliedAt: -1 });

    // Group by job
    const groupedApplications = applications.reduce((acc, app) => {
      const jobId = app.job._id.toString();
      if (!acc[jobId]) {
        acc[jobId] = {
          job: app.job,
          applications: []
        };
      }
      acc[jobId].applications.push(app);
      return acc;
    }, {});

    res.json({
      applications: Object.values(groupedApplications),
      totalApplications: applications.length
    });
  } catch (error) {
    console.error('Get applications summary error:', error);
    res.status(500).json({ message: 'Server error while fetching applications summary' });
  }
});

// @route   POST /api/employers/bulk-update-applications
// @desc    Bulk update application status
// @access  Private (Employer)
router.post('/bulk-update-applications', [
  employerAuth,
  body('applicationIds').isArray().withMessage('Application IDs must be an array'),
  body('status').isIn(['applied', 'viewed', 'shortlisted', 'rejected', 'interviewed', 'hired']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationIds, status, notes } = req.body;

    // Verify all applications belong to the employer
    const applications = await Application.find({
      _id: { $in: applicationIds },
      employer: req.user._id
    });

    if (applications.length !== applicationIds.length) {
      return res.status(400).json({ message: 'Some applications not found or not authorized' });
    }

    // Update applications
    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === 'viewed') updateData.viewedAt = new Date();

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: updateData }
    );

    res.json({
      message: `${applicationIds.length} applications updated successfully`
    });
  } catch (error) {
    console.error('Bulk update applications error:', error);
    res.status(500).json({ message: 'Server error while bulk updating applications' });
  }
});

module.exports = router;
