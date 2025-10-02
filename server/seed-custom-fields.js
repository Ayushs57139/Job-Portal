const mongoose = require('mongoose');
const CustomField = require('./models/CustomField');
require('dotenv').config();

// Sample custom fields data
const sampleFields = [
    {
        fieldId: 'company_size',
        name: 'company_size',
        label: 'Company Size',
        description: 'Number of employees in the company',
        fieldType: 'select',
        validation: {
            required: true
        },
        options: [
            { value: '1-10', label: '1-10 employees', isDefault: false, order: 0 },
            { value: '11-50', label: '11-50 employees', isDefault: false, order: 1 },
            { value: '51-200', label: '51-200 employees', isDefault: false, order: 2 },
            { value: '201-500', label: '201-500 employees', isDefault: false, order: 3 },
            { value: '500+', label: '500+ employees', isDefault: false, order: 4 }
        ],
        placement: {
            section: 'job_posting',
            order: 1,
            group: 'company_info',
            isVisible: true
        },
        styling: {
            placeholder: 'Select company size',
            cssClass: 'form-control',
            width: '100%',
            helpText: 'Choose the size of your company'
        },
        status: 'active',
        permissions: {
            canEdit: true,
            canDelete: true,
            isSystemField: false
        }
    },
    {
        fieldId: 'work_experience_required',
        name: 'work_experience_required',
        label: 'Work Experience Required',
        description: 'Minimum years of experience required for this position',
        fieldType: 'select',
        validation: {
            required: true
        },
        options: [
            { value: '0-1', label: '0-1 years', isDefault: false, order: 0 },
            { value: '1-3', label: '1-3 years', isDefault: false, order: 1 },
            { value: '3-5', label: '3-5 years', isDefault: false, order: 2 },
            { value: '5-10', label: '5-10 years', isDefault: false, order: 3 },
            { value: '10+', label: '10+ years', isDefault: false, order: 4 }
        ],
        placement: {
            section: 'job_posting',
            order: 2,
            group: 'job_requirements',
            isVisible: true
        },
        styling: {
            placeholder: 'Select experience level',
            cssClass: 'form-control',
            width: '100%',
            helpText: 'Choose the minimum experience required'
        },
        status: 'active',
        permissions: {
            canEdit: true,
            canDelete: true,
            isSystemField: false
        }
    },
    {
        fieldId: 'remote_work_option',
        name: 'remote_work_option',
        label: 'Remote Work Option',
        description: 'Whether this position allows remote work',
        fieldType: 'radio',
        validation: {
            required: true
        },
        options: [
            { value: 'yes', label: 'Yes, fully remote', isDefault: false, order: 0 },
            { value: 'hybrid', label: 'Hybrid (part remote, part office)', isDefault: false, order: 1 },
            { value: 'no', label: 'No, office only', isDefault: false, order: 2 }
        ],
        placement: {
            section: 'job_posting',
            order: 3,
            group: 'job_details',
            isVisible: true
        },
        styling: {
            cssClass: 'form-control',
            width: '100%',
            helpText: 'Specify if this position allows remote work'
        },
        status: 'active',
        permissions: {
            canEdit: true,
            canDelete: true,
            isSystemField: false
        }
    },
    {
        fieldId: 'benefits_offered',
        name: 'benefits_offered',
        label: 'Benefits Offered',
        description: 'Select all benefits offered with this position',
        fieldType: 'checkbox',
        validation: {
            required: false
        },
        options: [
            { value: 'health_insurance', label: 'Health Insurance', isDefault: false, order: 0 },
            { value: 'dental_insurance', label: 'Dental Insurance', isDefault: false, order: 1 },
            { value: 'vision_insurance', label: 'Vision Insurance', isDefault: false, order: 2 },
            { value: 'retirement_plan', label: 'Retirement Plan', isDefault: false, order: 3 },
            { value: 'paid_time_off', label: 'Paid Time Off', isDefault: false, order: 4 },
            { value: 'flexible_schedule', label: 'Flexible Schedule', isDefault: false, order: 5 },
            { value: 'professional_development', label: 'Professional Development', isDefault: false, order: 6 }
        ],
        placement: {
            section: 'job_posting',
            order: 4,
            group: 'job_details',
            isVisible: true
        },
        styling: {
            cssClass: 'form-control',
            width: '100%',
            helpText: 'Select all applicable benefits'
        },
        status: 'active',
        permissions: {
            canEdit: true,
            canDelete: true,
            isSystemField: false
        }
    },
    {
        fieldId: 'application_deadline',
        name: 'application_deadline',
        label: 'Application Deadline',
        description: 'Last date to apply for this position',
        fieldType: 'date',
        validation: {
            required: false
        },
        placement: {
            section: 'job_posting',
            order: 5,
            group: 'job_details',
            isVisible: true
        },
        styling: {
            placeholder: 'Select deadline date',
            cssClass: 'form-control',
            width: '100%',
            helpText: 'Optional deadline for applications'
        },
        status: 'active',
        permissions: {
            canEdit: true,
            canDelete: true,
            isSystemField: false
        }
    }
];

async function seedCustomFields() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');
        
        // Clear existing custom fields
        await CustomField.deleteMany({});
        console.log('Cleared existing custom fields');
        
        // Add sample fields
        for (const fieldData of sampleFields) {
            const field = new CustomField({
                ...fieldData,
                createdBy: new mongoose.Types.ObjectId(), // Dummy admin ID
                lastModifiedBy: new mongoose.Types.ObjectId()
            });
            
            await field.save();
            console.log(`Created field: ${fieldData.label}`);
        }
        
        console.log('Sample custom fields seeded successfully!');
        console.log(`Created ${sampleFields.length} custom fields`);
        
    } catch (error) {
        console.error('Error seeding custom fields:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the seeder
seedCustomFields();
