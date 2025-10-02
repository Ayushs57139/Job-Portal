const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 200,
        trim: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Career Tips', 'Interview Prep', 'Workplace Trends', 'Networking', 'Resume Writing', 'Job Search', 'Salary Negotiation', 'Industry News', 'Professional Development', 'Work-Life Balance'],
        trim: true
    },
    author: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true,
        default: 'Admin'
    },
    image: {
        type: String,
        default: '📚' // Default emoji, can be changed to image URL
    },
    imageUrl: {
        type: String,
        trim: true
    },
    readTime: {
        type: String,
        required: true,
        default: '5 min read'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    featured: {
        type: Boolean,
        default: false
    },
    published: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    seoTitle: {
        type: String,
        maxlength: 60,
        trim: true
    },
    seoDescription: {
        type: String,
        maxlength: 160,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', function(next) {
    if (this.isModified('title') && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim('-'); // Remove leading/trailing hyphens
        
        // Ensure slug is not empty
        if (!this.slug) {
            this.slug = 'blog-' + Date.now();
        }
    }
    next();
});

// Index for better search performance
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
blogSchema.index({ category: 1, published: 1, featured: 1 });
blogSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);