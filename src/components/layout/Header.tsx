import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
import { Briefcase } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            <Briefcase />
            <span className="font-headline">JobScout</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
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
