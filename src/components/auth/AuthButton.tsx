"use client";

import { useAuth } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, Loader2, LayoutDashboard, CircleUserRound } from 'lucide-react';
import Link from 'next/link';

const AuthButton = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-10 w-10 rounded-full">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/signin">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Link>
      </Button>
    );
  }

  const photoSrc = user.photoURL || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={photoSrc}
              alt={user.displayName || 'User Avatar'}
              data-ai-hint="person face"
            />
            <AvatarFallback>
              <CircleUserRound className="h-full w-full text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex flex-col items-center gap-2 p-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={photoSrc} alt={user.displayName || 'User Avatar'} />
                <AvatarFallback>
                    <CircleUserRound className="h-full w-full text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
            <div className="text-center">
                <p className="text-base font-medium leading-none">{user.displayName || user.email?.split('@')[0]}</p>
                <p className="text-sm leading-none text-muted-foreground">{user.email}</p>
            </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem asChild>
             <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
             </Link>
           </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
