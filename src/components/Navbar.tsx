'use client';  // ✅ REQUIRED for useAuth hook!

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, User, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout, loading } = useAuth();  // ✅ Now works!

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur h-16">
        <div className="container mx-auto flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🏆 Tournaments
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/tournaments">
            <Button variant="ghost">Browse</Button>
          </Link>
          {user ? (
            <>
              <Link href="/tournaments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden md:inline">Hi, {user.email}</span>
              <Button onClick={logout} variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
