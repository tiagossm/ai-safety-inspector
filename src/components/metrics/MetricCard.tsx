
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  format?: "number" | "currency" | "percentage";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function MetricCard({
  title,
  value,
  description,
  format = "number",
  trend,
  trendValue
}: MetricCardProps) {
  let formattedValue = value;
  
  if (typeof value === "number") {
    if (format === "currency") {
      formattedValue = formatCurrency(value);
    } else if (format === "percentage") {
      formattedValue = `${value}%`;
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge variant={trend === "up" ? "success" : trend === "down" ? "destructive" : "secondary"} className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trendValue}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
