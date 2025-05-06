
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionPlanEmptyState } from "./ActionPlanEmptyState";
import { ActionPlanSkeleton } from "./ActionPlanSkeleton";
import { ActionPlanTable } from "./ActionPlanTable";
import { ActionPlanWithRelations } from "@/types/action-plan";

interface ActionPlanListProps {
  loading: boolean;
  actionPlans: ActionPlanWithRelations[];
}

export function ActionPlanList({ loading, actionPlans }: ActionPlanListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planos de Ação</CardTitle>
        <CardDescription>
          {actionPlans.length} planos de ação encontrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ActionPlanSkeleton />
        ) : actionPlans.length === 0 ? (
          <ActionPlanEmptyState />
        ) : (
          <ActionPlanTable actionPlans={actionPlans} />
        )}
      </CardContent>
    </Card>
  );
}
