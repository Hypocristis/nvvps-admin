import React from 'react';
import { SignOutButton } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Shield, CreditCard } from "lucide-react";

interface UserNavProps {
  user: UserResource | null;
  onProfileClick: () => void;
}

export const UserNav: React.FC<UserNavProps> = ({ user, onProfileClick }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Witaj, {user?.firstName || user?.fullName}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full px-0">
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-border"
                src={user?.imageUrl || "/placeholder.svg?height=40&width=40"}
                alt={user?.fullName || "User"}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Ustawienia</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              <span>Bezpieczeństwo</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Płatności</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton>
                <div className="flex items-center w-full cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj</span>
                </div>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}; 