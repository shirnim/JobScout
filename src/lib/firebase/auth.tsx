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
    // We only need to check for the auth object.
    // If it's null, Firebase isn't configured or failed to initialize.
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Firebase is not available, run in mock mode.
      console.warn("Firebase not configured. Real authentication is disabled.");
      setLoading(false);
    }
  }, []);

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    if (!auth) {
      console.warn("Firebase not configured. Signing in with mock user.");
      setUser({
        uid: `mock-${email}`,
        displayName: email.split('@')[0],
        email: email,
        photoURL: `https://placehold.co/40x40.png`,
      } as User);
      return;
    }
    await firebaseSignInWithEmailAndPassword(auth, email, password);
  };
  
  const createUserWithEmailAndPassword = async (email: string, password: string) => {
     if (!auth) {
      console.warn("Firebase not configured. Creating mock user.");
      setUser({
        uid: `mock-${email}`,
        displayName: email.split('@')[0],
        email: email,
        photoURL: `https://placehold.co/40x40.png`,
      } as User);
      return;
    }
    await firebaseCreateUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      console.warn("Firebase not configured. Signing in with mock user.");
      setUser({
        uid: 'mock-google-user-123',
        displayName: 'Google User',
        email: 'google@example.com',
        photoURL: `https://placehold.co/40x40.png`,
      } as User);
      router.push('/dashboard');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push('/dashboard');
  };

  const logout = async () => {
    if (!auth) {
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
