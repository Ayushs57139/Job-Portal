#!/usr/bin/env node

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ userType: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin user
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@jobwala.com',
      password: 'admin123456', // Change this in production
      userType: 'superadmin',
      phone: '+91-9999999999',
      isActive: true,
      isEmailVerified: true,
      adminPermissions: {
        canManageUsers: true,
        canManageJobs: true,
        canManageApplications: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canManageContent: true
      }
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Email: admin@jobwala.com');
    console.log('Password: admin123456');
    console.log('Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
