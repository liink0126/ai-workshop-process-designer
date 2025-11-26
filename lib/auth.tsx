import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthUserStateChanged, getUserProfile } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    <AuthContext.Provider value={{ user, userProfile, loading, refetchUserProfile }}>
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