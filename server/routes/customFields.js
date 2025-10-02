const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CustomField = require('../models/CustomField');
const { auth } = require('../middleware/auth');

// @route   GET /api/custom-fields
// @desc    Get all custom fields with optional filtering
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { section, status, fieldType, page = 1, limit = 50, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (section) {
      filter['placement.section'] = section;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (fieldType) {
      filter.fieldType = fieldType;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } },
        { fieldId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Check if user is admin
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const fields = await CustomField.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ 'placement.section': 1, 'placement.order': 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await CustomField.countDocuments(filter);
    
    res.json({
      success: true,
      fields,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/custom-fields/sections
// @desc    Get available sections for custom fields
// @access  Private (Admin only)
router.get('/sections', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const sections = [
      { value: 'job_posting', label: 'Job Posting Form' },
      { value: 'user_registration', label: 'User Registration' },
      { value: 'company_profile', label: 'Company Profile' },
      { value: 'consultancy_profile', label: 'Consultancy Profile' },
      { value: 'jobseeker_profile', label: 'Job Seeker Profile' },
      { value: 'application_form', label: 'Application Form' },
      { value: 'admin_panel', label: 'Admin Panel' }
    ];
    
    res.json({ success: true, sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/custom-fields/field-types
// @desc    Get available field types
// @access  Private (Admin only)
router.get('/field-types', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const fieldTypes = [
      { value: 'text', label: 'Text Input' },
      { value: 'email', label: 'Email' },
      { value: 'tel', label: 'Phone Number' },
      { value: 'number', label: 'Number' },
      { value: 'textarea', label: 'Text Area' },
      { value: 'select', label: 'Dropdown Select' },
      { value: 'multiselect', label: 'Multi Select' },
      { value: 'radio', label: 'Radio Buttons' },
      { value: 'checkbox', label: 'Checkbox' },
      { value: 'date', label: 'Date' },
      { value: 'time', label: 'Time' },
      { value: 'datetime', label: 'Date & Time' },
      { value: 'file', label: 'File Upload' },
      { value: 'url', label: 'URL' },
      { value: 'password', label: 'Password' }
    ];
    
    res.json({ success: true, fieldTypes });
  } catch (error) {
    console.error('Error fetching field types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/custom-fields/:id
// @desc    Get single custom field
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const field = await CustomField.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
    
    if (!field) {
      return res.status(404).json({ message: 'Custom field not found' });
    }
    
    res.json({ success: true, field });
  } catch (error) {
    console.error('Error fetching custom field:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/custom-fields
// @desc    Create new custom field
// @access  Private (Admin only)
router.post('/', [
  auth,
  body('fieldId').notEmpty().withMessage('Field ID is required'),
  body('name').notEmpty().withMessage('Field name is required'),
  body('label').notEmpty().withMessage('Field label is required'),
  body('fieldType').isIn([
    'text', 'email', 'tel', 'number', 'textarea', 'select', 'multiselect', 
    'radio', 'checkbox', 'date', 'time', 'datetime', 'file', 'url', 'password'
  ]).withMessage('Invalid field type'),
  body('placement.section').isIn([
    'job_posting', 'user_registration', 'company_profile', 'consultancy_profile',
    'jobseeker_profile', 'application_form', 'admin_panel'
  ]).withMessage('Invalid section')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const {
      fieldId,
      name,
      label,
      description,
      fieldType,
      validation,
      options,
      placement,
      conditions,
      styling,
      status = 'active'
    } = req.body;
    
    // Check if field ID already exists
    const existingField = await CustomField.findOne({ fieldId });
    if (existingField) {
      return res.status(400).json({ message: 'Field ID already exists' });
    }
    
    const customField = new CustomField({
      fieldId,
      name,
      label,
      description,
      fieldType,
      validation: validation || {},
      options: options || [],
      placement: placement || {},
      conditions: conditions || {},
      styling: styling || {},
      status,
      createdBy: req.user.id
    });
    
    await customField.save();
    
    res.status(201).json({
      success: true,
      message: 'Custom field created successfully',
      field: customField
    });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/custom-fields/:id
// @desc    Update custom field
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Field name cannot be empty'),
  body('label').optional().notEmpty().withMessage('Field label cannot be empty'),
  body('fieldType').optional().isIn([
    'text', 'email', 'tel', 'number', 'textarea', 'select', 'multiselect', 
    'radio', 'checkbox', 'date', 'time', 'datetime', 'file', 'url', 'password'
  ]).withMessage('Invalid field type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const field = await CustomField.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Custom field not found' });
    }
    
    // Check if field can be edited
    if (!field.permissions.canEdit) {
      return res.status(403).json({ message: 'This field cannot be edited' });
    }
    
    const updateData = { ...req.body };
    updateData.lastModifiedBy = req.user.id;
    
    const updatedField = await CustomField.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Custom field updated successfully',
      field: updatedField
    });
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/custom-fields/:id
// @desc    Delete custom field
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const field = await CustomField.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Custom field not found' });
    }
    
    // Check if field can be deleted
    if (!field.permissions.canDelete || field.permissions.isSystemField) {
      return res.status(403).json({ message: 'This field cannot be deleted' });
    }
    
    await CustomField.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Custom field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/custom-fields/:id/duplicate
// @desc    Duplicate custom field
// @access  Private (Admin only)
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const originalField = await CustomField.findById(req.params.id);
    if (!originalField) {
      return res.status(404).json({ message: 'Custom field not found' });
    }
    
    const duplicatedField = new CustomField({
      ...originalField.toObject(),
      _id: undefined,
      fieldId: `${originalField.fieldId}_copy_${Date.now()}`,
      name: `${originalField.name} (Copy)`,
      label: `${originalField.label} (Copy)`,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id,
      createdAt: undefined,
      updatedAt: undefined
    });
    
    await duplicatedField.save();
    
    res.status(201).json({
      success: true,
      message: 'Custom field duplicated successfully',
      field: duplicatedField
    });
  } catch (error) {
    console.error('Error duplicating custom field:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/custom-fields/section/:section
// @desc    Get custom fields for a specific section (public endpoint for forms)
// @access  Public
router.get('/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    
    const fields = await CustomField.find({
      'placement.section': section,
      status: 'active',
      'placement.isVisible': true
    })
    .sort({ 'placement.order': 1, createdAt: 1 });
    
    res.json({
      success: true,
      fields: fields.map(field => field.fieldConfig)
    });
  } catch (error) {
    console.error('Error fetching section fields:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
