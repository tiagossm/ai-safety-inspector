
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanForm } from "./form/ActionPlanForm";
import { ActionPlanFormData } from "./form/types";

interface ActionPlanTableRowProps {
  plan: ActionPlan;
  handleSaveActionPlan: (data: ActionPlanFormData) => Promise<void>;
}

export function ActionPlanTableRow({ plan, handleSaveActionPlan }: ActionPlanTableRowProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <TableRow key={plan.id}>
      <TableCell>
        <div className="flex items-center">
          {getStatusIcon(plan.status)}
          <span className="ml-2 capitalize">
            {plan.status.replace('_', ' ')}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{plan.description}</div>
      </TableCell>
      <TableCell>{getPriorityBadge(plan.priority)}</TableCell>
      <TableCell>
        {plan.assignee ? (
          <div className="flex items-center">
            <User className="mr-1 h-4 w-4 text-muted-foreground" />
            {plan.assignee}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        {plan.due_date ? (
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
            {format(new Date(plan.due_date), 'MMM d, yyyy')}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No due date</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <ActionPlanForm
            inspectionId={plan.inspection_id}
            questionId={plan.question_id}
            existingPlan={{
              id: plan.id,
              description: plan.description,
              assignee: plan.assignee || '',
              dueDate: plan.due_date ? new Date(plan.due_date) : undefined,
              priority: plan.priority,
              status: plan.status
            }}
            onSave={handleSaveActionPlan}
            trigger={
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
