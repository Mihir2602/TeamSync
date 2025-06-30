const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const router = express.Router();
// Add these at the top of authRoutes.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL,
    passReqToCallback: true
  },
 async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { email: profile.emails[0].value },
          { googleId: profile.id }
        ]
      });

      if (!user) {
        // Generate random password for Google users
        const randomPassword = crypto.randomBytes(16).toString('hex');
        
        user = new User({
          googleId: profile.id,
          username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
          email: profile.emails[0].value,
          password: randomPassword, // Set random password
          isVerified: true
        });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Generate random password for GitHub users
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      let user = await User.findOne({
        $or: [
          { githubId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (!user) {
        // Create new user with GitHub data and random password
        user = new User({
          githubId: profile.id,
          username: profile.username || profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          password: randomPassword,
          isVerified: true
        });
        await user.save();
      } else if (!user.githubId) {
        // Link GitHub account to existing user
        user.githubId = profile.id;
        // Ensure password exists
        if (!user.password) {
          user.password = randomPassword;
        }
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));



// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
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

    // Create verification token and expiry (24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create new user
    const user = new User({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is OAuth-only
    if (user.googleId && !user.password) {
      return res.status(401).json({ 
        message: 'This account uses Google login. Please sign in with Google.' 
      });
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
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
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
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({
      message: 'Token verification failed',
      error: error.message
    });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

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
});

// Reset password route
router.post('/reset-password', async (req, res) => {
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
});

// Verify email route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
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
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: error.message
    });
  }
});

// Social auth routes

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect with token
     res.redirect(`${process.env.CLIENT_URL}/auth/google?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }
  }
);

// Update the GitHub route
router.get('/github', 
  passport.authenticate('github', { session: false })
);

router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/login',
    session: false 
  }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.CLIENT_URL}/auth/github?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=github_auth_failed`);
    }
  }
);

// Add this route before module.exports
router.post('/social', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
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
    console.error('Social token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({
      message: 'Token verification failed',
      error: error.message
    });
  }
});


module.exports = router;