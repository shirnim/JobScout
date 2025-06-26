'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from '@/components/auth/AuthButton';
import { Briefcase, LayoutDashboard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            <Briefcase />
            <span className="font-headline">JobScout</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant={pathname === '/search' ? 'secondary' : 'ghost'}>
              <Link href="/search">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Search</span>
              </Link>
            </Button>
            <Button asChild variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Dashboard</span>
              </Link>
            </Button>
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
