
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must be less than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId; 
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  googleId: String,
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  // Only hash if password exists and is modified
  if (this.password && this.isModified('password')) {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  // For OAuth users without password, always return false
  if (!this.password) return false;
  
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);