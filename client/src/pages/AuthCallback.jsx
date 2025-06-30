/* eslint-disable prettier/prettier */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthCallback = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  const error = params.get('error');
  
  // Extract provider from URL path (e.g., '/auth/google' → 'google')
  const provider = location.pathname.split('/')[2] || 'google';

  useEffect(() => {
    console.log(`${provider}AuthCallback received:`, { token, error });

    if (token) {
      console.log(`Sending ${provider} success message to parent window`);
      window.opener.postMessage({
        type: `${provider.toUpperCase()}_AUTH_SUCCESS`,
        token
      }, window.location.origin);
    } else if (error) {
      console.log(`Sending ${provider} error message to parent window`);
      window.opener.postMessage({
        type: `${provider.toUpperCase()}_AUTH_ERROR`,
        error
      }, window.location.origin);
    } else {
      console.log('No token or error found, closing window');
    }

    // Close the window after a short delay
    const closeWindow = () => {
      if (window && !window.closed) {
        window.close();
      }
    };
    
    const timer = setTimeout(closeWindow, 1000);
    
    return () => clearTimeout(timer);
  }, [location, provider, token, error]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>Processing {provider} authentication...</h2>
        <p>This window will close automatically</p>
      </div>
    </div>
  );
};

export default AuthCallback;