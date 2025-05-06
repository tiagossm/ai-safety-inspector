
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanTableRow } from "./ActionPlanTableRow";
import { ActionPlanForm } from "./form/ActionPlanForm";
import { ActionPlanFormData } from "./form/types";

interface ActionPlanPageTableProps {
  loading: boolean;
  error: string | null;
  filteredPlans: ActionPlan[];
  inspectionId: string | undefined;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  refreshPlans: () => void;
  handleSaveActionPlan: (data: ActionPlanFormData) => Promise<void>;
}

export function ActionPlanPageTable({
  loading,
  error,
  filteredPlans,
  inspectionId,
  searchTerm,
  statusFilter,
  priorityFilter,
  refreshPlans,
  handleSaveActionPlan,
}: ActionPlanPageTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Plans</CardTitle>
        <CardDescription>
          Manage action plans for this inspection
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={refreshPlans} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">No action plans found</p>
            {inspectionId && !searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <ActionPlanForm
                inspectionId={inspectionId}
                questionId="general" // For general action plans not tied to specific questions
                onSave={handleSaveActionPlan}
                trigger={<Button>Create New Action Plan</Button>}
              />
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead className="w-[150px]">Assignee</TableHead>
                  <TableHead className="w-[150px]">Due Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <ActionPlanTableRow 
                    key={plan.id}
                    plan={plan} 
                    handleSaveActionPlan={handleSaveActionPlan} 
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
