"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const items = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/security",
    label: "Security",
    icon: ShieldCheck,
  },
  {
    href: "/dashboard/activity",
    label: "Activity",
    icon: ScrollText,
  },
] as const;

const reference = [
  {
    href: `${site.github}#readme`,
    label: "Setup notes",
    icon: BookOpen,
    external: true,
  },
  {
    href: site.github,
    label: "Source",
    icon: Code2,
    external: true,
  },
] as const;

export function DashboardNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className={cn("flex flex-col gap-8", className)}>
      <div>
        <p className="label-mono px-3 text-muted-foreground/50">Console</p>
        <ul className="mt-3 space-y-1">
          {items.map((item) => {
            const active = isActive(item.href, "exact" in item && item.exact);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      active ? "text-signal" : "text-muted-foreground/70",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                  {active ? (
                    <span className="ml-auto size-1.5 rounded-full bg-signal" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="label-mono px-3 text-muted-foreground/50">Reference</p>
        <ul className="mt-3 space-y-1">
          {reference.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <Icon
                    className="size-4 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                  {item.label}
                  <ArrowUpRight
                    className="ml-auto size-3 text-muted-foreground/40"
                    aria-hidden="true"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
