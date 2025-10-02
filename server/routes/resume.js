const express = require('express');
const { upload, parseResumeWithAI } = require('../services/resumeParser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   POST /api/resume/parse
// @desc    Parse resume and extract user details
// @access  Public
router.post('/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No resume file uploaded' 
      });
    }

    console.log('Resume uploaded:', req.file.filename);
    
    // Parse the resume
    const parsedData = await parseResumeWithAI(req.file.path);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    console.log('Resume parsed successfully:', parsedData);
    
    res.json({
      success: true,
      data: parsedData,
      message: 'Resume parsed successfully'
    });
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse resume'
    });
  }
});

module.exports = router;
