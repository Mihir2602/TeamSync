/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Email verification failed. The link may have expired.');
        setTimeout(() => navigate('/'), 5000);
      }
    };

    if (token) {
      verify();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {status === 'verifying' ? (
          <>
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          </>
        ) : (
          <div className={`${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            <h2 className="text-xl font-semibold">{message}</h2>
            {status === 'error' && (
              <button
                className="mt-4 text-blue-600 hover:underline"
                onClick={() => navigate('/register')}
              >
                Try registering again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;