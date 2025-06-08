
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { FolderOpen, LogOut, Settings, User as UserIcon, Target, Repeat, PiggyBank } from "lucide-react"; // Added PiggyBank icon
import Link from "next/link";

export default function UserNav() {
  const { user, logout } = useAuth();

  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {/* Placeholder for user avatar image if available */}
            {/* <AvatarImage src="/avatars/01.png" alt={user?.username || ""} /> */}
            <AvatarFallback>
                {user?.username ? getInitials(user.username) : <UserIcon size={16}/>}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/categories" passHref>
            <DropdownMenuItem>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Catégories</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/budgets" passHref>
            <DropdownMenuItem>
              <Target className="mr-2 h-4 w-4" />
              <span>Budgets</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/subscriptions" passHref>
            <DropdownMenuItem>
              <Repeat className="mr-2 h-4 w-4" />
              <span>Abonnements</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/saving-goals" passHref>
            <DropdownMenuItem>
              <PiggyBank className="mr-2 h-4 w-4" />
              <span>Objectifs d'Épargne</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/preferences" passHref>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Préférences</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
