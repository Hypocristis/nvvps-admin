import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Key, CreditCard, Edit } from "lucide-react";
import type { UserResource } from "@clerk/types";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResource | null;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profil użytkownika</DialogTitle>
          <DialogDescription>Zarządzaj swoim profilem i ustawieniami konta</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <img
              className="h-16 w-16 rounded-full object-cover border-2 border-border"
              src={user?.imageUrl || "/placeholder.svg?height=64&width=64"}
              alt={user?.fullName || "User"}
            />
            <div>
              <h3 className="font-medium">{user?.fullName}</h3>
              <p className="text-sm text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Informacje osobiste</span>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Bezpieczeństwo</span>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="text-sm">Zmiana hasła</span>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Metody płatności</span>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={user?.emailAddresses?.[0]?.emailAddress || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Imię i nazwisko</Label>
            <Input value={user?.fullName || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Data utworzenia konta</Label>
            <Input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pl-PL") : ""} disabled />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Zamknij</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 