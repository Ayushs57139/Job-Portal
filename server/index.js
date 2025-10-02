const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the web directory
app.use(express.static('../web'));

// Logging
app.use(morgan('combined'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobseeker', require('./routes/jobseekerAuth'));
app.use('/api/consultancy', require('./routes/consultancyAuth'));
app.use('/api/company', require('./routes/companyAuth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/employers', require('./routes/employers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bulk', require('./routes/bulkImportExport'));
app.use('/api/sales-enquiry', require('./routes/salesEnquiry'));
app.use('/api/verification', require('./routes/verification')); // Employer verification routes
app.use('/api/subusers', require('./routes/subusers')); // Subuser management routes
app.use('/api/custom-fields', require('./routes/customFields')); // Custom fields management routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
