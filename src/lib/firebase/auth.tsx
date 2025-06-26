
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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


const ConfigurationRequiredScreen = () => (
    <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-xl mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-2xl">Configuration Required</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertTitle>Action Needed</AlertTitle>
                    <AlertDescription>
                        The application requires API keys to function.
                        <ul className="list-disc list-inside text-left mt-2 space-y-1">
                            <li><strong>Firebase:</strong> For user authentication.</li>
                            <li><strong>RapidAPI:</strong> For fetching job listings.</li>
                        </ul>
                        <p className="mt-3">Please add your credentials to the <strong>.env</strong> file and restart the server.</p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    </div>
);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  if (isClient && !isFirebaseConfigured) {
    return <ConfigurationRequiredScreen />;
  }

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
