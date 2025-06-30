/* eslint-disable prettier/prettier */
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', fullScreen = false, message = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`loading-spinner-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className={`spinner ${sizeClasses[size]}`} />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;