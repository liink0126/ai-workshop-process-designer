import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthUserStateChanged, getUserProfile } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDevMode: boolean;
  enableDevMode: () => void;
  refetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('devMode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const enableDevMode = () => {
    try {
      sessionStorage.setItem('devMode', 'true');
      setIsDevMode(true);
    } catch (e) {
      console.error("Failed to set dev mode in sessionStorage", e);
    }
  };

  const fetchProfile = async (currentUser: User | null) => {
    if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
    } else {
        setUserProfile(null);
    }
  };

  const refetchUserProfile = async () => {
    await fetchProfile(user);
  };
  
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthUserStateChanged(async (user) => {
      try {
        setUser(user);
        await fetchProfile(user);
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isDevMode, enableDevMode, refetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};