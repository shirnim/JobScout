"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { getDashboardAnalytics } from '@/lib/firebase/firestore';
import type { AnalyticsData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const { user, loading: authLoading, isFirebaseConfigured } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (user && isFirebaseConfigured) {
            getDashboardAnalytics().then(data => {
                setAnalytics(data);
                setLoadingData(false);
            });
        } else if (!isFirebaseConfigured || !user) {
            setLoadingData(false);
        }
    }, [user, isFirebaseConfigured]);

    if (!isFirebaseConfigured) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Dashboard Unavailable</AlertTitle>
                <AlertDescription>
                    Firebase is not configured, so authentication and dashboard analytics are disabled. Please add your Firebase credentials to the <code>.env</code> file to enable these features.
                </AlertDescription>
            </Alert>
        );
    }

    if (authLoading) {
        return (
           <div className="space-y-8">
               <Skeleton className="h-8 w-48" />
               <div className="grid gap-4 md:grid-cols-3">
                   <Skeleton className="h-28" />
                   <Skeleton className="h-28" />
                   <Skeleton className="h-28" />
               </div>
               <div className="grid gap-4 md:grid-cols-2">
                   <Skeleton className="h-80" />
                   <Skeleton className="h-80" />
               </div>
           </div>
       );
   }

    if (!user) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Access Denied</h1>
                  <p className="text-muted-foreground">Please sign in to view the dashboard.</p>
                </div>
            </div>
        );
    }
    
    if (loadingData || !analytics) {
         return (
            <div className="space-y-8">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Jobs Indexed" value={analytics.totalJobs.toLocaleString()} icon={Briefcase} />
                <StatCard title="Top Location" value={analytics.topLocations[0].location} icon={MapPin} />
                <StatCard title="Most Common Role" value={analytics.topRoles[0].role} icon={Users} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs by Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.topLocations} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="location" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                    }}
                                />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="count" fill="hsl(var(--primary))" name="Jobs" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.topRoles} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="role" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                    }}
                                />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="count" fill="hsl(var(--accent))" name="Postings" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
