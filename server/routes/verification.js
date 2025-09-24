const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { adminAuth } = require('../middleware/adminAuth');

// @route   GET /api/verification/pending
// @desc    Get all pending employer verifications
// @access  Private (Admin/Superadmin)
router.get('/pending', adminAuth, async (req, res) => {
    try {
        const pendingVerifications = await User.find({
            userType: 'employer',
            verificationStatus: 'pending'
        }).select('-password').sort({ 'verificationDetails.submittedAt': -1 });

        res.json({
            success: true,
            data: pendingVerifications,
            count: pendingVerifications.length
        });
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verifications',
            error: error.message
        });
    }
});

// @route   GET /api/verification/all
// @desc    Get all employer verifications (pending, verified, rejected)
// @access  Private (Admin/Superadmin)
router.get('/all', adminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        let query = { userType: 'employer' };
        if (status && ['pending', 'verified', 'rejected'].includes(status)) {
            query.verificationStatus = status;
        }

        const skip = (page - 1) * limit;
        
        const verifications = await User.find(query)
            .select('-password')
            .populate('verificationDetails.verifiedBy', 'firstName lastName email')
            .sort({ 'verificationDetails.submittedAt': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: verifications,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total: total
            }
        });
    } catch (error) {
        console.error('Error fetching verifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verifications',
            error: error.message
        });
    }
});

// @route   GET /api/verification/:id
// @desc    Get specific employer verification details
// @access  Private (Admin/Superadmin)
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const employer = await User.findById(req.params.id)
            .select('-password')
            .populate('verificationDetails.verifiedBy', 'firstName lastName email');

        if (!employer || employer.userType !== 'employer') {
            return res.status(404).json({
                success: false,
                message: 'Employer not found'
            });
        }

        res.json({
            success: true,
            data: employer
        });
    } catch (error) {
        console.error('Error fetching verification details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification details',
            error: error.message
        });
    }
});

// @route   PUT /api/verification/:id/verify
// @desc    Verify an employer
// @access  Private (Admin/Superadmin)
router.put('/:id/verify', adminAuth, async (req, res) => {
    try {
        const { notes } = req.body;
        
        const employer = await User.findById(req.params.id);
        
        if (!employer || employer.userType !== 'employer') {
            return res.status(404).json({
                success: false,
                message: 'Employer not found'
            });
        }

        if (employer.verificationStatus === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Employer is already verified'
            });
        }

        // Update verification status
        employer.isEmployerVerified = true;
        employer.verificationStatus = 'verified';
        employer.verificationDetails.verifiedAt = new Date();
        employer.verificationDetails.verifiedBy = req.user.id;
        if (notes) {
            employer.verificationDetails.notes = notes;
        }

        await employer.save();

        res.json({
            success: true,
            message: 'Employer verified successfully',
            data: {
                id: employer._id,
                name: employer.fullName,
                email: employer.email,
                companyName: employer.profile.company?.name,
                verifiedAt: employer.verificationDetails.verifiedAt
            }
        });
    } catch (error) {
        console.error('Error verifying employer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify employer',
            error: error.message
        });
    }
});

// @route   PUT /api/verification/:id/reject
// @desc    Reject an employer verification
// @access  Private (Admin/Superadmin)
router.put('/:id/reject', adminAuth, async (req, res) => {
    try {
        const { rejectionReason, notes } = req.body;
        
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }
        
        const employer = await User.findById(req.params.id);
        
        if (!employer || employer.userType !== 'employer') {
            return res.status(404).json({
                success: false,
                message: 'Employer not found'
            });
        }

        if (employer.verificationStatus === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Employer verification is already rejected'
            });
        }

        // Update verification status
        employer.isEmployerVerified = false;
        employer.verificationStatus = 'rejected';
        employer.verificationDetails.verifiedAt = new Date();
        employer.verificationDetails.verifiedBy = req.user.id;
        employer.verificationDetails.rejectionReason = rejectionReason;
        if (notes) {
            employer.verificationDetails.notes = notes;
        }

        await employer.save();

        res.json({
            success: true,
            message: 'Employer verification rejected',
            data: {
                id: employer._id,
                name: employer.fullName,
                email: employer.email,
                rejectionReason: rejectionReason,
                rejectedAt: employer.verificationDetails.verifiedAt
            }
        });
    } catch (error) {
        console.error('Error rejecting employer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject employer verification',
            error: error.message
        });
    }
});

// @route   PUT /api/verification/:id/resubmit
// @desc    Allow employer to resubmit verification (reset to pending)
// @access  Private (Admin/Superadmin)
router.put('/:id/resubmit', adminAuth, async (req, res) => {
    try {
        const employer = await User.findById(req.params.id);
        
        if (!employer || employer.userType !== 'employer') {
            return res.status(404).json({
                success: false,
                message: 'Employer not found'
            });
        }

        // Reset verification status
        employer.isEmployerVerified = false;
        employer.verificationStatus = 'pending';
        employer.verificationDetails.submittedAt = new Date();
        employer.verificationDetails.verifiedAt = null;
        employer.verificationDetails.verifiedBy = null;
        employer.verificationDetails.rejectionReason = null;

        await employer.save();

        res.json({
            success: true,
            message: 'Employer can now resubmit verification',
            data: {
                id: employer._id,
                name: employer.fullName,
                email: employer.email
            }
        });
    } catch (error) {
        console.error('Error resetting verification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset verification',
            error: error.message
        });
    }
});

// @route   GET /api/verification/stats
// @desc    Get verification statistics
// @access  Private (Admin/Superadmin)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $match: { userType: 'employer' } },
            {
                $group: {
                    _id: '$verificationStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            pending: 0,
            verified: 0,
            rejected: 0,
            total: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.json({
            success: true,
            data: formattedStats
        });
    } catch (error) {
        console.error('Error fetching verification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification statistics',
            error: error.message
        });
    }
});

module.exports = router;
