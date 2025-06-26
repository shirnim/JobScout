
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
        throw new Error("Firebase is not configured. Please set up your credentials.");
    }
    await firebaseSignInWithEmailAndPassword(auth!, email, password);
  };
  
  const createUserWithEmailAndPassword = async (email: string, password: string) => {
     if (!isFirebaseConfigured) {
        throw new Error("Firebase is not configured. Please set up your credentials.");
    }
    await firebaseCreateUserWithEmailAndPassword(auth!, email, password);
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        throw new Error("Firebase is not configured. Please set up your credentials.");
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth!, provider);
    router.push('/search');
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      router.push('/signin');
      return;
    }
    try {
      await signOut(auth!);
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmailAndPassword, createUserWithEmailAndPassword, logout, isFirebaseConfigured }}>
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
