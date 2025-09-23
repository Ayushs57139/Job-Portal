const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register Job Seeker
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Job seeker already exists with this email' });
        }

        // Create new job seeker
        const jobSeeker = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        await jobSeeker.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: jobSeeker._id, 
                userType: 'jobseeker',
                email: jobSeeker.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Job seeker registered successfully',
            token,
            user: {
                id: jobSeeker._id,
                firstName: jobSeeker.firstName,
                lastName: jobSeeker.lastName,
                email: jobSeeker.email,
                userType: 'jobseeker'
            }
        });
    } catch (error) {
        console.error('Job seeker registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Job Seeker
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find job seeker
        const jobSeeker = await User.findOne({ email });
        if (!jobSeeker) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await jobSeeker.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        jobSeeker.lastLogin = new Date();
        await jobSeeker.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: jobSeeker._id, 
                userType: 'jobseeker',
                email: jobSeeker.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: jobSeeker._id,
                firstName: jobSeeker.firstName,
                lastName: jobSeeker.lastName,
                email: jobSeeker.email,
                userType: 'jobseeker'
            }
        });
    } catch (error) {
        console.error('Job seeker login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Job Seeker Profile
router.get('/me', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const jobSeeker = await User.findById(decoded.id).select('-password');
        
        if (!jobSeeker) {
            return res.status(404).json({ message: 'Job seeker not found' });
        }

        res.json(jobSeeker);
    } catch (error) {
        console.error('Get job seeker profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
