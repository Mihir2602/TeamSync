
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token - user not found' 
      });
    }

    // Add user info to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    res.status(500).json({ 
      message: 'Token validation failed' 
    });
  }
};

module.exports = { validateToken };