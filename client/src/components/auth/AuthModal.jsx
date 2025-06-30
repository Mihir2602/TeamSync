/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SocialAuth from './SocialAuth';
import './AuthModal.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiMail, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

const AuthModal = ({ isOpen, onClose, mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        await login({ email, password });
        // Close modal and navigate to dashboard on successful login
        onClose();
        navigate('/dashboard');
        
        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
        
      } else if (mode === 'register') {
        await register({ 
          username: username || email.split('@')[0], // Use email prefix as default username
          email, 
          password 
        });
        
        // Show success message instead of immediately closing
        setRegistrationSuccess(true);
        setError(''); // Clear any previous errors
        
        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
        
      } else if (mode === 'reset') {
        await forgotPassword(email);
        setError(''); // Clear error on success
        alert('Password reset link sent to your email!');
        onModeChange('login');
        return;
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Calculate password strength
    let strength = 0;
    if (value.length > 5) strength += 20;
    if (value.length > 7) strength += 20;
    if (/[A-Z]/.test(value)) strength += 20;
    if (/[0-9]/.test(value)) strength += 20;
    if (/[^A-Za-z0-9]/.test(value)) strength += 20;
    
    setPasswordStrength(strength);
  };

  const handleClose = () => {
    // Reset all states when closing
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setRegistrationSuccess(false);
    setPasswordStrength(0);
    onClose();
  };

  const handleModeChange = (newMode) => {
    // Reset registration success state when changing modes
    setRegistrationSuccess(false);
    setError('');
    onModeChange(newMode);
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (registrationSuccess) return 'Registration Successful! 🎉';
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    if (registrationSuccess) return 'Please check your email to verify your account before signing in.';
    switch (mode) {
      case 'login': return 'Sign in to continue to TeamSync';
      case 'register': return 'Join thousands of teams tracking their progress';
      case 'reset': return 'Enter your email to receive a password reset link';
      default: return '';
    }
  };

  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <div className="auth-modal-overlay" onClick={handleClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close authentication modal"
          >
            &times;
          </button>
          
          <div className="registration-success">
            <FiCheckCircle className="success-icon" />
            <h2 className="auth-title">{getTitle()}</h2>
            <p className="auth-subtitle">{getSubtitle()}</p>
            
            <div className="success-actions">
              <button 
                className="auth-submit"
                onClick={() => handleModeChange('login')}
              >
                Go to Sign In
              </button>
              <button 
                className="secondary-button"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="close-button" 
          onClick={handleClose}
          aria-label="Close authentication modal"
        >
          &times;
        </button>
        
        <h2 className="auth-title">{getTitle()}</h2>
        
        <p className="auth-subtitle">{getSubtitle()}</p>
        
        {mode !== 'reset' && <SocialAuth onClose={onClose} />}
        
        {mode !== 'reset' && (
          <div className="divider">
            <span>or continue with email</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="username">Username (optional)</label>
              <div className="input-container">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Enter username"
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@example.com"
              />
              <FiMail className="form-icon" />
            </div>
          </div>
          
          {mode !== 'reset' && (
            <div className="form-group">
              <label htmlFor="password">
                Password
                {mode === 'register' && (
                  <span className="password-strength">
                    <div 
                      className="strength-meter" 
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </span>
                )}
              </label>
              <div className="input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  className="form-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          )}
          
          {mode === 'login' && (
            <div className="forgot-password">
              <button 
                type="button" 
                onClick={() => handleModeChange('reset')}
                aria-label="Reset password"
              >
                Forgot password?
              </button>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-submit" 
            disabled={isLoading}
            aria-label={mode === 'login' ? 'Log in' : mode === 'register' ? 'Sign up' : 'Send reset link'}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button 
                type="button" 
                onClick={() => handleModeChange('register')}
                aria-label="Switch to sign up"
              >
                Sign up
              </button>
            </>
          ) : mode === 'register' ? (
            <>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => handleModeChange('login')}
                aria-label="Switch to log in"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Remember your password?{' '}
              <button 
                type="button" 
                onClick={() => handleModeChange('login')}
                aria-label="Switch to log in"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;