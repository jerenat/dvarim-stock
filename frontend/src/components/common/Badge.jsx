import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning-foreground border border-warning/30 dark:text-warning",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20",
  primary: "bg-primary/10 text-primary border border-primary/20",
  outline: "border border-border text-foreground",
};

export function Badge({ variant = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
