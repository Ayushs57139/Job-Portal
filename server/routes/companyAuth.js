const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register Company
router.post('/register', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone,
            company
        } = req.body;

        // Check if company already exists
        const existingCompany = await User.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists with this email' });
        }

        // Create new company
        const newCompany = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: 'employer',
            employerType: 'company',
            profile: {
                company: company
            },
            verificationStatus: 'pending',
            isEmployerVerified: false
        });

        await newCompany.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newCompany._id, 
                userType: 'company',
                email: newCompany.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Company registered successfully',
            token,
            user: {
                id: newCompany._id,
                firstName: newCompany.firstName,
                lastName: newCompany.lastName,
                email: newCompany.email,
                userType: 'company',
                companyName: newCompany.company.name
            }
        });
    } catch (error) {
        console.error('Company registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Company
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find company
        const company = await User.findOne({ email });
        if (!company) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await company.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        company.lastLogin = new Date();
        await company.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: company._id, 
                userType: 'company',
                email: company.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: company._id,
                firstName: company.firstName,
                lastName: company.lastName,
                email: company.email,
                userType: 'company',
                companyName: company.company.name
            }
        });
    } catch (error) {
        console.error('Company login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Company Profile
router.get('/me', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const company = await User.findById(decoded.id).select('-password');
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company);
    } catch (error) {
        console.error('Get company profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
