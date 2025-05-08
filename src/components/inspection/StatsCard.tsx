
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: number;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  progress,
  variant = "default"
}: StatsCardProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "danger":
        return "bg-red-50 border-red-200";
      default:
        return "bg-white";
    }
  };

  return (
    <Card className={`overflow-hidden ${getVariantClass()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <Badge variant={trend.isPositive ? "default" : "destructive"} className="ml-2">
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </Badge>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-3" />
        )}
      </CardContent>
    </Card>
  );
}
