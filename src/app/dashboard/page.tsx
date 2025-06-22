
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { getDashboardAnalytics } from '@/lib/firebase/firestore';
import type { AnalyticsData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, Users, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

const DashboardSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
    </div>
);


export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (user) {
            setLoadingData(true);
            getDashboardAnalytics().then(data => {
                setAnalytics(data);
                setLoadingData(false);
            });
        }
    }, [user]);

    if (authLoading) {
        return <DashboardSkeleton />;
    }
    
    if (!user) {
        return (
            <div className="flex items-center justify-center pt-16">
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
                        <CardTitle className="mt-4 text-2xl">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">You must be signed in to view the dashboard.</p>
                        <Button asChild className="mt-6">
                            <Link href="/signin">Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (loadingData || !analytics) {
         return (
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
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
