// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      username,
      email,
      password,
      verificationToken,
      isVerified: false
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
};

// Verify email token - This matches your current authRoutes.js logic
const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('Verifying email token:', token);

    // Find user with valid token that hasn't expired
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    // Mark as verified and clear token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate JWT token
    const authToken = generateToken(user._id);

    res.json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      },
      token: authToken
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// Verify JWT token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired password reset token' 
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmailToken,
  verifyToken,
  forgotPassword,
  resetPassword,
  logout,
  generateToken
};