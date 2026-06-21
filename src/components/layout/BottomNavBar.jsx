import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, FileText, BookOpen, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomNavBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, savedSituation } = useAuth();

  const currentPath = location.pathname;

  const getSituationRoute = () => {
    return savedSituation ? '/results' : '/intake';
  };

  const getAccountRoute = () => {
    return isLoggedIn ? '/dashboard' : '/auth/login';
  };

  const navItems = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Home,
      path: '/',
      isActive: currentPath === '/',
    },
    {
      id: 'situation',
      label: t('nav.situation'),
      icon: FileText,
      path: getSituationRoute(),
      isActive: currentPath === '/intake' || currentPath === '/results',
    },
    {
      id: 'resources',
      label: t('nav.resources'),
      icon: BookOpen,
      path: '/resources',
      isActive: currentPath === '/resources',
    },
    {
      id: 'help',
      label: t('nav.help'),
      icon: Phone,
      path: '/help',
      isActive: currentPath === '/help',
      isAccent: true, // "Get Help" renders in #F97316 accent color always
    },
    {
      id: 'account',
      label: t('nav.account'),
      icon: User,
      path: getAccountRoute(),
      isActive: currentPath === '/auth/login' || currentPath === '/auth/signup' || currentPath === '/dashboard',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Visible on screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-40 select-none shadow-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const colorClass = item.isAccent
            ? 'text-accent'
            : item.isActive
            ? 'text-primary'
            : 'text-textMuted hover:text-textPrimary';

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center focus:outline-none"
            >
              <Icon size={20} className={`${colorClass} transition-colors duration-200`} />
              <span className={`text-[10px] mt-1 font-semibold leading-none ${colorClass} transition-colors duration-200`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Left Sidebar Navigation (Visible on screens >= 768px) */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 py-6 px-4 z-40 select-none">
        {/* Branding Logo */}
        <div className="flex items-center gap-2 px-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <Home size={22} className="text-primary" />
          <span className="text-lg font-extrabold text-primary">
            ClearPath <span className="text-accent">India</span>
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            let btnClass = 'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ';
            if (item.isAccent) {
              btnClass += 'bg-orange-50 text-accent hover:bg-orange-100';
            } else if (item.isActive) {
              btnClass += 'bg-blue-50 text-primary';
            } else {
              btnClass += 'text-textMuted hover:bg-gray-50 hover:text-textPrimary';
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={btnClass}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer Info */}
        <div className="px-3 py-4 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-relaxed">
          {t('landing.footer')}
        </div>
      </aside>
    </>
  );
};

export default BottomNavBar;
