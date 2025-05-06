import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarIcon,
  User
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanForm } from '@/components/action-plans/form/ActionPlanForm';
import { ActionPlanFormData } from '@/components/action-plans/form/types';

interface ActionPlanSectionProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  actionPlan?: string | ActionPlan;
  onActionPlanChange: (value: string) => void;
  onOpenDialog: () => void;
  hasNegativeResponse: boolean;
}

export function ActionPlanSection({
  isOpen,
  onOpenChange,
  actionPlan,
  onActionPlanChange,
  onOpenDialog,
  hasNegativeResponse
}: ActionPlanSectionProps) {
  if (!isOpen) {
    return null;
  }

  // If actionPlan is just a string, show the simplified view
  if (typeof actionPlan === 'string' || !actionPlan) {
    return (
      <div className="mt-4 pt-4 border-t border-dashed">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" />
            Action Plan
          </h4>
        </div>
        <textarea
          className="w-full border rounded p-2 text-sm"
          placeholder={hasNegativeResponse ? "Describe the actions needed to address this issue..." : "Add notes for follow-up if needed"}
          value={typeof actionPlan === 'string' ? actionPlan : ""}
          onChange={(e) => onActionPlanChange(e.target.value)}
          rows={3}
        />
        
        <div className="mt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onOpenDialog}>
            Use Action Plan Builder
          </Button>
        </div>
      </div>
    );
  }

  // For detailed action plan object
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-dashed">
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center">
              {getStatusIcon(actionPlan.status)}
              <span className="ml-1">Action Plan</span>
            </CardTitle>
            <div className="flex gap-1">
              {getPriorityBadge(actionPlan.priority)}
              <Badge variant="outline" className="capitalize">{actionPlan.status.replace('_', ' ')}</Badge>
            </div>
          </div>
          <CardDescription className="mt-1">
            {actionPlan.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2 px-4">
          {(actionPlan.assignee || actionPlan.due_date) && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
              {actionPlan.assignee && (
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>{actionPlan.assignee}</span>
                </div>
              )}
              {actionPlan.due_date && (
                <div className="flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  <span>{format(new Date(actionPlan.due_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="py-2 px-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onOpenDialog}>
            Edit Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
