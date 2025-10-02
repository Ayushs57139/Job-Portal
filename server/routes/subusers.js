const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   POST /api/subusers/invite
// @desc    Invite a subuser to company/consultancy
// @access  Private (Employer only)
router.post('/invite', [
  auth,
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['member', 'manager', 'admin']).withMessage('Valid role is required'),
  body('permissions').isObject().withMessage('Permissions object is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, permissions } = req.body;
    const inviter = req.user;

    // Check if inviter can manage subusers
    if (!inviter.canManageSubusers()) {
      return res.status(403).json({ 
        message: 'You do not have permission to invite subusers' 
      });
    }

    // Check team member limit
    if (!inviter.canInviteTeamMember()) {
      return res.status(400).json({ 
        message: `Team member limit reached. You can only have ${inviter.teamMemberLimits.maxTeamMembers} team members. Current: ${inviter.teamMemberLimits.currentTeamMembers}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create subuser
    const subuserData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: 'temp123456', // Temporary password, user will change on first login
      userType: 'employer',
      employerType: inviter.employerType,
      isSubuser: true,
      parentUserId: inviter._id,
      subuserRole: role,
      subuserPermissions: permissions,
      invitedBy: inviter._id,
      invitedAt: new Date(),
      invitationAccepted: false,
      isActive: true,
      isEmailVerified: false
    };

    const subuser = new User(subuserData);
    await subuser.save();

    // Update team member count
    await User.updateTeamMemberCount(inviter._id);

    // TODO: Send invitation email here
    console.log(`Invitation sent to ${email} for ${inviter.profile.company.name || 'Company'}`);

    res.status(201).json({
      message: 'Subuser invited successfully',
      subuser: {
        id: subuser._id,
        userId: subuser.userId,
        firstName: subuser.firstName,
        lastName: subuser.lastName,
        email: subuser.email,
        role: subuser.subuserRole,
        permissions: subuser.subuserPermissions,
        invitedAt: subuser.invitedAt,
        invitationAccepted: subuser.invitationAccepted
      },
      remainingSlots: inviter.getRemainingTeamSlots() - 1 // Subtract 1 for the newly invited user
    });

  } catch (error) {
    console.error('Subuser invitation error:', error);
    res.status(500).json({ message: 'Server error during invitation' });
  }
});

// @route   GET /api/subusers/team-info
// @desc    Get team member information for current company/consultancy
// @access  Private (Employer only)
router.get('/team-info', auth, async (req, res) => {
  try {
    const currentUser = req.user;

    if (currentUser.userType !== 'employer') {
      return res.status(403).json({ 
        message: 'Only employers can view team information' 
      });
    }

    // Update team member count
    await User.updateTeamMemberCount(currentUser._id);
    await currentUser.save();

    res.json({
      message: 'Team information retrieved successfully',
      teamInfo: {
        maxTeamMembers: currentUser.teamMemberLimits.maxTeamMembers,
        currentTeamMembers: currentUser.teamMemberLimits.currentTeamMembers,
        remainingSlots: currentUser.getRemainingTeamSlots(),
        canInviteMore: currentUser.canInviteTeamMember(),
        limitSetAt: currentUser.teamMemberLimits.limitSetAt
      }
    });

  } catch (error) {
    console.error('Get team info error:', error);
    res.status(500).json({ message: 'Server error retrieving team information' });
  }
});

// @route   GET /api/subusers
// @desc    Get all subusers for current company/consultancy
// @access  Private (Employer only)
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = req.user;

    // Check if user can view subusers
    if (!currentUser.canManageSubusers()) {
      return res.status(403).json({ 
        message: 'You do not have permission to view subusers' 
      });
    }

    let subusers;
    if (currentUser.isSubuser) {
      // If current user is a subuser, get subusers of their parent
      subusers = await User.getSubusers(currentUser.parentUserId);
    } else {
      // If current user is the main company/consultancy user
      subusers = await User.getSubusers(currentUser._id);
    }

    res.json({
      message: 'Subusers retrieved successfully',
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
    console.error('Get subusers error:', error);
    res.status(500).json({ message: 'Server error retrieving subusers' });
  }
});

// @route   PUT /api/subusers/:id/role
// @desc    Update subuser role and permissions
// @access  Private (Employer only)
router.put('/:id/role', [
  auth,
  body('role').isIn(['member', 'manager', 'admin']).withMessage('Valid role is required'),
  body('permissions').isObject().withMessage('Permissions object is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role, permissions } = req.body;
    const currentUser = req.user;
    const subuserId = req.params.id;

    // Check if user can manage subusers
    if (!currentUser.canManageSubusers()) {
      return res.status(403).json({ 
        message: 'You do not have permission to manage subusers' 
      });
    }

    // Find subuser
    const subuser = await User.findById(subuserId);
    if (!subuser || !subuser.isSubuser) {
      return res.status(404).json({ message: 'Subuser not found' });
    }

    // Check if subuser belongs to current user's company
    let parentUserId;
    if (currentUser.isSubuser) {
      parentUserId = currentUser.parentUserId;
    } else {
      parentUserId = currentUser._id;
    }

    if (subuser.parentUserId.toString() !== parentUserId.toString()) {
      return res.status(403).json({ 
        message: 'You can only manage subusers from your own company' 
      });
    }

    // Update subuser
    subuser.subuserRole = role;
    subuser.subuserPermissions = permissions;
    await subuser.save();

    res.json({
      message: 'Subuser role updated successfully',
      subuser: {
        id: subuser._id,
        userId: subuser.userId,
        firstName: subuser.firstName,
        lastName: subuser.lastName,
        email: subuser.email,
        role: subuser.subuserRole,
        permissions: subuser.subuserPermissions
      }
    });

  } catch (error) {
    console.error('Update subuser role error:', error);
    res.status(500).json({ message: 'Server error updating subuser role' });
  }
});

// @route   DELETE /api/subusers/:id
// @desc    Remove subuser from company/consultancy
// @access  Private (Employer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const subuserId = req.params.id;

    // Check if user can manage subusers
    if (!currentUser.canManageSubusers()) {
      return res.status(403).json({ 
        message: 'You do not have permission to manage subusers' 
      });
    }

    // Find subuser
    const subuser = await User.findById(subuserId);
    if (!subuser || !subuser.isSubuser) {
      return res.status(404).json({ message: 'Subuser not found' });
    }

    // Check if subuser belongs to current user's company
    let parentUserId;
    if (currentUser.isSubuser) {
      parentUserId = currentUser.parentUserId;
    } else {
      parentUserId = currentUser._id;
    }

    if (subuser.parentUserId.toString() !== parentUserId.toString()) {
      return res.status(403).json({ 
        message: 'You can only manage subusers from your own company' 
      });
    }

    // Deactivate subuser instead of deleting
    subuser.isActive = false;
    await subuser.save();

    // Update team member count
    await User.updateTeamMemberCount(parentUserId);

    res.json({ message: 'Subuser removed successfully' });

  } catch (error) {
    console.error('Remove subuser error:', error);
    res.status(500).json({ message: 'Server error removing subuser' });
  }
});

// @route   POST /api/subusers/accept-invitation
// @desc    Accept invitation and set password
// @access  Public
router.post('/accept-invitation', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find subuser by email
    const subuser = await User.findOne({ 
      email: email.toLowerCase(), 
      isSubuser: true,
      invitationAccepted: false
    });

    if (!subuser) {
      return res.status(404).json({ 
        message: 'No pending invitation found for this email' 
      });
    }

    // Update subuser
    subuser.password = password;
    subuser.invitationAccepted = true;
    subuser.invitationAcceptedAt = new Date();
    subuser.isEmailVerified = true;
    await subuser.save();

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: subuser._id }, 
      process.env.JWT_SECRET || 'fallback-secret', 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Invitation accepted successfully',
      token,
      user: {
        id: subuser._id,
        userId: subuser.userId,
        firstName: subuser.firstName,
        lastName: subuser.lastName,
        email: subuser.email,
        userType: subuser.userType,
        employerType: subuser.employerType,
        isSubuser: subuser.isSubuser,
        subuserRole: subuser.subuserRole,
        subuserPermissions: subuser.subuserPermissions,
        parentUserId: subuser.parentUserId
      }
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error accepting invitation' });
  }
});

module.exports = router;
