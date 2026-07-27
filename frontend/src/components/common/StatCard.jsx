import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({ label, value, icon: Icon, trend, trendValue, accent = "primary" }) {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning dark:text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={cn(trend === "up" ? "text-success" : "text-destructive", "font-medium")}>
                {trendValue}
              </span>
              <span className="text-muted-foreground">vs mes anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentClasses[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
