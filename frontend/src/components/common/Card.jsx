import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn("flex items-start justify-between p-6 pb-3", className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn("text-base font-semibold tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ className, children }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function CardContent({ className, children }) {
  return <div className={cn("p-6 pt-3", className)}>{children}</div>;
}
