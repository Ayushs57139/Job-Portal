const express = require('express');
const { body, validationResult } = require('express-validator');
const SalesEnquiry = require('../models/SalesEnquiry');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sales-enquiry
// @desc    Submit a sales enquiry
// @access  Public
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('company').notEmpty().withMessage('Company name is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('industry').isIn(['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Other'])
    .withMessage('Invalid industry'),
  body('companySize').isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('enquiryType').isIn(['pricing', 'demo', 'custom-solution', 'partnership', 'support', 'other'])
    .withMessage('Invalid enquiry type'),
  body('message').notEmpty().withMessage('Message is required')
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

    const enquiryData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      source: 'website'
    };

    const enquiry = new SalesEnquiry(enquiryData);
    await enquiry.save();

    // TODO: Send email notification to sales team
    // TODO: Send confirmation email to customer

    res.status(201).json({
      success: true,
      message: 'Sales enquiry submitted successfully',
      enquiryId: enquiry._id
    });

  } catch (error) {
    console.error('Error creating sales enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating sales enquiry'
    });
  }
});

// @route   GET /api/sales-enquiry
// @desc    Get all sales enquiries (Admin only)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      industry,
      companySize,
      enquiryType,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (companySize) filter.companySize = companySize;
    if (enquiryType) filter.enquiryType = enquiryType;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const enquiries = await SalesEnquiry.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('notes.addedBy', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await SalesEnquiry.countDocuments(filter);

    res.json({
      success: true,
      enquiries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching sales enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales enquiries'
    });
  }
});

// @route   GET /api/sales-enquiry/:id
// @desc    Get single sales enquiry (Admin only)
// @access  Private (Admin)
router.get('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const enquiry = await SalesEnquiry.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('notes.addedBy', 'firstName lastName');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Sales enquiry not found'
      });
    }

    res.json({
      success: true,
      enquiry
    });

  } catch (error) {
    console.error('Error fetching sales enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales enquiry'
    });
  }
});

// @route   PUT /api/sales-enquiry/:id
// @desc    Update sales enquiry (Admin only)
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status, priority, assignedTo, nextFollowUp } = req.body;

    const enquiry = await SalesEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Sales enquiry not found'
      });
    }

    if (status) enquiry.status = status;
    if (priority) enquiry.priority = priority;
    if (assignedTo) enquiry.assignedTo = assignedTo;
    if (nextFollowUp) enquiry.nextFollowUp = nextFollowUp;

    await enquiry.save();

    res.json({
      success: true,
      message: 'Sales enquiry updated successfully',
      enquiry
    });

  } catch (error) {
    console.error('Error updating sales enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sales enquiry'
    });
  }
});

// @route   POST /api/sales-enquiry/:id/notes
// @desc    Add note to sales enquiry (Admin only)
// @access  Private (Admin)
router.post('/:id/notes', [auth, adminAuth], [
  body('note').notEmpty().withMessage('Note is required')
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

    const enquiry = await SalesEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Sales enquiry not found'
      });
    }

    await enquiry.addNote(req.body.note, req.user.id);

    res.json({
      success: true,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
});

// @route   GET /api/sales-enquiry/stats/overview
// @desc    Get sales enquiry statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await SalesEnquiry.getStats();
    const total = await SalesEnquiry.countDocuments();
    
    // Get recent enquiries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await SalesEnquiry.countDocuments({
      submittedAt: { $gte: thirtyDaysAgo }
    });

    // Get enquiries by industry
    const industryStats = await SalesEnquiry.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get enquiries by company size
    const companySizeStats = await SalesEnquiry.aggregate([
      { $group: { _id: '$companySize', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        recent: recentCount,
        byStatus: stats,
        byIndustry: industryStats,
        byCompanySize: companySizeStats
      }
    });

  } catch (error) {
    console.error('Error fetching sales enquiry stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   DELETE /api/sales-enquiry/:id
// @desc    Delete sales enquiry (Admin only)
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const enquiry = await SalesEnquiry.findByIdAndDelete(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Sales enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Sales enquiry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting sales enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting sales enquiry'
    });
  }
});

module.exports = router;
