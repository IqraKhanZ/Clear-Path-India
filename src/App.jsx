import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/screens/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IntakePage from './pages/IntakePage';
import ProcessingScreen from './components/screens/ProcessingScreen';
import ResultsPage from './pages/ResultsPage';
import ResourcesPage from './pages/ResourcesPage';
import HelpPage from './pages/HelpPage';

function AppContent() {
  const { isLoadingSession } = useAuth();

  // Full-screen spinner while restoring auth session
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center select-none">
        <svg
          className="animate-spin h-10 w-10 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="auth/signup" element={<SignUpPage />} />
          <Route path="auth/login" element={<LoginPage />} />
          
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="intake" element={<IntakePage />} />
          <Route path="processing" element={<ProcessingScreen />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="help" element={<HelpPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
