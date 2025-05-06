
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ActionPlanStatsCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  count: number;
  total: number;
}

export function ActionPlanStatsCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  count,
  total,
}: ActionPlanStatsCardProps) {
  const percentage = Math.round((count / (total || 1)) * 100);

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center text-lg">
          <div className={`${iconBgColor} p-2 rounded-full mr-2`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-muted-foreground text-sm">
          {percentage}% of total
        </p>
      </CardContent>
    </Card>
  );
}
