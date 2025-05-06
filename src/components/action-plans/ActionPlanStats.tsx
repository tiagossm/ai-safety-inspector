
import React from "react";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ActionPlanStatsCard } from "./ActionPlanStatsCard";

interface ActionPlanStatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function ActionPlanStats({ stats }: ActionPlanStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <ActionPlanStatsCard
        icon={AlertCircle}
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
        title="Pending"
        count={stats.pending}
        total={stats.total}
      />
      <ActionPlanStatsCard
        icon={Clock}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        title="In Progress"
        count={stats.inProgress}
        total={stats.total}
      />
      <ActionPlanStatsCard
        icon={CheckCircle2}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        title="Completed"
        count={stats.completed}
        total={stats.total}
      />
      <ActionPlanStatsCard
        icon={AlertCircle}
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
        title="Critical"
        count={stats.critical}
        total={stats.total}
      />
    </div>
  );
}
