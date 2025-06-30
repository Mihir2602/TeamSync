/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AuthModal.css';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const SocialAuth = ({ onClose }) => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = () => {
    // Open Google auth in a new window
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const authWindow = window.open(
      `${process.env.REACT_APP_SERVER_BASE_URL}/api/auth/google`,
      'GoogleAuth',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // Check for popup blockers
    if (!authWindow) {
      alert('Popup blocked! Please allow popups for this site to sign in with Google.');
      return;
    }

    // Listen for message from the popup
    const messageListener = async (event) => {
      // Security check - only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        try {
          const { token } = event.data;
          await socialLogin('google', token);
          
          // Close the AuthModal after successful login
          if (onClose) onClose();
          
          // Navigate to dashboard
          navigate('/dashboard');
          
          // Close the popup
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        } catch (error) {
          console.error('Google authentication failed:', error);
        } finally {
          window.removeEventListener('message', messageListener);
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('Google auth error:', event.data.error);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    // Check if window was closed by user
    const checkWindowClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', messageListener);
      }
    }, 500);
  };

  const handleSocialAuth = (provider) => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const authWindow = window.open(
      `${process.env.REACT_APP_SERVER_BASE_URL}/api/auth/${provider}`,
      `${provider}Auth`,
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!authWindow) {
      alert('Popup blocked! Please allow popups for this site.');
      return;
    }

    const messageListener = async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === `${provider.toUpperCase()}_AUTH_SUCCESS`) {
        try {
          const { token } = event.data;
          await socialLogin(provider, token);
          onClose();
          navigate('/dashboard');
        } catch (error) {
          console.error(`${provider} authentication failed:`, error);
        } finally {
          window.removeEventListener('message', messageListener);
        }
      } else if (event.data.type === `${provider.toUpperCase()}_AUTH_ERROR`) {
        console.error(`${provider} auth error:`, event.data.error);
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    const checkWindowClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', messageListener);
      }
    }, 500);
  };

  return (
    <div className="social-auth">
      <button 
        className="social-button google" 
        onClick={handleGoogleAuth}
        aria-label="Sign in with Google"
      >
        <FcGoogle className="social-icon" />
        Continue with Google
      </button>
       <button 
        className="social-button github" 
        onClick={() => handleSocialAuth('github')}
        aria-label="Sign in with GitHub"
      >
        <FaGithub className="social-icon" />
        Continue with GitHub
      </button>
    </div>
  );
};

export default SocialAuth;