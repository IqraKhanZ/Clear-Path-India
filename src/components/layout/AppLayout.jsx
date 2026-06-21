import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import Toast from '../common/Toast';

const AppLayout = () => {
  const [toast, setToast] = useState(null); // { message, type }
  const location = useLocation();

  const isProcessingPage = location.pathname === '/processing';

  useEffect(() => {
    const handleShowToast = (e) => {
      const { message, type = 'success' } = e.detail || {};
      setToast({ message, type });
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  return (
    <div className="min-h-screen bg-background text-textPrimary font-sans flex flex-col md:flex-row">
      {/* Global Toast Alerts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hide navbar on processing screen */}
      {!isProcessingPage && <BottomNavBar />}

      {/* Adjust content wrappers to full screen if on processing screen */}
      <main
        className={`flex-1 w-full transition-all duration-200 ${
          isProcessingPage ? 'pb-0 md:pl-0' : 'pb-16 md:pb-0 md:pl-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
