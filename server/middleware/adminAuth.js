const User = require('../models/User');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isAdmin()) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    if (!user.isAdminActive) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Super admin authentication middleware
const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
    }

    if (!user.isAdminActive) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Super admin auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Permission-based middleware factory
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.hasAdminPermission(permission)) {
      return res.status(403).json({ 
        message: `Access denied. Permission '${permission}' required.` 
      });
    }

    next();
  };
};

module.exports = {
  adminAuth,
  superAdminAuth,
  requirePermission
};
