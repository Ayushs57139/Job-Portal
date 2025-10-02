const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  // Field identification
  fieldId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Field metadata
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  label: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Field configuration
  fieldType: {
    type: String,
    required: true,
    enum: [
      'text',
      'email',
      'tel',
      'number',
      'textarea',
      'select',
      'multiselect',
      'radio',
      'checkbox',
      'date',
      'time',
      'datetime',
      'file',
      'url',
      'password'
    ]
  },
  
  // Field validation rules
  validation: {
    required: {
      type: Boolean,
      default: false
    },
    minLength: {
      type: Number,
      default: null
    },
    maxLength: {
      type: Number,
      default: null
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    pattern: {
      type: String,
      default: null
    },
    customValidation: {
      type: String,
      default: null
    }
  },
  
  // Options for select, radio, checkbox fields
  options: [{
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Field placement and styling
  placement: {
    section: {
      type: String,
      required: true,
      enum: [
        'job_posting',
        'user_registration',
        'company_profile',
        'consultancy_profile',
        'jobseeker_profile',
        'application_form',
        'admin_panel'
      ]
    },
    order: {
      type: Number,
      default: 0
    },
    group: {
      type: String,
      default: 'general'
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  
  // Conditional logic
  conditions: {
    dependsOn: {
      type: String,
      default: null
    },
    showWhen: {
      type: String,
      default: null
    },
    hideWhen: {
      type: String,
      default: null
    }
  },
  
  // Field styling and appearance
  styling: {
    width: {
      type: String,
      default: '100%'
    },
    cssClass: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    }
  },
  
  // Status and permissions
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  
  // Permissions
  permissions: {
    canEdit: {
      type: Boolean,
      default: true
    },
    canDelete: {
      type: Boolean,
      default: true
    },
    isSystemField: {
      type: Boolean,
      default: false
    }
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Usage statistics
  usage: {
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
customFieldSchema.index({ fieldId: 1 });
customFieldSchema.index({ 'placement.section': 1, 'placement.order': 1 });
customFieldSchema.index({ status: 1 });
customFieldSchema.index({ createdBy: 1 });

// Virtual for formatted field configuration
customFieldSchema.virtual('fieldConfig').get(function() {
  return {
    id: this.fieldId,
    name: this.name,
    label: this.label,
    type: this.fieldType,
    required: this.validation.required,
    placeholder: this.styling.placeholder,
    helpText: this.styling.helpText,
    options: this.options,
    validation: this.validation,
    styling: this.styling,
    conditions: this.conditions
  };
});

// Method to get field HTML attributes
customFieldSchema.methods.getHtmlAttributes = function() {
  const attrs = {
    id: this.fieldId,
    name: this.name,
    type: this.fieldType,
    placeholder: this.styling.placeholder,
    class: this.styling.cssClass,
    style: `width: ${this.styling.width}`
  };
  
  if (this.validation.required) {
    attrs.required = true;
  }
  
  if (this.validation.minLength) {
    attrs.minlength = this.validation.minLength;
  }
  
  if (this.validation.maxLength) {
    attrs.maxlength = this.validation.maxLength;
  }
  
  if (this.validation.min) {
    attrs.min = this.validation.min;
  }
  
  if (this.validation.max) {
    attrs.max = this.validation.max;
  }
  
  if (this.validation.pattern) {
    attrs.pattern = this.validation.pattern;
  }
  
  return attrs;
};

// Method to validate field value
customFieldSchema.methods.validateValue = function(value) {
  const errors = [];
  
  if (this.validation.required && (!value || value.toString().trim() === '')) {
    errors.push(`${this.label} is required`);
  }
  
  if (value && this.validation.minLength && value.length < this.validation.minLength) {
    errors.push(`${this.label} must be at least ${this.validation.minLength} characters`);
  }
  
  if (value && this.validation.maxLength && value.length > this.validation.maxLength) {
    errors.push(`${this.label} must be no more than ${this.validation.maxLength} characters`);
  }
  
  if (value && this.validation.min && parseFloat(value) < this.validation.min) {
    errors.push(`${this.label} must be at least ${this.validation.min}`);
  }
  
  if (value && this.validation.max && parseFloat(value) > this.validation.max) {
    errors.push(`${this.label} must be no more than ${this.validation.max}`);
  }
  
  if (value && this.validation.pattern && !new RegExp(this.validation.pattern).test(value)) {
    errors.push(`${this.label} format is invalid`);
  }
  
  return errors;
};

module.exports = mongoose.model('CustomField', customFieldSchema);
