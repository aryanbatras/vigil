import { cn } from "@/lib/utils";

type ChainItem = {
  label: string;
  detail: string;
  state: "on" | "off" | "pending";
};

export function StatusChain({
  items,
  className,
}: {
  items: ChainItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid divide-y divide-border overflow-hidden rounded-md border border-border bg-card/45 md:grid-cols-3 md:divide-x md:divide-y-0",
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={item.label} className="flex items-start gap-3 px-4 py-4">
          <span
            className={cn(
              "mt-1 size-2 shrink-0 rounded-full",
              item.state === "on" && "bg-signal text-signal status-dot",
              item.state === "pending" && "bg-warning text-warning status-dot pulse-dot",
              item.state === "off" && "bg-muted-foreground/40",
            )}
          />
          <div className="min-w-0">
            <p className="label-mono text-muted-foreground/55">
              {String(index + 1).padStart(2, "0")} / {item.label}
            </p>
            <p className="mt-1.5 truncate text-sm text-foreground">
              {item.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
