const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');

// GET /api/blogs - Get all published blogs (public)
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            search, 
            featured,
            sortBy = 'publishedAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { published: true };

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by featured
        if (featured === 'true') {
            query.featured = true;
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const blogs = await Blog.find(query)
            .select('-content') // Exclude full content for list view
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBlogs: total,
                hasNext: skip + blogs.length < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
});

// GET /api/blogs/featured - Get featured blogs (public)
router.get('/featured', async (req, res) => {
    try {
        const { limit = 4 } = req.query;

        const blogs = await Blog.find({ 
            published: true, 
            featured: true 
        })
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit));

        res.json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error('Error fetching featured blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured blogs',
            error: error.message
        });
    }
});

// GET /api/blogs/:id - Get single blog by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        if (!blog.published) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.json({
            success: true,
            blog
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
});

// GET /api/blogs/slug/:slug - Get single blog by slug (public)
router.get('/slug/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            slug: req.params.slug,
            published: true 
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.json({
            success: true,
            blog
        });
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
});

// POST /api/blogs - Create new blog (admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin or superadmin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const {
            title,
            excerpt,
            content,
            category,
            author,
            image,
            imageUrl,
            readTime,
            tags,
            featured,
            published,
            seoTitle,
            seoDescription
        } = req.body;

        // Validate required fields
        if (!title || !excerpt || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, excerpt, content, and category are required'
            });
        }

        const blog = new Blog({
            title,
            excerpt,
            content,
            category,
            author: author || 'Admin',
            image: image || '📚',
            imageUrl,
            readTime: readTime || '5 min read',
            tags: tags || [],
            featured: featured || false,
            published: published !== undefined ? published : true,
            seoTitle,
            seoDescription
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
});

// PUT /api/blogs/:id - Update blog (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin or superadmin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        const updateData = req.body;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        Object.assign(blog, updateData);
        await blog.save();

        res.json({
            success: true,
            message: 'Blog updated successfully',
            blog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
});

// DELETE /api/blogs/:id - Delete blog (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin or superadmin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
});

// GET /api/admin/blogs - Get all blogs for admin (including unpublished)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Check if user is admin or superadmin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { 
            page = 1, 
            limit = 10, 
            category, 
            search, 
            published,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by published status
        if (published !== undefined) {
            query.published = published === 'true';
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const blogs = await Blog.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBlogs: total,
                hasNext: skip + blogs.length < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching admin blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin blogs',
            error: error.message
        });
    }
});

module.exports = router;