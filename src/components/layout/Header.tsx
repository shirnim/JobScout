'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from '@/components/auth/AuthButton';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          <nav className="flex items-center gap-4">
            <Link
              href="/search"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/search' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Search
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/dashboard'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              Dashboard
            </Link>
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
