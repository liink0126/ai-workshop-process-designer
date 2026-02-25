import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthUserStateChanged, getUserProfile, handleRedirectResult } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refetchUserProfile: () => Promise<void>;
  hasAcceptedAIDisclosure: boolean;
  acceptAIDisclosure: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAcceptedAIDisclosure, setHasAcceptedAIDisclosure] = useState<boolean>(() => {
    // localStorage에서 AI 동의 상태 확인
    const stored = localStorage.getItem('ai_disclosure_accepted');
    return stored === 'true';
  });

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

  const acceptAIDisclosure = () => {
    localStorage.setItem('ai_disclosure_accepted', 'true');
    setHasAcceptedAIDisclosure(true);
  };
  
  useEffect(() => {
    setLoading(true);
    
    // 리다이렉트 결과 처리
    handleRedirectResult().catch((error) => {
      console.error("Redirect result error:", error);
    });
    
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
    <AuthContext.Provider value={{ user, userProfile, loading, refetchUserProfile, hasAcceptedAIDisclosure, acceptAIDisclosure }}>
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