/* eslint-disable prettier/prettier */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AuthRoute from './components/auth/AuthRoute';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallback from './pages/AuthCallback';

import './styles/globals.css';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthRoute>
                  <DashboardPage />
                </AuthRoute>
              } 
            />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/google" element={<AuthCallback />} />
          <Route path="/auth/github" element={<AuthCallback />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;