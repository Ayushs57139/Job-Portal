const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to generate CSV content
const generateCSVContent = (data, headers) => {
  const csvContent = [];
  
  // Add headers
  csvContent.push(headers.map(h => h.id).join(','));
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header.id];
      
      // Handle nested objects
      if (header.id.includes('.')) {
        const keys = header.id.split('.');
        value = keys.reduce((obj, key) => obj && obj[key], item);
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }
      
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value || '';
    });
    csvContent.push(row.join(','));
  });
  
  return csvContent.join('\n');
};

// Helper function to parse CSV file
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Export Users to CSV
router.get('/export/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const headers = [
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'userType', title: 'User Type' },
      { id: 'employerType', title: 'Employer Type' },
      { id: 'profile.bio', title: 'Bio' },
      { id: 'profile.skills', title: 'Skills' },
      { id: 'profile.experience', title: 'Experience' },
      { id: 'profile.currentLocation', title: 'Current Location' },
      { id: 'profile.currentSalary', title: 'Current Salary' },
      { id: 'profile.expectedSalary', title: 'Expected Salary' },
      { id: 'isActive', title: 'Is Active' },
      { id: 'isEmailVerified', title: 'Email Verified' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'lastLogin', title: 'Last Login' }
    ];
    
    const csvContent = generateCSVContent(users, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Failed to export users', error: error.message });
  }
});

// Export Jobs to CSV
router.get('/export/jobs', adminAuth, async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('postedBy', 'firstName lastName email');
    
    const headers = [
      { id: 'title', title: 'Job Title' },
      { id: 'description', title: 'Description' },
      { id: 'company.name', title: 'Company Name' },
      { id: 'company.totalEmployees', title: 'Company Size' },
      { id: 'company.website', title: 'Company Website' },
      { id: 'jobPostType', title: 'Job Post Type' },
      { id: 'employmentType', title: 'Employment Type' },
      { id: 'jobModeType', title: 'Job Mode' },
      { id: 'jobShiftType', title: 'Job Shift' },
      { id: 'skills', title: 'Skills' },
      { id: 'location.state', title: 'State' },
      { id: 'location.city', title: 'City' },
      { id: 'location.locality', title: 'Locality' },
      { id: 'experienceType', title: 'Experience Type' },
      { id: 'totalExperience.min', title: 'Min Experience' },
      { id: 'totalExperience.max', title: 'Max Experience' },
      { id: 'salary.min', title: 'Min Salary' },
      { id: 'salary.max', title: 'Max Salary' },
      { id: 'salary.currency', title: 'Currency' },
      { id: 'numberOfVacancy', title: 'Number of Vacancies' },
      { id: 'hrContact.name', title: 'HR Contact Name' },
      { id: 'hrContact.number', title: 'HR Contact Number' },
      { id: 'hrContact.email', title: 'HR Contact Email' },
      { id: 'status', title: 'Status' },
      { id: 'featured', title: 'Featured' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(jobs, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export jobs error:', error);
    res.status(500).json({ message: 'Failed to export jobs', error: error.message });
  }
});

// Export Applications to CSV
router.get('/export/applications', adminAuth, async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('user', 'firstName lastName email')
      .populate('job', 'title company');
    
    const headers = [
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'mobileNumber', title: 'Mobile Number' },
      { id: 'whatsappNumber', title: 'WhatsApp Number' },
      { id: 'gender', title: 'Gender' },
      { id: 'maritalStatus', title: 'Marital Status' },
      { id: 'dateOfBirth', title: 'Date of Birth' },
      { id: 'currentJobTitle', title: 'Current Job Title' },
      { id: 'currentCompanyName', title: 'Current Company' },
      { id: 'currentSalary', title: 'Current Salary' },
      { id: 'expectedSalary', title: 'Expected Salary' },
      { id: 'jobType', title: 'Job Type' },
      { id: 'jobStatus', title: 'Job Status' },
      { id: 'totalExperience', title: 'Total Experience' },
      { id: 'noticePeriod', title: 'Notice Period' },
      { id: 'education', title: 'Education' },
      { id: 'course', title: 'Course' },
      { id: 'skills', title: 'Skills' },
      { id: 'currentState', title: 'Current State' },
      { id: 'currentCity', title: 'Current City' },
      { id: 'currentLocality', title: 'Current Locality' },
      { id: 'preferredLanguage', title: 'Preferred Language' },
      { id: 'englishFluency', title: 'English Fluency' },
      { id: 'companyType', title: 'Company Type' },
      { id: 'jobIndustry', title: 'Job Industry' },
      { id: 'department', title: 'Department' },
      { id: 'jobRole', title: 'Job Role' },
      { id: 'assetRequirements', title: 'Asset Requirements' },
      { id: 'resumeUrl', title: 'Resume URL' },
      { id: 'coverLetter', title: 'Cover Letter' },
      { id: 'status', title: 'Status' },
      { id: 'appliedAt', title: 'Applied At' }
    ];
    
    const csvContent = generateCSVContent(applications, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({ message: 'Failed to export applications', error: error.message });
  }
});

// Export Blogs to CSV
router.get('/export/blogs', adminAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({});
    
    const headers = [
      { id: 'title', title: 'Title' },
      { id: 'excerpt', title: 'Excerpt' },
      { id: 'content', title: 'Content' },
      { id: 'category', title: 'Category' },
      { id: 'author', title: 'Author' },
      { id: 'image', title: 'Image' },
      { id: 'imageUrl', title: 'Image URL' },
      { id: 'readTime', title: 'Read Time' },
      { id: 'tags', title: 'Tags' },
      { id: 'featured', title: 'Featured' },
      { id: 'published', title: 'Published' },
      { id: 'publishedAt', title: 'Published At' },
      { id: 'views', title: 'Views' },
      { id: 'likes', title: 'Likes' },
      { id: 'seoTitle', title: 'SEO Title' },
      { id: 'seoDescription', title: 'SEO Description' },
      { id: 'slug', title: 'Slug' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(blogs, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=blogs_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export blogs error:', error);
    res.status(500).json({ message: 'Failed to export blogs', error: error.message });
  }
});

// Generate Sample CSV Files
router.get('/sample/users', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543210',
        userType: 'jobseeker',
        employerType: '',
        'profile.bio': 'Experienced software developer with 5 years of experience',
        'profile.skills': 'JavaScript; React; Node.js; MongoDB',
        'profile.experience': 5,
        'profile.currentLocation': 'Mumbai, Maharashtra',
        'profile.currentSalary': 800000,
        'profile.expectedSalary': 1200000,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+91-9876543211',
        userType: 'employer',
        employerType: 'company',
        'profile.bio': 'HR Manager at Tech Solutions Inc',
        'profile.skills': 'Recruitment; HR Management; Team Building',
        'profile.experience': 8,
        'profile.currentLocation': 'Bangalore, Karnataka',
        'profile.currentSalary': 1500000,
        'profile.expectedSalary': 1800000,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2024-01-10',
        lastLogin: '2024-01-21'
      }
    ];
    
    const headers = [
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'userType', title: 'User Type' },
      { id: 'employerType', title: 'Employer Type' },
      { id: 'profile.bio', title: 'Bio' },
      { id: 'profile.skills', title: 'Skills' },
      { id: 'profile.experience', title: 'Experience' },
      { id: 'profile.currentLocation', title: 'Current Location' },
      { id: 'profile.currentSalary', title: 'Current Salary' },
      { id: 'profile.expectedSalary', title: 'Expected Salary' },
      { id: 'isActive', title: 'Is Active' },
      { id: 'isEmailVerified', title: 'Email Verified' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'lastLogin', title: 'Last Login' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_users.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample users error:', error);
    res.status(500).json({ message: 'Failed to generate sample users CSV', error: error.message });
  }
});

router.get('/sample/jobs', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        title: 'Senior Software Developer',
        description: 'We are looking for an experienced software developer to join our team',
        'company.name': 'Tech Solutions Inc',
        'company.totalEmployees': '201-500',
        'company.website': 'https://techsolutions.com',
        jobPostType: 'Java',
        employmentType: 'Permanent',
        jobModeType: 'Work From Office',
        jobShiftType: 'Day Shift',
        skills: 'Java; Spring Boot; MySQL; REST APIs',
        'location.state': 'Karnataka',
        'location.city': 'Bangalore',
        'location.locality': 'Electronic City',
        experienceType: 'Experienced',
        'totalExperience.min': '3 Years',
        'totalExperience.max': '7 Years',
        'salary.min': 800000,
        'salary.max': 1500000,
        'salary.currency': 'INR',
        numberOfVacancy: 3,
        'hrContact.name': 'Sarah Johnson',
        'hrContact.number': '+91-9876543212',
        'hrContact.email': 'hr@techsolutions.com',
        status: 'active',
        featured: true,
        createdAt: '2024-01-15'
      }
    ];
    
    const headers = [
      { id: 'title', title: 'Job Title' },
      { id: 'description', title: 'Description' },
      { id: 'company.name', title: 'Company Name' },
      { id: 'company.totalEmployees', title: 'Company Size' },
      { id: 'company.website', title: 'Company Website' },
      { id: 'jobPostType', title: 'Job Post Type' },
      { id: 'employmentType', title: 'Employment Type' },
      { id: 'jobModeType', title: 'Job Mode' },
      { id: 'jobShiftType', title: 'Job Shift' },
      { id: 'skills', title: 'Skills' },
      { id: 'location.state', title: 'State' },
      { id: 'location.city', title: 'City' },
      { id: 'location.locality', title: 'Locality' },
      { id: 'experienceType', title: 'Experience Type' },
      { id: 'totalExperience.min', title: 'Min Experience' },
      { id: 'totalExperience.max', title: 'Max Experience' },
      { id: 'salary.min', title: 'Min Salary' },
      { id: 'salary.max', title: 'Max Salary' },
      { id: 'salary.currency', title: 'Currency' },
      { id: 'numberOfVacancy', title: 'Number of Vacancies' },
      { id: 'hrContact.name', title: 'HR Contact Name' },
      { id: 'hrContact.number', title: 'HR Contact Number' },
      { id: 'hrContact.email', title: 'HR Contact Email' },
      { id: 'status', title: 'Status' },
      { id: 'featured', title: 'Featured' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_jobs.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample jobs error:', error);
    res.status(500).json({ message: 'Failed to generate sample jobs CSV', error: error.message });
  }
});

router.get('/sample/applications', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        mobileNumber: '+91-9876543210',
        whatsappNumber: '+91-9876543210',
        gender: 'Male',
        maritalStatus: 'Single',
        dateOfBirth: '1990-05-15',
        currentJobTitle: 'Software Developer',
        currentCompanyName: 'ABC Tech',
        currentSalary: 600000,
        expectedSalary: 800000,
        jobType: 'Permanent',
        jobStatus: 'Working',
        totalExperience: '3 Years',
        noticePeriod: '30 Days',
        education: 'Graduate',
        course: 'Computer Science',
        skills: 'JavaScript; React; Node.js; MongoDB',
        currentState: 'Maharashtra',
        currentCity: 'Mumbai',
        currentLocality: 'Andheri',
        preferredLanguage: 'English',
        englishFluency: 'Fluent English',
        companyType: 'Startup',
        jobIndustry: 'Information Technology',
        department: 'Engineering',
        jobRole: 'Software Developer',
        assetRequirements: 'Laptop; Android Smart Phone',
        resumeUrl: 'https://example.com/resume.pdf',
        coverLetter: 'I am very interested in this position and would like to contribute to your team',
        status: 'applied',
        appliedAt: '2024-01-20'
      }
    ];
    
    const headers = [
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'mobileNumber', title: 'Mobile Number' },
      { id: 'whatsappNumber', title: 'WhatsApp Number' },
      { id: 'gender', title: 'Gender' },
      { id: 'maritalStatus', title: 'Marital Status' },
      { id: 'dateOfBirth', title: 'Date of Birth' },
      { id: 'currentJobTitle', title: 'Current Job Title' },
      { id: 'currentCompanyName', title: 'Current Company' },
      { id: 'currentSalary', title: 'Current Salary' },
      { id: 'expectedSalary', title: 'Expected Salary' },
      { id: 'jobType', title: 'Job Type' },
      { id: 'jobStatus', title: 'Job Status' },
      { id: 'totalExperience', title: 'Total Experience' },
      { id: 'noticePeriod', title: 'Notice Period' },
      { id: 'education', title: 'Education' },
      { id: 'course', title: 'Course' },
      { id: 'skills', title: 'Skills' },
      { id: 'currentState', title: 'Current State' },
      { id: 'currentCity', title: 'Current City' },
      { id: 'currentLocality', title: 'Current Locality' },
      { id: 'preferredLanguage', title: 'Preferred Language' },
      { id: 'englishFluency', title: 'English Fluency' },
      { id: 'companyType', title: 'Company Type' },
      { id: 'jobIndustry', title: 'Job Industry' },
      { id: 'department', title: 'Department' },
      { id: 'jobRole', title: 'Job Role' },
      { id: 'assetRequirements', title: 'Asset Requirements' },
      { id: 'resumeUrl', title: 'Resume URL' },
      { id: 'coverLetter', title: 'Cover Letter' },
      { id: 'status', title: 'Status' },
      { id: 'appliedAt', title: 'Applied At' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_applications.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample applications error:', error);
    res.status(500).json({ message: 'Failed to generate sample applications CSV', error: error.message });
  }
});

router.get('/sample/blogs', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        title: '10 Tips for Successful Job Interviews',
        excerpt: 'Learn the essential tips to ace your next job interview and land your dream job',
        content: 'Job interviews can be nerve-wracking, but with the right preparation, you can increase your chances of success...',
        category: 'Interview Prep',
        author: 'Admin',
        image: '💼',
        imageUrl: 'https://example.com/interview-tips.jpg',
        readTime: '5 min read',
        tags: 'interview; tips; career; job search',
        featured: true,
        published: true,
        publishedAt: '2024-01-15',
        views: 150,
        likes: 25,
        seoTitle: '10 Essential Job Interview Tips for Success',
        seoDescription: 'Master your job interviews with these proven tips and techniques',
        slug: '10-tips-successful-job-interviews',
        createdAt: '2024-01-15'
      }
    ];
    
    const headers = [
      { id: 'title', title: 'Title' },
      { id: 'excerpt', title: 'Excerpt' },
      { id: 'content', title: 'Content' },
      { id: 'category', title: 'Category' },
      { id: 'author', title: 'Author' },
      { id: 'image', title: 'Image' },
      { id: 'imageUrl', title: 'Image URL' },
      { id: 'readTime', title: 'Read Time' },
      { id: 'tags', title: 'Tags' },
      { id: 'featured', title: 'Featured' },
      { id: 'published', title: 'Published' },
      { id: 'publishedAt', title: 'Published At' },
      { id: 'views', title: 'Views' },
      { id: 'likes', title: 'Likes' },
      { id: 'seoTitle', title: 'SEO Title' },
      { id: 'seoDescription', title: 'SEO Description' },
      { id: 'slug', title: 'Slug' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_blogs.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample blogs error:', error);
    res.status(500).json({ message: 'Failed to generate sample blogs CSV', error: error.message });
  }
});

// Bulk Import Users
router.post('/import/users', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: User with email ${row.email} already exists`);
          continue;
        }

        // Create new user
        const userData = {
          firstName: row.firstName || row['First Name'],
          lastName: row.lastName || row['Last Name'],
          email: row.email || row['Email'],
          phone: row.phone || row['Phone'],
          userType: row.userType || row['User Type'] || 'jobseeker',
          employerType: row.employerType || row['Employer Type'],
          password: 'defaultPassword123', // Default password, should be changed
          isActive: row.isActive !== undefined ? row.isActive === 'true' : true,
          isEmailVerified: row.isEmailVerified !== undefined ? row.isEmailVerified === 'true' : false
        };

        // Handle profile data
        if (row['profile.bio'] || row['Bio']) {
          userData.profile = {
            bio: row['profile.bio'] || row['Bio'],
            skills: (row['profile.skills'] || row['Skills'] || '').split(';').map(s => s.trim()).filter(s => s),
            experience: parseInt(row['profile.experience'] || row['Experience']) || 0,
            currentLocation: row['profile.currentLocation'] || row['Current Location'],
            currentSalary: parseInt(row['profile.currentSalary'] || row['Current Salary']) || 0,
            expectedSalary: parseInt(row['profile.expectedSalary'] || row['Expected Salary']) || 0
          };
        }

        const user = new User(userData);
        await user.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({ message: 'Failed to import users', error: error.message });
  }
});

// Bulk Import Jobs
router.post('/import/jobs', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Get the admin user who is importing (you might want to get this from the token)
        const adminUser = await User.findOne({ userType: 'admin' }).limit(1);
        if (!adminUser) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: No admin user found to assign as job poster`);
          continue;
        }

        // Create job data
        const jobData = {
          title: row.title || row['Job Title'],
          description: row.description || row['Description'],
          company: {
            name: row['company.name'] || row['Company Name'],
            totalEmployees: row['company.totalEmployees'] || row['Company Size'],
            website: row['company.website'] || row['Company Website']
          },
          jobPostType: row.jobPostType || row['Job Post Type'],
          employmentType: row.employmentType || row['Employment Type'],
          jobModeType: row.jobModeType || row['Job Mode'],
          jobShiftType: row.jobShiftType || row['Job Shift'],
          skills: (row.skills || row['Skills'] || '').split(';').map(s => s.trim()).filter(s => s),
          location: {
            state: row['location.state'] || row['State'],
            city: row['location.city'] || row['City'],
            locality: row['location.locality'] || row['Locality']
          },
          experienceType: row.experienceType || row['Experience Type'],
          totalExperience: {
            min: row['totalExperience.min'] || row['Min Experience'],
            max: row['totalExperience.max'] || row['Max Experience']
          },
          salary: {
            min: parseInt(row['salary.min'] || row['Min Salary']),
            max: parseInt(row['salary.max'] || row['Max Salary']),
            currency: row['salary.currency'] || row['Currency'] || 'INR'
          },
          numberOfVacancy: parseInt(row.numberOfVacancy || row['Number of Vacancies']),
          hrContact: {
            name: row['hrContact.name'] || row['HR Contact Name'],
            number: row['hrContact.number'] || row['HR Contact Number'],
            email: row['hrContact.email'] || row['HR Contact Email']
          },
          status: row.status || row['Status'] || 'active',
          featured: row.featured === 'true' || row['Featured'] === 'true',
          postedBy: adminUser._id
        };

        const job = new Job(jobData);
        await job.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import jobs error:', error);
    res.status(500).json({ message: 'Failed to import jobs', error: error.message });
  }
});

// Bulk Import Applications
router.post('/import/applications', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Find user by email
        const user = await User.findOne({ email: row.email || row['Email'] });
        if (!user) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: User with email ${row.email || row['Email']} not found`);
          continue;
        }

        // Find job by title (you might want to make this more specific)
        const job = await Job.findOne({ title: row.jobTitle || row['Job Title'] });
        if (!job) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Job with title ${row.jobTitle || row['Job Title']} not found`);
          continue;
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({ user: user._id, job: job._id });
        if (existingApplication) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Application already exists for this user and job`);
          continue;
        }

        // Create application data
        const applicationData = {
          user: user._id,
          job: job._id,
          fullName: row.fullName || row['Full Name'],
          email: row.email || row['Email'],
          mobileNumber: row.mobileNumber || row['Mobile Number'],
          whatsappNumber: row.whatsappNumber || row['WhatsApp Number'],
          gender: row.gender || row['Gender'],
          maritalStatus: row.maritalStatus || row['Marital Status'],
          dateOfBirth: new Date(row.dateOfBirth || row['Date of Birth']),
          currentJobTitle: row.currentJobTitle || row['Current Job Title'],
          currentCompanyName: row.currentCompanyName || row['Current Company'],
          currentSalary: parseInt(row.currentSalary || row['Current Salary']) || 0,
          expectedSalary: parseInt(row.expectedSalary || row['Expected Salary']),
          jobType: row.jobType || row['Job Type'],
          jobStatus: row.jobStatus || row['Job Status'],
          totalExperience: row.totalExperience || row['Total Experience'],
          noticePeriod: row.noticePeriod || row['Notice Period'],
          education: row.education || row['Education'],
          course: row.course || row['Course'],
          skills: row.skills || row['Skills'],
          currentState: row.currentState || row['Current State'],
          currentCity: row.currentCity || row['Current City'],
          currentLocality: row.currentLocality || row['Current Locality'],
          preferredLanguage: row.preferredLanguage || row['Preferred Language'],
          englishFluency: row.englishFluency || row['English Fluency'],
          companyType: row.companyType || row['Company Type'],
          jobIndustry: row.jobIndustry || row['Job Industry'],
          department: row.department || row['Department'],
          jobRole: row.jobRole || row['Job Role'],
          assetRequirements: (row.assetRequirements || row['Asset Requirements'] || '').split(';').map(s => s.trim()).filter(s => s),
          resumeUrl: row.resumeUrl || row['Resume URL'],
          coverLetter: row.coverLetter || row['Cover Letter'],
          status: row.status || row['Status'] || 'applied',
          appliedAt: new Date(row.appliedAt || row['Applied At'] || Date.now())
        };

        const application = new Application(applicationData);
        await application.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import applications error:', error);
    res.status(500).json({ message: 'Failed to import applications', error: error.message });
  }
});

// Bulk Import Blogs
router.post('/import/blogs', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Check if blog with same title already exists
        const existingBlog = await Blog.findOne({ title: row.title || row['Title'] });
        if (existingBlog) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Blog with title "${row.title || row['Title']}" already exists`);
          continue;
        }

        // Create blog data
        const blogData = {
          title: row.title || row['Title'],
          excerpt: row.excerpt || row['Excerpt'],
          content: row.content || row['Content'],
          category: row.category || row['Category'],
          author: row.author || row['Author'] || 'Admin',
          image: row.image || row['Image'] || '📚',
          imageUrl: row.imageUrl || row['Image URL'],
          readTime: row.readTime || row['Read Time'] || '5 min read',
          tags: (row.tags || row['Tags'] || '').split(';').map(s => s.trim()).filter(s => s),
          featured: row.featured === 'true' || row['Featured'] === 'true',
          published: row.published !== undefined ? row.published === 'true' : true,
          publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
          views: parseInt(row.views || row['Views']) || 0,
          likes: parseInt(row.likes || row['Likes']) || 0,
          seoTitle: row.seoTitle || row['SEO Title'],
          seoDescription: row.seoDescription || row['SEO Description']
        };

        const blog = new Blog(blogData);
        await blog.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import blogs error:', error);
    res.status(500).json({ message: 'Failed to import blogs', error: error.message });
  }
});

module.exports = router;
