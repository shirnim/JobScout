
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  type Auth
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './config';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

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
                        The application requires Firebase API keys to function. Please add your project credentials to the <strong>.env</strong> file and restart the development server.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    </div>
);

const FullScreenLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const getAuthInstance = (): Auth => {
    const auth = getFirebaseAuth();
    if (!isFirebaseConfigured || !auth) {
        throw new Error("Firebase is not configured. Please set up your credentials.");
    }
    return auth;
  }

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    const auth = getAuthInstance();
    await firebaseSignInWithEmailAndPassword(auth, email, password);
  };
  
  const createUserWithEmailAndPassword = async (email: string, password: string) => {
    const auth = getAuthInstance();
    await firebaseCreateUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push('/search');
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      router.push('/signin');
      return;
    }
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isFirebaseConfigured) {
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
