
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import type { AnalyticsData, Job } from '@/types';
import { generateAnalytics, EMPTY_ANALYTICS } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, Users, ShieldAlert, Search } from 'lucide-react';
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

const NoDataState = () => (
    <div className="text-center py-12">
        <Card className="max-w-md mx-auto text-center border-dashed">
            <CardHeader>
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle className="mt-4 text-2xl">No Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Search for jobs on the home page to see analytics here.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Go to Search</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
);


export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (user) {
            setLoadingData(true);
            try {
                const storedJobs = localStorage.getItem('lastSearchResults');
                if (storedJobs) {
                    const jobs: Job[] = JSON.parse(storedJobs);
                    const data = generateAnalytics(jobs);
                    setAnalytics(data);
                } else {
                    setAnalytics(EMPTY_ANALYTICS);
                }
            } catch (error) {
                console.error("Failed to load or parse analytics data", error);
                setAnalytics(EMPTY_ANALYTICS);
            } finally {
                setLoadingData(false);
            }
        } else if (!authLoading) {
             setLoadingData(false);
        }
    }, [user, authLoading]);

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
    
    if (loadingData) {
         return <DashboardSkeleton />;
    }

    if (!analytics || analytics.totalJobs === 0) {
        return (
             <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <NoDataState />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Jobs Analyzed" value={analytics.totalJobs.toLocaleString()} icon={Briefcase} />
                <StatCard title="Top Location" value={analytics.topLocations.length > 0 ? analytics.topLocations[0].location : 'N/A'} icon={MapPin} />
                <StatCard title="Most Common Role" value={analytics.topRoles.length > 0 ? analytics.topRoles[0].role : 'N/A'} icon={Users} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs by Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.topLocations.length > 0 ? (
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
                        ) : (
                             <p className="text-muted-foreground text-center py-12">Not enough data to display chart.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {analytics.topRoles.length > 0 ? (
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
                        ) : (
                             <p className="text-muted-foreground text-center py-12">Not enough data to display chart.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
