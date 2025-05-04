
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define schema for action plan form
const actionPlanSchema = z.object({
  description: z.string().min(1, "Description is required"),
  assignee: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  dueDate: z.date().optional(),
});

type ActionPlanFormValues = z.infer<typeof actionPlanSchema>;

export type ActionPlanFormData = {
  inspectionId: string;
  questionId: string;
  id?: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: string;
  status: string;
};

interface ActionPlanFormProps {
  inspectionId: string;
  questionId: string;
  existingPlan?: {
    id?: string;
    description: string;
    assignee?: string;
    dueDate?: Date;
    priority: string;
    status: string;
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
        inspectionId,
        questionId,
        id: existingPlan?.id,
        description: values.description,
        assignee: values.assignee,
        dueDate: values.dueDate,
        priority: values.priority,
        status: values.status,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error saving action plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the action to be taken"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Person responsible for this action"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the person responsible for this action
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When this action needs to be completed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Action Plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
