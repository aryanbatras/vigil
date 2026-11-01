"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const { signOut } = useClerk();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      aria-label="Sign out"
      onClick={() => signOut({ redirectUrl: "/" })}
    >
      <LogOut />
    </Button>
  );
}
