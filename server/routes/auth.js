const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert team size to enum
function getSizeEnum(teamSize) {
    const size = parseInt(teamSize);
    if (size <= 10) return '1-10';
    if (size <= 50) return '11-50';
    if (size <= 200) return '51-200';
    if (size <= 500) return '201-500';
    if (size <= 1000) return '501-1000';
    return '1000+';
}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['jobseeker', 'employer', 'admin', 'superadmin']).withMessage('Invalid user type'),
  body('employerType').optional().isIn(['consultancy', 'company']).withMessage('Invalid employer type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, userType, phone, resumeData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      userType,
      phone
    };
    
    // Generate unique userId
    let userId;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate user ID with format: JW + 8 random digits
      const randomNum = Math.floor(10000000 + Math.random() * 90000000);
      userId = `JW${randomNum}`;
      
      // Check if this userId already exists
      const existingUserId = await User.findOne({ userId });
      if (!existingUserId) {
        isUnique = true;
      }
    }
    
    userData.userId = userId;
    
           // Add employer type if user is an employer
           if (userType === 'employer' && req.body.employerType) {
               userData.employerType = req.body.employerType;
               
               // Add employer-specific data
               if (req.body.employerType === 'consultancy' && req.body.consultancy) {
                   userData.profile = {
                       company: {
                           name: req.body.consultancy.name,
                           website: req.body.consultancy.website,
                           industry: req.body.consultancy.industry,
                           size: getSizeEnum(req.body.consultancy.teamSize),
                           description: req.body.consultancy.description,
                           location: req.body.consultancy.location,
                           consultancy: {
                               licenseNumber: req.body.consultancy.licenseNumber,
                               registrationNumber: req.body.consultancy.registrationNumber,
                               specializations: Array.isArray(req.body.consultancy.specializations) ? req.body.consultancy.specializations : (req.body.consultancy.specializations ? req.body.consultancy.specializations.split(',') : []),
                               clientTypes: Array.isArray(req.body.consultancy.clientTypes) ? req.body.consultancy.clientTypes : (req.body.consultancy.clientTypes ? req.body.consultancy.clientTypes.split(',') : []),
                               serviceAreas: Array.isArray(req.body.consultancy.serviceAreas) ? req.body.consultancy.serviceAreas : (req.body.consultancy.serviceAreas ? req.body.consultancy.serviceAreas.split(',') : []),
                               establishedYear: parseInt(req.body.consultancy.establishedYear),
                               teamSize: parseInt(req.body.consultancy.teamSize)
                           }
                       }
                   };
               } else if (req.body.employerType === 'company' && req.body.company) {
                   userData.profile = {
                       company: {
                           name: req.body.company.name,
                           website: req.body.company.website,
                           industry: req.body.company.industry,
                           size: getSizeEnum(req.body.company.employeeCount),
                           description: req.body.company.description,
                           location: req.body.company.location,
                           company: {
                               foundedYear: parseInt(req.body.company.foundedYear),
                               revenue: req.body.company.revenue,
                               employeeCount: parseInt(req.body.company.employeeCount),
                               departments: Array.isArray(req.body.company.departments) ? req.body.company.departments : (req.body.company.departments ? req.body.company.departments.split(',') : []),
                               benefits: Array.isArray(req.body.company.benefits) ? req.body.company.benefits : (req.body.company.benefits ? req.body.company.benefits.split(',') : []),
                               culture: req.body.company.culture,
                               workEnvironment: req.body.company.workEnvironment,
                               growthStage: req.body.company.growthStage
                           }
                       }
                   };
               }
           }
    
    // Add resume data to profile if available
    if (resumeData && userType === 'jobseeker') {
        if (!userData.profile) {
            userData.profile = {};
        }
        
        // Add parsed resume data to profile
        userData.profile.resumeData = {
            skills: resumeData.skills || '',
            experience: resumeData.experience || '',
            education: resumeData.education || '',
            currentJobTitle: resumeData.currentJobTitle || '',
            currentCompany: resumeData.currentCompany || '',
            location: resumeData.location || '',
            rawContent: resumeData.rawContent || ''
        };
        
        // Also add to main profile fields if not already set
        if (resumeData.skills) {
            userData.profile.skills = resumeData.skills.split(',').map(s => s.trim());
        }
        if (resumeData.experience) {
            userData.profile.experience = resumeData.experience;
        }
        if (resumeData.location) {
            userData.profile.location = resumeData.location;
        }
    }
    
    const user = new User(userData);

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        employerType: user.employerType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('loginId').notEmpty().withMessage('Login ID is required (User ID, Email, or Phone)'),
  body('password').exists().withMessage('Password is required'),
  body('userType').optional().isIn(['jobseeker', 'employer', 'admin', 'superadmin']).withMessage('Invalid user type'),
  body('employerType').optional().isIn(['consultancy', 'company']).withMessage('Invalid employer type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loginId, password, userType, employerType } = req.body;

    // Find user by userId, email, or phone
    let user = null;
    
    // Try to find by userId first (format: JW + 8 digits)
    if (loginId.startsWith('JW') && loginId.length === 10) {
      user = await User.findOne({ userId: loginId });
    }
    
    // If not found by userId, try email
    if (!user && loginId.includes('@')) {
      user = await User.findOne({ email: loginId.toLowerCase() });
    }
    
    // If not found by email, try phone number
    if (!user) {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = loginId.replace(/[\s\-\(\)]/g, '');
      user = await User.findOne({ phone: cleanPhone });
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Strict validation for employer types
    if (userType === 'employer' && employerType) {
      if (user.userType !== 'employer') {
        return res.status(400).json({ message: 'This account is not an employer account' });
      }
      
      if (user.employerType !== employerType) {
        return res.status(400).json({ 
          message: `This account is a ${user.employerType} account, not a ${employerType} account. Please use the correct login page.` 
        });
      }
    }

    // Validate user type matches
    if (userType && user.userType !== userType) {
      return res.status(400).json({ 
        message: `This account is a ${user.userType} account, not a ${userType} account. Please use the correct login page.` 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        employerType: user.employerType,
        phone: user.phone,
        profile: user.profile,
        isSubuser: user.isSubuser,
        subuserRole: user.subuserRole,
        subuserPermissions: user.subuserPermissions,
        parentUserId: user.parentUserId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        userType: req.user.userType,
        employerType: req.user.employerType,
        phone: req.user.phone,
        profile: req.user.profile,
        isEmailVerified: req.user.isEmailVerified,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('profile.education').optional().isArray().withMessage('Education must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'profile'];
    
    // Filter only allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

module.exports = router;
