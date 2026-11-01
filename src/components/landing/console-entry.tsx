import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { ArrowUpRight } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConsoleEntryProps = {
  className?: string;
  signedOutLabel?: string;
  signedInLabel?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  textLink?: boolean;
  withArrow?: boolean;
};

export function ConsoleEntry({
  className,
  signedOutLabel = "Open the console",
  signedInLabel = "Enter the console",
  variant = "default",
  size = "default",
  textLink = false,
  withArrow = true,
}: ConsoleEntryProps) {
  const content = (label: string) => (
    <>
      {label}
      {withArrow ? <ArrowUpRight aria-hidden="true" /> : null}
    </>
  );

  if (textLink) {
    return (
      <span className={className}>
        <Show when="signed-out">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-1.5 whitespace-nowrap text-sm underline decoration-current/35 underline-offset-4 transition-colors hover:decoration-current"
          >
            {content(signedOutLabel)}
          </Link>
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1.5 whitespace-nowrap text-sm underline decoration-current/35 underline-offset-4 transition-colors hover:decoration-current"
          >
            {content(signedInLabel)}
          </Link>
        </Show>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex", className)}>
      <Show when="signed-out">
        <Button asChild variant={variant} size={size}>
          <Link href="/sign-up">{content(signedOutLabel)}</Link>
        </Button>
      </Show>
      <Show when="signed-in">
        <Button asChild variant={variant} size={size}>
          <Link href="/dashboard">{content(signedInLabel)}</Link>
        </Button>
      </Show>
    </span>
  );
}
