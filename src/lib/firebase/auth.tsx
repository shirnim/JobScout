
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
import { auth, isFirebaseConfigured, useRealFirebase } from './config';
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
    if (useRealFirebase) {
      const unsubscribe = onAuthStateChanged(auth!, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock mode: restore session from localStorage
      if (typeof window !== 'undefined') {
        try {
          const mockUserEmail = localStorage.getItem('mock-user-session');
          if (mockUserEmail) {
            const usersData = localStorage.getItem('mock-users');
            const mockUsers = usersData ? JSON.parse(usersData) : [];

            if (!Array.isArray(mockUsers)) {
                console.error("Corrupted mock user data in localStorage. Clearing.");
                localStorage.removeItem('mock-users');
                localStorage.removeItem('mock-user-session');
                setLoading(false);
                return;
            }

            const mockUser = mockUsers.find((u: any) => u && typeof u === 'object' && u.email === mockUserEmail);

            if (mockUser) {
              const displayName = mockUser.email.split('@')[0];
              const color = mockUser.color || 'cccccc';
              setUser({
                uid: `mock-${mockUser.email}`,
                displayName: displayName,
                email: mockUser.email,
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${color}&color=fff&size=100`,
              } as User);
            } else {
                // Session exists for a user not in the list, clear the session.
                localStorage.removeItem('mock-user-session');
            }
          }
        } catch (error) {
            console.error("Failed to read mock user data from localStorage. Clearing for safety.", error);
            localStorage.removeItem('mock-users');
            localStorage.removeItem('mock-user-session');
        }
      }
      setLoading(false);
    }
  }, []);

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    if (!useRealFirebase) {
      console.warn("Firebase not configured. Signing in with mock user.");
      const trimmedEmail = email.trim();

      if (typeof window !== 'undefined') {
        try {
          let mockUsers: any[] = [];
          try {
            mockUsers = JSON.parse(localStorage.getItem('mock-users') || '[]');
            if (!Array.isArray(mockUsers)) mockUsers = [];
          } catch (e) {
            // If parsing fails, there are no users to sign in with, so we throw.
            throw new Error("Invalid email or password. Please try again.");
          }

          const mockUser = mockUsers.find((u: any) => u && u.email && u.email.trim() === trimmedEmail);

          if (!mockUser || !mockUser.password || mockUser.password !== password) {
              throw new Error("Invalid email or password. Please try again.");
          }
          
          const displayName = trimmedEmail.split('@')[0];
          const color = mockUser.color || 'cccccc';
          const loggedInUser = {
            uid: `mock-${trimmedEmail}`,
            displayName: displayName,
            email: trimmedEmail,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${color}&color=fff&size=100`,
          } as User;

          setUser(loggedInUser);
          localStorage.setItem('mock-user-session', loggedInUser.email!);
        } catch (error: any) {
            console.error("Failed to process mock user sign-in:", error);
            throw error; // Re-throw to be displayed in the toast
        }
      }
      return;
    }
    await firebaseSignInWithEmailAndPassword(auth!, email, password);
  };
  
  const createUserWithEmailAndPassword = async (email: string, password: string) => {
     if (!useRealFirebase) {
      console.warn("Firebase not configured. Creating mock user.");
      const trimmedEmail = email.trim();

      if (typeof window !== 'undefined') {
        try {
            let mockUsers: any[] = [];
            try {
                // Safely get and parse users, default to empty array on corruption
                mockUsers = JSON.parse(localStorage.getItem('mock-users') || '[]');
                if (!Array.isArray(mockUsers)) mockUsers = [];
            } catch (e) {
                console.warn('Could not parse mock users from localStorage. Starting fresh.');
                mockUsers = [];
            }
            
            if (mockUsers.some((u: any) => u && u.email && u.email.trim() === trimmedEmail)) {
                throw new Error("An account with this email already exists.");
            }
            
            const randomColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            mockUsers.push({ email: trimmedEmail, password: password, color: randomColor });
            localStorage.setItem('mock-users', JSON.stringify(mockUsers));
            
            const displayName = trimmedEmail.split('@')[0];
            const newUser = {
                uid: `mock-${trimmedEmail}`,
                displayName: displayName,
                email: trimmedEmail,
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${randomColor}&color=fff&size=100`,
            } as User;

            setUser(newUser);
            localStorage.setItem('mock-user-session', newUser.email!);
        } catch (error: any) {
            console.error("Failed to process mock user sign-up:", error);
            throw error; // Re-throw the original error to be displayed in the toast
        }
      }
      return;
    }
    await firebaseCreateUserWithEmailAndPassword(auth!, email, password);
  };

  const signInWithGoogle = async () => {
    if (!useRealFirebase) {
      console.warn("Firebase not configured. Signing in with mock user.");
       const mockGoogleUser = {
        uid: 'mock-google-user-123',
        displayName: 'Google User',
        email: 'google@example.com',
        photoURL: `https://ui-avatars.com/api/?name=Google+User&background=DB4437&color=fff&size=100`,
      } as User;
      setUser(mockGoogleUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock-user-session', mockGoogleUser.email!);
      }
      router.push('/search');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth!, provider);
    router.push('/search');
  };

  const logout = async () => {
    if (!useRealFirebase) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock-user-session');
      }
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
