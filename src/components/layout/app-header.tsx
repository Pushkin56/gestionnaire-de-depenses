
"use client";

import { DollarSign } from 'lucide-react';
import Link from 'next/link';
import UserNav from './user-nav';
import { ThemeToggleButton } from './theme-toggle-button';

interface AppHeaderProps {
  username: string;
}

export default function AppHeader({ username }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="rounded-full bg-primary p-2 text-primary-foreground">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl">Gestionnaire de Dépenses</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggleButton />
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Bienvenue, {username}
          </span>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
