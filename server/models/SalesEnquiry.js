const mongoose = require('mongoose');

const salesEnquirySchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },

  // Company Information
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Other']
  },
  companySize: {
    type: String,
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },

  // Enquiry Details
  enquiryType: {
    type: String,
    required: true,
    enum: ['pricing', 'demo', 'custom-solution', 'partnership', 'support', 'other']
  },
  budget: {
    type: String,
    enum: ['under-1l', '1l-2l', '2l-5l', '5l-10l', '10l-25l', '25l+']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  hearAbout: {
    type: String,
    enum: ['google', 'social-media', 'referral', 'advertisement', 'event', 'other']
  },

  // System Fields
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Contact Information
  contactedAt: Date,
  lastContactedAt: Date,
  nextFollowUp: Date,

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for better query performance
salesEnquirySchema.index({ email: 1 });
salesEnquirySchema.index({ status: 1 });
salesEnquirySchema.index({ submittedAt: -1 });
salesEnquirySchema.index({ industry: 1 });
salesEnquirySchema.index({ companySize: 1 });

// Virtual for full name
salesEnquirySchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted phone
salesEnquirySchema.virtual('formattedPhone').get(function() {
  if (!this.phone) return '';
  const cleaned = this.phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return this.phone;
});

// Method to update status
salesEnquirySchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  if (newStatus === 'contacted') {
    this.contactedAt = new Date();
  }
  this.lastContactedAt = new Date();
  this.notes.push({
    note: `Status changed to ${newStatus}`,
    addedBy: userId,
    addedAt: new Date()
  });
  return this.save();
};

// Method to add note
salesEnquirySchema.methods.addNote = function(note, userId) {
  this.notes.push({
    note,
    addedBy: userId,
    addedAt: new Date()
  });
  return this.save();
};

// Static method to get enquiry statistics
salesEnquirySchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get enquiries by date range
salesEnquirySchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    submittedAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ submittedAt: -1 });
};

module.exports = mongoose.model('SalesEnquiry', salesEnquirySchema);
