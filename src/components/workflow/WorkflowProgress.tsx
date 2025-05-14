
import React from "react";
import { Check, CircleEllipsis } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowStep = {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
};

type WorkflowProgressProps = {
  steps: WorkflowStep[];
  className?: string;
};

export function WorkflowProgress({ steps, className }: WorkflowProgressProps) {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="text-sm font-medium">Progresso</div>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step item */}
            <li 
              className={cn(
                "flex items-center",
                index !== steps.length - 1 ? "w-full" : "",
                step.current ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <span 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  step.completed ? "bg-primary text-white" : step.current ? "border-2 border-primary bg-background" : "bg-gray-100"
                )}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : step.current ? (
                  <CircleEllipsis className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span className="ml-2 text-sm whitespace-nowrap">{step.label}</span>
            </li>
            
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "w-full h-0.5 mx-2",
                  steps[index + 1].completed || steps[index].completed ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </ol>
    </div>
  );
}
