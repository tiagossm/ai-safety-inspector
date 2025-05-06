
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanFormContent } from "./ActionPlanFormContent";
import { actionPlanSchema, ActionPlanFormValues, ActionPlanFormData } from "./types";

interface ActionPlanFormProps {
  inspectionId: string;
  questionId: string;
  existingPlan?: {
    id?: string;
    description: string;
    assignee?: string;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  };
  onSave: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
  trigger: React.ReactNode;
}

export function ActionPlanForm({
  inspectionId,
  questionId,
  existingPlan,
  onSave,
  trigger
}: ActionPlanFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ActionPlanFormValues>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      description: existingPlan?.description || "",
      assignee: existingPlan?.assignee || "",
      priority: existingPlan?.priority || "medium",
      status: existingPlan?.status || "pending",
      dueDate: existingPlan?.dueDate,
    },
  });

  const handleSubmit = async (values: ActionPlanFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave({
        id: existingPlan?.id,
        description: values.description,
        assignee: values.assignee,
        dueDate: values.dueDate,
        priority: values.priority,
        status: values.status,
        inspectionId,
        questionId,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error saving action plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{existingPlan?.id ? "Edit" : "Create"} Action Plan</DialogTitle>
          <DialogDescription>
            Create an action plan to address non-conformities in your inspection.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ActionPlanFormContent 
              form={form} 
              isSubmitting={isSubmitting} 
              onCancel={handleCancel} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
