"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { useRouter } from 'next/navigation';

// A mock user for development when Firebase is not configured
const mockUser = {
  uid: 'mock-user-123',
  displayName: 'Demo User',
  email: 'demo@example.com',
  photoURL: `https://placehold.co/40x40.png`,
} as User;


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If Firebase is not configured, auth will be handled with a mock user via signIn/logout actions.
      console.warn("Firebase not configured. Real authentication is disabled. Using mock user for demonstration.");
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase not configured. Signing in with mock user.");
      setUser(mockUser);
      router.push('/dashboard');
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      router.push('/');
      return;
    }
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, isFirebaseConfigured }}>
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
