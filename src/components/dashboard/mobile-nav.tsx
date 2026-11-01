"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="top-0 left-0 h-svh w-[min(88vw,340px)] max-w-none translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 bg-background p-0"
        showCloseButton={false}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <DialogTitle className="flex items-center gap-3">
            <span className="grid size-7 place-items-center border border-border font-display text-xs font-extrabold text-foreground">
              V
            </span>
            <span className="label-mono text-muted-foreground">Vigil</span>
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close navigation">
              <X />
            </Button>
          </DialogClose>
        </div>
        <div className="p-3">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
