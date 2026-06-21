import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import i18n from 'i18next';
import { auth } from '../config/firebase';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('clearpath_isGuest') === 'true';
  });
  const [user, setUser] = useState(null);
  const [savedSituation, setSavedSituation] = useState(() => {
    const saved = localStorage.getItem('clearpath_situation');
    return saved ? JSON.parse(saved) : null;
  });
  const [actionPlanProgress, setActionPlanProgress] = useState(() => {
    const saved = localStorage.getItem('clearpath_plan_progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [savedResources, setSavedResources] = useState(() => {
    const saved = localStorage.getItem('clearpath_saved_resources');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Monitor unauthorized requests from api client
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      window.location.href = '/auth/login';
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  // Monitor Firebase session changes (silent restore on reload)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force fetch fresh ID Token
          const token = await firebaseUser.getIdToken(true);
          
          // Verify with backend me endpoint
          const profile = await api.get('/api/auth/me');
          if (profile && profile.user) {
            setUser(profile.user);
            setIsLoggedIn(true);
            setIsGuest(false);
            
            // Sync preferred language from server
            if (profile.user.preferredLanguage) {
              i18n.changeLanguage(profile.user.preferredLanguage);
              localStorage.setItem('clearpath_language', profile.user.preferredLanguage);
            }
          } else {
            // Backend session not valid, clear
            await signOut(auth);
            setIsLoggedIn(false);
          }
        } catch (err) {
          console.error('Failed to restore backend session:', err);
          // Don't log out Firebase user on network failures, only on invalid auth
          if (err.message === 'Unauthorized') {
            await signOut(auth);
            setIsLoggedIn(false);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsLoadingSession(false);
    });

    return () => unsubscribe();
  }, []);

  // Upgraded Login / Verify Handshake
  const login = async (type, { token }) => {
    const currentLang = i18n.language || 'en';
    
    // Call backend verify
    const response = await api.post('/api/auth/verify', {
      firebaseToken: token,
      preferredLanguage: currentLang,
    });

    const userProfile = response.user;
    setUser(userProfile);
    setIsLoggedIn(true);
    
    let isMigrated = false;

    // Detect guest upgrade migration
    if (isGuest && savedSituation) {
      try {
        isMigrated = true;
        
        // 1. Migrate Intake
        const intakeResponse = await api.post('/api/intake', {
          problemType: savedSituation.situation,
          city: savedSituation.location === 'other' ? savedSituation.otherLocation : savedSituation.location,
          hasRentalAgreement: savedSituation.agreement,
          urgencyLevel: savedSituation.urgency,
          customProblem: savedSituation.otherSituation || '',
        });

        const situationId = intakeResponse.situationId;

        // 2. Generate Plan
        await api.post('/api/plan/generate', { situationId });

        // 3. Migrate checked steps
        const stepPromises = Object.keys(actionPlanProgress)
          .filter(stepId => actionPlanProgress[stepId] === true)
          .map(stepId => {
            const stepNumber = stepId.replace('step', '');
            return api.patch(`/api/plan/step/${stepNumber}`, { isCompleted: true });
          });
        
        await Promise.all(stepPromises);
      } catch (migrationError) {
        console.error('Guest migration failed:', migrationError);
      }
    }

    // Clean guest credentials
    setIsGuest(false);
    localStorage.setItem('clearpath_isLoggedIn', 'true');
    localStorage.setItem('clearpath_isGuest', 'false');
    localStorage.setItem('clearpath_user', JSON.stringify(userProfile));

    if (isMigrated) {
      // Clear local states
      clearLocalGuestData();
    }

    return { migrated: isMigrated };
  };

  // Upgraded Signup (identical handshake, routes to same verify backend)
  const signup = async (type, { token }) => {
    return await login(type, { token });
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout API failure:', err);
    } finally {
      setIsLoggedIn(false);
      setIsGuest(false);
      setUser(null);
      setSavedSituation(null);
      setActionPlanProgress({});
      setSavedResources([]);
      
      // Clear all storage keys
      localStorage.removeItem('clearpath_isLoggedIn');
      localStorage.removeItem('clearpath_isGuest');
      localStorage.removeItem('clearpath_user');
      localStorage.removeItem('clearpath_situation');
      localStorage.removeItem('clearpath_plan_progress');
      localStorage.removeItem('clearpath_saved_resources');
    }
  };

  const clearLocalGuestData = () => {
    setSavedSituation(null);
    setActionPlanProgress({});
    setSavedResources([]);
    localStorage.removeItem('clearpath_situation');
    localStorage.removeItem('clearpath_plan_progress');
    localStorage.removeItem('clearpath_saved_resources');
  };

  const setGuest = (val) => {
    setIsGuest(val);
    setIsLoggedIn(false);
    setUser(null);
    localStorage.setItem('clearpath_isGuest', val ? 'true' : 'false');
    localStorage.setItem('clearpath_isLoggedIn', 'false');
    localStorage.removeItem('clearpath_user');
  };

  const saveSituation = (data) => {
    setSavedSituation(data);
    localStorage.setItem('clearpath_situation', JSON.stringify(data));
  };

  const clearSituation = () => {
    setSavedSituation(null);
    setActionPlanProgress({});
    setSavedResources([]);
    localStorage.removeItem('clearpath_situation');
    localStorage.removeItem('clearpath_plan_progress');
    localStorage.removeItem('clearpath_saved_resources');
  };

  const updatePlanProgress = (taskId, completed) => {
    const newProgress = { ...actionPlanProgress, [taskId]: completed };
    setActionPlanProgress(newProgress);
    localStorage.setItem('clearpath_plan_progress', JSON.stringify(newProgress));
  };

  const toggleSaveResource = (resource) => {
    let newResources;
    const exists = savedResources.some(r => r.id === resource.id);
    if (exists) {
      newResources = savedResources.filter(r => r.id !== resource.id);
    } else {
      newResources = [...savedResources, resource];
    }
    setSavedResources(newResources);
    localStorage.setItem('clearpath_saved_resources', JSON.stringify(newResources));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isGuest,
        user,
        savedSituation,
        actionPlanProgress,
        savedResources,
        isLoadingSession,
        login,
        signup,
        logout,
        setGuest,
        saveSituation,
        clearSituation,
        updatePlanProgress,
        toggleSaveResource,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
