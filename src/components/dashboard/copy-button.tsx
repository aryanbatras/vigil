"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copy",
  size = "sm",
  variant = "outline",
  className,
}: {
  value: string;
  label?: string;
  size?: "sm" | "default" | "lg" | "icon-sm";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to the clipboard");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy", {
        description: "Select the text and copy it manually.",
      });
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      className={className}
    >
      {copied ? (
        <Check aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}
