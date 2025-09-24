const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register Consultancy
router.post('/register', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone,
            consultancy
        } = req.body;

        // Check if consultancy already exists
        const existingConsultancy = await User.findOne({ email });
        if (existingConsultancy) {
            return res.status(400).json({ message: 'Consultancy already exists with this email' });
        }

        // Create new consultancy
        const newConsultancy = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: 'employer',
            employerType: 'consultancy',
            profile: {
                company: consultancy
            },
            verificationStatus: 'pending',
            isEmployerVerified: false
        });

        await newConsultancy.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newConsultancy._id, 
                userType: 'consultancy',
                email: newConsultancy.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Consultancy registered successfully',
            token,
            user: {
                id: newConsultancy._id,
                firstName: newConsultancy.firstName,
                lastName: newConsultancy.lastName,
                email: newConsultancy.email,
                userType: 'consultancy',
                consultancyName: newConsultancy.consultancy.name
            }
        });
    } catch (error) {
        console.error('Consultancy registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Consultancy
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find consultancy
        const consultancy = await User.findOne({ email });
        if (!consultancy) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await consultancy.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        consultancy.lastLogin = new Date();
        await consultancy.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: consultancy._id, 
                userType: 'consultancy',
                email: consultancy.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: consultancy._id,
                firstName: consultancy.firstName,
                lastName: consultancy.lastName,
                email: consultancy.email,
                userType: 'consultancy',
                consultancyName: consultancy.consultancy.name
            }
        });
    } catch (error) {
        console.error('Consultancy login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Consultancy Profile
router.get('/me', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const consultancy = await User.findById(decoded.id).select('-password');
        
        if (!consultancy) {
            return res.status(404).json({ message: 'Consultancy not found' });
        }

        res.json(consultancy);
    } catch (error) {
        console.error('Get consultancy profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
